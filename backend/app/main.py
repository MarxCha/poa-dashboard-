"""
Sistema POA — API Principal
Capa de Inteligencia Financiera Automatizada
"""
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal
from jose import JWTError, jwt
import bcrypt
import json

from app.config import settings
from app.database import engine, get_db, Base
from app.models import User, Company, CFDI, FiscalAlert, HealthScore
from app.models.cfdi import TipoCFDI, EstadoCFDI
from app.models.user import UserRole
from app.schemas.analytics import (
    DashboardStats,
    RevenueData,
    TopClient,
    TopProvider,
    CashFlowData,
    SemaforoItem,
    HealthScoreResponse,
    ScoreComponent,
    PieChartData,
)
from app.schemas.company import CompanyResponse, CompanyWithStats
from app.schemas.cfdi import CFDIResponse, CFDIListResponse
from app.seeds import seed_database, SCENARIOS
from app.models.fiscal_alert import AlertSeverity

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Capa de Inteligencia Financiera Automatizada para PyMEs mexicanas",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════
# Auth Utilities
# ═══════════════════════════════════════════════

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Returns current user or None (non-blocking for public endpoints)."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            return None
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        return None
    return db.query(User).filter(User.id == user_id).first()


def require_auth(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Strict auth dependency — raises 401 if not authenticated."""
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuario no encontrado o inactivo")
    return user


# ═══════════════════════════════════════════════
# Auth Endpoints
# ═══════════════════════════════════════════════

@app.post("/api/auth/register")
def register(
    email: str = Query(...),
    password: str = Query(..., min_length=6),
    full_name: str = Query(...),
    db: Session = Depends(get_db),
):
    """Registrar nuevo usuario."""
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=UserRole.OWNER,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
        },
    }


@app.post("/api/auth/login")
def login(
    email: str = Query(...),
    password: str = Query(...),
    db: Session = Depends(get_db),
):
    """Iniciar sesión y obtener token JWT."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Cuenta desactivada")

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
        },
    }


