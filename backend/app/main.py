"""
Sistema POA — API Principal
Capa de Inteligencia Financiera Automatizada
"""
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal

from app.config import settings
from app.database import engine, get_db, Base
from app.models import User, Company, CFDI, FiscalAlert, HealthScore
from app.models.cfdi import TipoCFDI, EstadoCFDI
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
    scenario: Optional[str] = Query(None, regex="^[ABC]$"),
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

    semaforo = [
        SemaforoItem(
            nombre=a.titulo,
            estado=a.severity.value,
            detalle=a.detalle or "",
        )
        for a in alerts
    ]

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
    tipo: Optional[str] = Query(None, regex="^(ingreso|egreso)$"),
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
    scenario: Optional[str] = Query(None, regex="^[ABC]$"),
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
    En MVP usa respuestas predefinidas, luego integrará LLM.
    """
    message_lower = message.lower()

    # Respuestas predefinidas
    responses = {
        "flujo": "Tu flujo de efectivo muestra una **tendencia positiva** este mes. Los ingresos superan a los egresos con un margen saludable del 35.2%. _Datos basados en CFDIs sincronizados._",
        "liquidez": "Tu **riesgo de liquidez actual es bajo-medio**. Tu ratio de cobertura es de 1.54x, lo cual es saludable. _Datos basados en CFDIs sincronizados._",
        "concentración": "Tu **concentración de clientes es moderadamente riesgosa**. El top cliente representa el 32% de ingresos. Se recomienda diversificar. _Datos basados en CFDIs sincronizados._",
        "score": "Tu **Score de Salud Financiera** refleja una situación general buena. Los componentes más fuertes son Cumplimiento fiscal y Tendencia de ingresos. _Datos basados en CFDIs sincronizados._",
    }

    response = "Analicé tus datos financieros. Tu situación general es positiva. ¿Quieres que profundice en algún tema específico como flujo de efectivo, liquidez o concentración de clientes?"

    for key, value in responses.items():
        if key in message_lower:
            response = value
            break

    return {
        "response": response,
        "sources": ["CFDIs sincronizados", "Score de salud"],
        "disclaimer": "Verificar con tu contador para decisiones críticas.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