@app.get("/api/auth/me")
def get_me(current_user: User = Depends(require_auth)):
    """Obtener perfil del usuario autenticado."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


# ═══════════════════════════════════════════════
# Health Check
# ═══════════════════════════════════════════════

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


# ═══════════════════════════════════════════════
# Seeding Endpoints
# ═══════════════════════════════════════════════

@app.post("/api/seed")
def seed_demo_data(
    scenario: Optional[str] = Query(None, pattern="^[ABC]$"),
    db: Session = Depends(get_db),
):
    """
    Siembra datos de demo.
    - scenario=A: SME Estable
    - scenario=B: Scale-up en Riesgo
    - scenario=C: Despacho Contable
    - Sin parámetro: Todos los escenarios
    """
    try:
        stats = seed_database(db, scenario)
        return {
            "message": f"Datos de demo creados exitosamente",
            "scenario": scenario or "all",
            "stats": stats,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/scenarios")
def get_scenarios():
    """Retorna información sobre los escenarios disponibles"""
    return SCENARIOS


# ═══════════════════════════════════════════════
# Dashboard Endpoints
# ═══════════════════════════════════════════════

@app.get("/api/dashboard/{company_id}", response_model=DashboardStats)
def get_dashboard_stats(company_id: int, db: Session = Depends(get_db)):
    """Obtiene estadísticas del dashboard para una empresa"""

    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    today = datetime.now()
    current_month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)

    # Calcular ingresos del mes actual
    ingresos_mes = db.query(func.sum(CFDI.total)).filter(
        CFDI.company_id == company_id,
        CFDI.tipo_comprobante == TipoCFDI.INGRESO,
        CFDI.emisor_rfc == company.rfc,
        CFDI.fecha_emision >= current_month_start,
        CFDI.estado == EstadoCFDI.VIGENTE,
    ).scalar() or Decimal(0)

    # Calcular egresos del mes actual
    egresos_mes = db.query(func.sum(CFDI.total)).filter(
        CFDI.company_id == company_id,
        CFDI.tipo_comprobante == TipoCFDI.EGRESO,
        CFDI.fecha_emision >= current_month_start,
        CFDI.estado == EstadoCFDI.VIGENTE,
    ).scalar() or Decimal(0)

    # Ingresos mes anterior para variación
    ingresos_anterior = db.query(func.sum(CFDI.total)).filter(
        CFDI.company_id == company_id,
        CFDI.tipo_comprobante == TipoCFDI.INGRESO,
        CFDI.emisor_rfc == company.rfc,
        CFDI.fecha_emision >= last_month_start,
        CFDI.fecha_emision < current_month_start,
        CFDI.estado == EstadoCFDI.VIGENTE,
    ).scalar() or Decimal(1)

    # Margen bruto
    margen = float((ingresos_mes - egresos_mes) / ingresos_mes * 100) if ingresos_mes > 0 else 0

    # Health Score
    health = db.query(HealthScore).filter(
        HealthScore.company_id == company_id
    ).order_by(desc(HealthScore.created_at)).first()

    # Revenue data (últimos 8 meses)
    revenue_data = []
    for i in range(7, -1, -1):
        month_start = (today - timedelta(days=30 * i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1)

        ing = db.query(func.sum(CFDI.total)).filter(
            CFDI.company_id == company_id,
            CFDI.tipo_comprobante == TipoCFDI.INGRESO,
            CFDI.emisor_rfc == company.rfc,
            CFDI.fecha_emision >= month_start,
            CFDI.fecha_emision < month_end,
        ).scalar() or 0

        egr = db.query(func.sum(CFDI.total)).filter(
            CFDI.company_id == company_id,
            CFDI.tipo_comprobante == TipoCFDI.EGRESO,
            CFDI.fecha_emision >= month_start,
            CFDI.fecha_emision < month_end,
        ).scalar() or 0

        revenue_data.append(RevenueData(
            mes=month_start.strftime("%b"),
            ingresos=float(ing),
            egresos=float(egr),
        ))

    # Top clientes
    top_clientes_query = db.query(
        CFDI.receptor_rfc,
        CFDI.receptor_nombre,
        func.sum(CFDI.total).label("total"),
        func.count(CFDI.id).label("count"),
    ).filter(
        CFDI.company_id == company_id,
        CFDI.tipo_comprobante == TipoCFDI.INGRESO,
        CFDI.emisor_rfc == company.rfc,
    ).group_by(CFDI.receptor_rfc, CFDI.receptor_nombre).order_by(
        desc("total")
    ).limit(5).all()

    top_clientes = [
        TopClient(
            nombre=c.receptor_nombre or c.receptor_rfc,
            rfc=c.receptor_rfc,
            monto=float(c.total),
            facturas=c.count,
            tendencia="up" if i % 2 == 0 else "down",
        )
        for i, c in enumerate(top_clientes_query)
    ]

    # Top proveedores
    top_proveedores_query = db.query(
        CFDI.emisor_rfc,
        CFDI.emisor_nombre,
        func.sum(CFDI.total).label("total"),
        func.count(CFDI.id).label("count"),
    ).filter(
        CFDI.company_id == company_id,
        CFDI.tipo_comprobante == TipoCFDI.EGRESO,
    ).group_by(CFDI.emisor_rfc, CFDI.emisor_nombre).order_by(
        desc("total")
    ).limit(5).all()

    top_proveedores = [
        TopProvider(
            nombre=p.emisor_nombre or p.emisor_rfc,
            rfc=p.emisor_rfc,
            monto=float(p.total),
            facturas=p.count,
            tendencia="up" if i % 2 == 1 else "down",
        )
        for i, p in enumerate(top_proveedores_query)
    ]

    # Semáforo fiscal
    alerts = db.query(FiscalAlert).filter(
        FiscalAlert.company_id == company_id
    ).all()

    semaforo = []
    for a in alerts:
        meta = {}
        if a.metadata_json:
            try:
                meta = json.loads(a.metadata_json)
            except (json.JSONDecodeError, TypeError):
                pass
        semaforo.append(SemaforoItem(
            nombre=a.titulo,
            estado=a.severity.value,
            detalle=a.detalle or "",
            ejemplo=meta.get("ejemplo"),
            accion_recomendada=meta.get("accion_recomendada"),
        ))

    # Cash flow simulado (para el mes actual)
    cash_flow_data = []
    base_saldo = float(ingresos_mes) * 0.3
    for day in range(1, 32, 3):
        base_saldo += float(ingresos_mes) * 0.02 * (1 + (day / 31) * 0.5)
        cash_flow_data.append(CashFlowData(dia=f"{day:02d}", saldo=base_saldo))

    # Ingresos por categoría (simulado)
    categorias = [
        PieChartData(name="Servicios profesionales", value=42, color="#10b981"),
        PieChartData(name="Productos", value=28, color="#06b6d4"),
        PieChartData(name="Consultoría", value=18, color="#8b5cf6"),
        PieChartData(name="Otros", value=12, color="#f59e0b"),
    ]

    # Total CFDIs
    total_cfdis = db.query(func.count(CFDI.id)).filter(
        CFDI.company_id == company_id
    ).scalar() or 0

    return DashboardStats(
        ingresos_mes=float(ingresos_mes),
        egresos_mes=float(egresos_mes),
        margen_bruto=round(margen, 1),
        health_score=health.score_total if health else 0,
        ingresos_variacion=round(float((ingresos_mes - ingresos_anterior) / ingresos_anterior * 100), 1) if ingresos_anterior else 0,
        egresos_variacion=-3.1,  # Simplificado para demo
        margen_variacion=2.4,
        score_variacion=3,
        revenue_data=revenue_data,
        cash_flow_data=cash_flow_data,
        top_clientes=top_clientes,
        top_proveedores=top_proveedores,
        ingresos_por_categoria=categorias,
        semaforo=semaforo,
        total_cfdis=total_cfdis,
        last_sync=company.sat_last_sync,
    )


# ═══════════════════════════════════════════════
# CFDIs Endpoints
# ═══════════════════════════════════════════════

@app.get("/api/companies/{company_id}/cfdis", response_model=CFDIListResponse)
def get_cfdis(
    company_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    tipo: Optional[str] = Query(None, pattern="^(ingreso|egreso)$"),
    db: Session = Depends(get_db),
):
    """Lista CFDIs de una empresa con paginación y filtros"""

    query = db.query(CFDI).filter(CFDI.company_id == company_id)

    if tipo:
        tipo_enum = TipoCFDI.INGRESO if tipo == "ingreso" else TipoCFDI.EGRESO
        query = query.filter(CFDI.tipo_comprobante == tipo_enum)

    total = query.count()
    cfdis = query.order_by(desc(CFDI.fecha_emision)).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    return CFDIListResponse(
        total=total,
        page=page,
        per_page=per_page,
        cfdis=[CFDIResponse.model_validate(c) for c in cfdis],
    )


# ═══════════════════════════════════════════════
# Health Score Endpoints
# ═══════════════════════════════════════════════

@app.get("/api/companies/{company_id}/health-score", response_model=HealthScoreResponse)
def get_health_score(company_id: int, db: Session = Depends(get_db)):
    """Obtiene el score de salud financiera de una empresa"""

    score = db.query(HealthScore).filter(
        HealthScore.company_id == company_id
    ).order_by(desc(HealthScore.created_at)).first()

    if not score:
        raise HTTPException(status_code=404, detail="Score no encontrado")

    componentes = [
        ScoreComponent(nombre="Liquidez estimada", valor=score.liquidez, peso="20%"),
        ScoreComponent(nombre="Cumplimiento fiscal", valor=score.cumplimiento_fiscal, peso="20%"),
        ScoreComponent(nombre="Diversificación clientes", valor=score.diversificacion_clientes, peso="15%"),
        ScoreComponent(nombre="Tendencia de ingresos", valor=score.tendencia_ingresos, peso="15%"),
        ScoreComponent(nombre="Margen operativo", valor=score.margen_operativo, peso="10%"),
        ScoreComponent(nombre="Estacionalidad controlada", valor=score.estacionalidad, peso="10%"),
        ScoreComponent(nombre="Antigüedad de CxC", valor=score.antiguedad_cxc, peso="5%"),
        ScoreComponent(nombre="Riesgo proveedores", valor=score.riesgo_proveedores, peso="5%"),
    ]

    return HealthScoreResponse(
        score_total=score.score_total,
        componentes=componentes,
        periodo="Jul 2025 – Feb 2026",
    )


# ═══════════════════════════════════════════════
# Companies Endpoints
# ═══════════════════════════════════════════════

@app.get("/api/companies", response_model=list[CompanyWithStats])
def list_companies(
    scenario: Optional[str] = Query(None, pattern="^[ABC]$"),
    db: Session = Depends(get_db),
):
    """Lista todas las empresas, opcionalmente filtradas por escenario"""

    query = db.query(Company)
    if scenario:
        query = query.filter(Company.demo_scenario == scenario)

    companies = query.all()
    result = []

    for c in companies:
        # Calcular stats
        today = datetime.now()
        month_start = today.replace(day=1)

        ingresos = db.query(func.sum(CFDI.total)).filter(
            CFDI.company_id == c.id,
            CFDI.tipo_comprobante == TipoCFDI.INGRESO,
            CFDI.emisor_rfc == c.rfc,
            CFDI.fecha_emision >= month_start,
        ).scalar() or 0

        egresos = db.query(func.sum(CFDI.total)).filter(
            CFDI.company_id == c.id,
            CFDI.tipo_comprobante == TipoCFDI.EGRESO,
            CFDI.fecha_emision >= month_start,
        ).scalar() or 0

        total_cfdis = db.query(func.count(CFDI.id)).filter(
            CFDI.company_id == c.id
        ).scalar() or 0

        health = db.query(HealthScore).filter(
            HealthScore.company_id == c.id
        ).order_by(desc(HealthScore.created_at)).first()

        alertas = db.query(func.count(FiscalAlert.id)).filter(
            FiscalAlert.company_id == c.id,
            FiscalAlert.is_resolved == "pending",
        ).scalar() or 0

        result.append(CompanyWithStats(
            id=c.id,
            rfc=c.rfc,
            razon_social=c.razon_social,
            regimen_fiscal=c.regimen_fiscal,
            codigo_postal=c.codigo_postal,
            sector=c.sector,
            sat_connected=c.sat_connected,
            sat_last_sync=c.sat_last_sync,
            demo_scenario=c.demo_scenario,
            created_at=c.created_at,
            total_cfdis=total_cfdis,
            ingresos_mes=float(ingresos),
            egresos_mes=float(egresos),
            health_score=health.score_total if health else 0,
            alertas_activas=alertas,
        ))

    return result


@app.get("/api/companies/{company_id}", response_model=CompanyWithStats)
def get_company(company_id: int, db: Session = Depends(get_db)):
    """Obtiene detalles de una empresa específica"""

    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    # Calcular stats (similar a list_companies)
    today = datetime.now()
    month_start = today.replace(day=1)

    ingresos = db.query(func.sum(CFDI.total)).filter(
        CFDI.company_id == company_id,
        CFDI.tipo_comprobante == TipoCFDI.INGRESO,
        CFDI.emisor_rfc == company.rfc,
        CFDI.fecha_emision >= month_start,
    ).scalar() or 0

    egresos = db.query(func.sum(CFDI.total)).filter(
        CFDI.company_id == company_id,
        CFDI.tipo_comprobante == TipoCFDI.EGRESO,
        CFDI.fecha_emision >= month_start,
    ).scalar() or 0

    total_cfdis = db.query(func.count(CFDI.id)).filter(
        CFDI.company_id == company_id
    ).scalar() or 0

    health = db.query(HealthScore).filter(
        HealthScore.company_id == company_id
    ).order_by(desc(HealthScore.created_at)).first()

    alertas = db.query(func.count(FiscalAlert.id)).filter(
        FiscalAlert.company_id == company_id,
        FiscalAlert.is_resolved == "pending",
    ).scalar() or 0

    return CompanyWithStats(
        id=company.id,
        rfc=company.rfc,
        razon_social=company.razon_social,
        regimen_fiscal=company.regimen_fiscal,
        codigo_postal=company.codigo_postal,
        sector=company.sector,
        sat_connected=company.sat_connected,
        sat_last_sync=company.sat_last_sync,
        demo_scenario=company.demo_scenario,
        created_at=company.created_at,
        total_cfdis=total_cfdis,
        ingresos_mes=float(ingresos),
        egresos_mes=float(egresos),
        health_score=health.score_total if health else 0,
        alertas_activas=alertas,
    )


# ═══════════════════════════════════════════════
# CFO Virtual Endpoint (Mock para MVP)
# ═══════════════════════════════════════════════

@app.post("/api/cfo/chat")
def cfo_chat(
    message: str = Query(..., min_length=1),
    company_id: int = Query(...),
    db: Session = Depends(get_db),
):
    """
    CFO Virtual - Responde preguntas sobre finanzas.
    Respuestas enriquecidas con datos reales y contexto del task_plan.
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    today = datetime.now()
    month_start = today.replace(day=1)

    ingresos = db.query(func.sum(CFDI.total)).filter(
        CFDI.company_id == company_id,
        CFDI.tipo_comprobante == TipoCFDI.INGRESO,
        CFDI.emisor_rfc == company.rfc,
        CFDI.fecha_emision >= month_start,
    ).scalar() or Decimal(0)

    egresos = db.query(func.sum(CFDI.total)).filter(
        CFDI.company_id == company_id,
        CFDI.tipo_comprobante == TipoCFDI.EGRESO,
        CFDI.fecha_emision >= month_start,
    ).scalar() or Decimal(0)

    health = db.query(HealthScore).filter(
        HealthScore.company_id == company_id
    ).order_by(desc(HealthScore.created_at)).first()

    total_cfdis = db.query(func.count(CFDI.id)).filter(
        CFDI.company_id == company_id
    ).scalar() or 0

    alerts = db.query(FiscalAlert).filter(
        FiscalAlert.company_id == company_id,
        FiscalAlert.severity != AlertSeverity.VERDE,
    ).all()

    margen = float((ingresos - egresos) / ingresos * 100) if ingresos > 0 else 0
    ratio = float(ingresos / egresos) if egresos > 0 else 0

    message_lower = message.lower()

    responses = {
        "flujo": f"Tu flujo de efectivo muestra una **{'tendencia positiva' if margen > 0 else 'tendencia negativa'}** este mes.\n\n"
                 f"- **Ingresos del mes:** ${float(ingresos):,.0f} MXN\n"
                 f"- **Egresos del mes:** ${float(egresos):,.0f} MXN\n"
                 f"- **Margen neto:** {margen:.1f}%\n"
                 f"- **Ratio cobertura:** {ratio:.2f}x\n\n"
                 f"{'Tu margen es saludable (>30%). Mantén esta tendencia.' if margen > 30 else 'Tu margen es ajustado. Considera revisar los egresos principales.'}\n\n"
                 f"_Basado en {total_cfdis:,} CFDIs sincronizados de {company.razon_social}._",

        "liquidez": f"Tu **riesgo de liquidez actual es {'bajo' if ratio > 1.5 else 'medio' if ratio > 1.0 else 'alto'}**.\n\n"
                    f"- **Ratio de cobertura:** {ratio:.2f}x {'(saludable > 1.2x)' if ratio > 1.2 else '(riesgo < 1.2x)'}\n"
                    f"- **Ingresos/Egresos:** ${float(ingresos):,.0f} / ${float(egresos):,.0f}\n\n"
                    f"**Proyección próximos 3 meses:**\n"
                    f"- Mes +1: Flujo neto estimado +${float(ingresos) * 0.15:,.0f}\n"
                    f"- Mes +2: {'Riesgo de iliquidez detectado' if ratio < 1.3 else 'Flujo estable proyectado'}\n"
                    f"- Mes +3: Recuperación esperada\n\n"
                    f"_Datos basados en {total_cfdis:,} CFDIs y tendencias históricas de 8 meses._",

        "concentraci": f"Tu **concentración de clientes es {'alta - riesgo significativo' if company.demo_scenario == 'B' else 'moderada'}**.\n\n"
                       f"{'El top cliente representa el 32% de tus ingresos. Si pierdes este cliente, tu flujo caería significativamente.' if company.demo_scenario == 'B' else 'Tu diversificación es razonable, pero siempre es bueno ampliar la base.'}\n\n"
                       f"**Recomendaciones:**\n"
                       f"1. Ningún cliente debería superar el 20% de ingresos\n"
                       f"2. Busca al menos 2-3 clientes nuevos este trimestre\n"
                       f"3. Diversifica por sector para reducir riesgo sectorial\n\n"
                       f"_Análisis basado en distribución de CFDIs de ingreso._",

        "score": f"Tu **Score de Salud Financiera es {health.score_total if health else 0}/100** {'- Excelente' if health and health.score_total >= 80 else '- Necesita mejora' if health and health.score_total < 65 else '- Bueno'}.\n\n"
                 + (f"**Desglose de componentes:**\n"
                    f"- Liquidez ({health.liquidez}/100, peso 20%): aporta {health.liquidez * 20 // 100} pts\n"
                    f"- Cumplimiento fiscal ({health.cumplimiento_fiscal}/100, peso 20%): aporta {health.cumplimiento_fiscal * 20 // 100} pts\n"
                    f"- Diversificación ({health.diversificacion_clientes}/100, peso 15%): aporta {health.diversificacion_clientes * 15 // 100} pts\n"
                    f"- Tendencia ingresos ({health.tendencia_ingresos}/100, peso 15%): aporta {health.tendencia_ingresos * 15 // 100} pts\n"
                    f"- Margen operativo ({health.margen_operativo}/100, peso 10%): aporta {health.margen_operativo * 10 // 100} pts\n\n"
                    f"**Componente más fuerte:** {'Cumplimiento fiscal' if health.cumplimiento_fiscal >= health.liquidez else 'Liquidez'}\n"
                    f"**Componente más débil:** {'Diversificación' if health.diversificacion_clientes <= health.margen_operativo else 'Margen operativo'}\n"
                    if health else "No hay score disponible aún.\n") +
                 f"\n_Período evaluado: Jul 2025 - Feb 2026._",

        "transporte": f"Hemos observado un **incremento del 15% en gastos de transporte** en los últimos 3 meses.\n\n"
                      f"**Análisis detallado:**\n"
                      f"- Principal proveedor: Transportes del Norte (TDN050601WX2)\n"
                      f"- Incremento mensual promedio: 5.2%\n"
                      f"- Impacto en margen: -2.3 puntos porcentuales\n\n"
                      f"**Impacto en flujo de efectivo:**\n"
                      f"- Reducción estimada del margen de liquidez: 5% para próximo trimestre\n\n"
                      f"**Recomendaciones:**\n"
                      f"1. Renegociar tarifas con proveedor actual\n"
                      f"2. Solicitar cotizaciones a 2-3 alternativas\n"
                      f"3. Evaluar consolidación de envíos para reducir costos\n\n"
                      f"_Análisis basado en CFDIs de egreso con uso_cfdi G03._",

        "gasto": f"**Principales tendencias de gasto (últimos 3 meses):**\n\n"
                 f"1. **Transporte y paquetería:** +15% (proveedor principal: Transportes del Norte)\n"
                 f"2. **Servicios profesionales:** +8% (crecimiento orgánico)\n"
                 f"3. **Suministros:** -3% (renegociación exitosa)\n"
                 f"4. **Materiales:** estable\n\n"
                 f"**Impacto en flujo de efectivo:**\n"
                 f"El incremento en transporte ha reducido tu margen de liquidez proyectado en un 5% para el próximo trimestre.\n\n"
                 f"**Acciones sugeridas:**\n"
                 f"- Renegociar tarifas de transporte\n"
                 f"- Buscar alternativas de paquetería\n"
                 f"- Mantener política actual de suministros\n\n"
                 f"_Datos de {total_cfdis:,} CFDIs procesados._",

        "efos": f"**Estado de proveedores EFOS (Art. 69-B CFF):**\n\n"
                + ("- **Logística Express MX** (LEM120601MN7) aparece en lista de presuntos publicada el 15 de enero 2026\n"
                   "- Tienes 16 CFDIs recibidos por **$520,000 MXN**\n"
                   "- **Acción requerida:** Contactar al proveedor y preparar evidencia de operaciones reales\n\n"
                   "**Riesgo fiscal:**\n"
                   "Si el proveedor es declarado definitivamente EFOS, el SAT podría rechazar la deducibilidad de esos $520,000 MXN.\n"
                   if company.demo_scenario == "B" else
                   "- **Sin proveedores en lista EFOS.** Tu cartera de proveedores está limpia.\n\n") +
                f"_Verificación contra lista Art. 69-B del SAT actualizada._",

        "cancelaci": f"**Estado de CFDIs cancelados:**\n\n"
                     f"- Tasa de cancelación: {'0.8%' if company.demo_scenario == 'A' else '3.2%' if company.demo_scenario == 'B' else '1.5%'}\n"
                     f"- Estado del indicador: {'Verde (< 1%)' if company.demo_scenario == 'A' else 'Amarillo (1-5%)' if company.demo_scenario == 'B' else 'Verde (< 2%)'}\n\n"
                     f"**Umbrales del semáforo:**\n"
                     f"- Verde: 0-1% de cancelaciones\n"
                     f"- Amarillo: 1-5% de cancelaciones\n"
                     f"- Rojo: >5% de cancelaciones\n\n"
                     f"_Basado en CFDIs de los últimos 12 meses._",
    }

    response = (
        f"Analicé los datos financieros de **{company.razon_social}**.\n\n"
        f"**Resumen ejecutivo:**\n"
        f"- Ingresos del mes: ${float(ingresos):,.0f} MXN\n"
        f"- Egresos del mes: ${float(egresos):,.0f} MXN\n"
        f"- Margen bruto: {margen:.1f}%\n"
        f"- Score de salud: {health.score_total if health else 0}/100\n"
        f"- Alertas activas: {len(alerts)}\n\n"
        f"¿Sobre qué tema quieres profundizar? Puedo hablar sobre:\n"
        f"- **Flujo de efectivo** y proyecciones\n"
        f"- **Liquidez** y riesgo\n"
        f"- **Concentración** de clientes\n"
        f"- **Score** de salud financiera\n"
        f"- **Transporte** y tendencias de gasto\n"
        f"- **EFOS** y riesgo de proveedores\n"
        f"- **Cancelaciones** de CFDIs"
    )

    for key, value in responses.items():
        if key in message_lower:
            response = value
            break

    return {
        "response": response,
        "sources": ["CFDIs sincronizados", "Score de salud", "Lista EFOS Art. 69-B"],
        "disclaimer": "Verificar con tu contador para decisiones fiscales críticas.",
    }


# ═══════════════════════════════════════════════
# Predicciones Endpoint
# ═══════════════════════════════════════════════

@app.get("/api/predictions/{company_id}")
def get_predictions(company_id: int, db: Session = Depends(get_db)):
    """Predicciones de flujo de efectivo y tendencias"""

    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    today = datetime.now()
    month_start = today.replace(day=1)

    # Calcular ingresos y egresos de los últimos 3 meses para proyectar
    monthly_data = []
    for i in range(6):
        m_start = (today - timedelta(days=30 * i)).replace(day=1)
        m_end = (m_start + timedelta(days=32)).replace(day=1)

        ing = float(db.query(func.sum(CFDI.total)).filter(
            CFDI.company_id == company_id,
            CFDI.tipo_comprobante == TipoCFDI.INGRESO,
            CFDI.emisor_rfc == company.rfc,
            CFDI.fecha_emision >= m_start,
            CFDI.fecha_emision < m_end,
        ).scalar() or 0)

        egr = float(db.query(func.sum(CFDI.total)).filter(
            CFDI.company_id == company_id,
            CFDI.tipo_comprobante == TipoCFDI.EGRESO,
            CFDI.fecha_emision >= m_start,
            CFDI.fecha_emision < m_end,
        ).scalar() or 0)

        monthly_data.append({"ingresos": ing, "egresos": egr, "neto": ing - egr})

    # Promedio para proyecciones
    avg_ing = sum(m["ingresos"] for m in monthly_data) / max(len(monthly_data), 1)
    avg_egr = sum(m["egresos"] for m in monthly_data) / max(len(monthly_data), 1)

    # Factores de escenario
    if company.demo_scenario == "A":
        factors = [1.02, 1.05, 1.08]
        egr_factors = [0.98, 1.01, 0.99]
    elif company.demo_scenario == "B":
        factors = [0.95, 0.88, 1.15]
        egr_factors = [1.08, 1.15, 1.02]
    else:
        factors = [1.01, 1.03, 1.02]
        egr_factors = [1.0, 1.02, 0.98]

    meses = ["Mar 2026", "Abr 2026", "May 2026"]
    projections = []
    for i, mes in enumerate(meses):
        ing_proj = avg_ing * factors[i]
        egr_proj = avg_egr * egr_factors[i]
        neto = ing_proj - egr_proj
        alert = None
        if neto < 0:
            alert = "Riesgo de Iliquidez"
        elif neto < avg_ing * 0.1:
            alert = "Margen Ajustado"

        projections.append({
            "mes": mes,
            "ingresos_proyectados": round(ing_proj, 0),
            "egresos_proyectados": round(egr_proj, 0),
            "flujo_neto": round(neto, 0),
            "alerta": alert,
            "confianza": 85 - (i * 8),
        })

    # Tendencias
    revenue_trend = "creciente" if factors[2] > 1.0 else "decreciente"
    expense_trend = "creciente" if egr_factors[1] > 1.0 else "decreciente"

    # KPIs de predicción
    total_ing_proj = sum(p["ingresos_proyectados"] for p in projections)
    total_egr_proj = sum(p["egresos_proyectados"] for p in projections)

    # Estacionalidad
    seasonal_months = [
        {"mes": "Ene", "factor": 0.85, "nota": "Inicio lento post-fiestas"},
        {"mes": "Feb", "factor": 0.92, "nota": "Recuperación gradual"},
        {"mes": "Mar", "factor": 1.05, "nota": "Cierre Q1 - pico estacional"},
        {"mes": "Abr", "factor": 0.95, "nota": "Declaración anual - gastos extras"},
        {"mes": "May", "factor": 1.02, "nota": "Estabilización"},
        {"mes": "Jun", "factor": 1.08, "nota": "Cierre Q2 - buen momento"},
        {"mes": "Jul", "factor": 0.90, "nota": "Vacaciones - caída temporal"},
        {"mes": "Ago", "factor": 0.95, "nota": "Recuperación lenta"},
        {"mes": "Sep", "factor": 1.10, "nota": "Cierre Q3 - fuerte"},
        {"mes": "Oct", "factor": 1.05, "nota": "Pre-cierre fiscal"},
        {"mes": "Nov", "factor": 1.15, "nota": "Buen Fin - pico ventas"},
        {"mes": "Dic", "factor": 1.20, "nota": "Cierre fiscal - máximo"},
    ]

    return {
        "projections": projections,
        "kpis": {
            "ingresos_3m": round(total_ing_proj, 0),
            "egresos_3m": round(total_egr_proj, 0),
            "flujo_neto_3m": round(total_ing_proj - total_egr_proj, 0),
            "meses_riesgo": sum(1 for p in projections if p["alerta"]),
            "revenue_trend": revenue_trend,
            "expense_trend": expense_trend,
        },
        "seasonality": seasonal_months,
        "risk_assessment": {
            "nivel": "bajo" if company.demo_scenario == "A" else "medio" if company.demo_scenario == "C" else "alto",
            "factores": [
                f"Tendencia de ingresos: {revenue_trend}",
                f"Tendencia de egresos: {expense_trend}",
                f"{'Sin alertas de liquidez' if company.demo_scenario == 'A' else 'Posible iliquidez en Mes +2' if company.demo_scenario == 'B' else 'Monitorear concentración'}",
            ],
        },
        "company_name": company.razon_social,
    }


# ═══════════════════════════════════════════════
# Crédito Endpoint
# ═══════════════════════════════════════════════

@app.get("/api/credit/{company_id}")
def get_credit_info(company_id: int, db: Session = Depends(get_db)):
    """Información de crédito y programa POA Partners"""

    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    health = db.query(HealthScore).filter(
        HealthScore.company_id == company_id
    ).order_by(desc(HealthScore.created_at)).first()

    score = health.score_total if health else 0

    # Credit readiness basado en score
    if score >= 80:
        readiness = "alta"
        readiness_score = 92
        recommendation = "Excelente perfil crediticio. Pre-aprobado para líneas de crédito."
    elif score >= 65:
        readiness = "media"
        readiness_score = 68
        recommendation = "Buen perfil. Mejora tu diversificación de clientes para acceder a mejores tasas."
    else:
        readiness = "baja"
        readiness_score = 45
        recommendation = "Necesitas mejorar tu salud financiera antes de solicitar crédito."

    # Opciones de financiamiento
    financing_options = [
        {
            "nombre": "Crédito Simple PyME",
            "proveedor": "Konfío",
            "monto_min": 50000,
            "monto_max": 3000000,
            "tasa": "1.8% mensual",
            "plazo": "6-36 meses",
            "requisitos": ["Score POA >= 65", "6+ meses operando", "Sin alertas EFOS"],
            "estado": "pre-aprobado" if score >= 65 else "no disponible",
            "beneficio_partner": "15% comisión sobre monto otorgado",
        },
        {
            "nombre": "Factoraje Digital",
            "proveedor": "Kapital",
            "monto_min": 10000,
            "monto_max": 500000,
            "tasa": "2.2% por operación",
            "plazo": "30-90 días",
            "requisitos": ["Score POA >= 50", "CFDIs vigentes", "Clientes verificados"],
            "estado": "disponible" if score >= 50 else "no disponible",
            "beneficio_partner": "10% comisión",
        },
        {
            "nombre": "Línea de Crédito Revolvente",
            "proveedor": "Credijusto",
            "monto_min": 100000,
            "monto_max": 5000000,
            "tasa": "1.5% mensual",
            "plazo": "12 meses renovable",
            "requisitos": ["Score POA >= 75", "12+ meses operando", "Ingresos > $200K/mes"],
            "estado": "pre-aprobado" if score >= 75 else "no disponible",
            "beneficio_partner": "20% comisión",
        },
    ]

    # POA Partners program
    total_cfdis = db.query(func.count(CFDI.id)).filter(
        CFDI.company_id == company_id
    ).scalar() or 0

    partners_program = {
        "niveles": [
            {
                "nombre": "Bronce",
                "requisito": "5+ clientes en POA",
                "descuento": "10%",
                "comision_referidos": "5%",
                "beneficios": [
                    "Dashboard básico para todos los clientes",
                    "Reportes mensuales consolidados",
                    "Soporte por email",
                ],
            },
            {
                "nombre": "Plata",
                "requisito": "15+ clientes en POA",
                "descuento": "20%",
                "comision_referidos": "10%",
                "beneficios": [
                    "Todo lo de Bronce",
                    "CFO Virtual para cada cliente",
                    "Alertas proactivas",
                    "Soporte prioritario",
                ],
            },
            {
                "nombre": "Oro",
                "requisito": "25+ clientes en POA",
                "descuento": "30%",
                "comision_referidos": "15%",
                "beneficios": [
                    "Todo lo de Plata",
                    "Predicciones de flujo avanzadas",
                    "Acceso a API completa",
                    "Soporte dedicado 24/7",
                    "Comisión por referidos de crédito: $5,000 MXN/mes promedio",
                ],
                "ejemplo": "El 'Despacho Contable Ágil' (25+ clientes) obtiene 30% descuento + $5,000 MXN/mes de comisiones por referidos de crédito.",
            },
        ],
        "nivel_actual": "Oro" if company.demo_scenario == "C" and total_cfdis > 1000 else "Plata" if total_cfdis > 500 else "Bronce",
    }

    # Planes de suscripción
    plans = [
        {
            "nombre": "Starter",
            "precio": 0,
            "precio_label": "Gratis",
            "features": [
                "Dashboard básico",
                "Hasta 100 CFDIs/mes",
                "Score de salud",
                "1 usuario",
            ],
            "es_actual": company.demo_scenario == "A" and score < 70,
        },
        {
            "nombre": "Profesional",
            "precio": 499,
            "precio_label": "$499/mes",
            "features": [
                "Todo lo del Starter",
                "CFO Virtual ilimitado",
                "Semáforo fiscal completo",
                "Alertas proactivas",
                "5 usuarios",
                "Hasta 1,000 CFDIs/mes",
            ],
            "es_actual": company.demo_scenario == "A" and score >= 70,
            "popular": True,
        },
        {
            "nombre": "Avanzado",
            "precio": 1499,
            "precio_label": "$1,499/mes",
            "features": [
                "Todo lo del Profesional",
                "Integración bancaria",
                "Predicciones de flujo",
                "API completa",
                "Usuarios ilimitados",
                "CFDIs ilimitados",
                "Soporte prioritario",
            ],
            "es_actual": company.demo_scenario == "B",
        },
    ]

    return {
        "readiness": {
            "nivel": readiness,
            "score": readiness_score,
            "recommendation": recommendation,
            "health_score": score,
        },
        "financing_options": financing_options,
        "partners_program": partners_program,
        "plans": plans,
        "company_name": company.razon_social,
        "onboarding_steps": [
            {"paso": 1, "titulo": "Registro", "descripcion": "Ingresa email y RFC", "completado": True},
            {"paso": 2, "titulo": "Primer Valor", "descripcion": "Sube tus XMLs y ve tu primer score en 30 segundos", "completado": True},
            {"paso": 3, "titulo": "Dashboard Básico", "descripcion": f"Ves tus ingresos/egresos y Score de {score}/100", "completado": True},
            {"paso": 4, "titulo": "Conectar SAT", "descripcion": "Conecta tu e.firma para predicciones y alertas proactivas", "completado": company.sat_connected},
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
