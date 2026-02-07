"""
Motor de Semillas Multinivel para Demo
3 Escenarios: SME Estable, Scale-up en Riesgo, Despacho Contable
"""
from datetime import datetime, timedelta
from decimal import Decimal
import random
import uuid
from sqlalchemy.orm import Session
import hashlib

from app.models import User, Company, CFDI, FiscalAlert, HealthScore
from app.models.user import UserRole
from app.models.cfdi import TipoCFDI, EstadoCFDI
from app.models.fiscal_alert import AlertType, AlertSeverity


def hash_password(password: str) -> str:
    """Simple hash for demo purposes"""
    return hashlib.sha256(password.encode()).hexdigest()

# RFCs mexicanos ficticios pero con formato válido
CLIENTES_FICTICIOS = [
    ("Grupo Elektra SA de CV", "GEL930101AB1"),
    ("CEMEX SAB de CV", "CEM920201CD2"),
    ("Bimbo SA de CV", "BIM650301EF3"),
    ("Liverpool SAB de CV", "LIV840101GH4"),
    ("Arca Continental SAB", "ARC010101IJ5"),
    ("Femsa Comercio SA", "FCO850601KL6"),
    ("Grupo Carso SAB", "GCA800101MN7"),
    ("Televisa SA de CV", "TEL720901OP8"),
    ("América Móvil SAB", "AMO000601QR9"),
    ("Walmex SA de CV", "WAL910101ST0"),
]

PROVEEDORES_FICTICIOS = [
    ("Distribuidora Nacional SA", "DNA980301KL6"),
    ("Logística Express MX", "LEM120601MN7"),  # Este será EFOS en escenario B
    ("TechParts de México", "TPM150901OP8"),
    ("Servicios Integrados QR", "SIQ170301QR9"),
    ("Materia Prima del Bajío", "MPB080601ST0"),
    ("Suministros Industriales", "SIN100101UV1"),
    ("Transportes del Norte", "TDN050601WX2"),
    ("Papelería Comercial SA", "PCS120901YZ3"),
]

SCENARIOS = {
    "A": {
        "name": "SME Estable",
        "description": "Pequeña empresa de servicios profesionales con operación sana",
        "rfc": "SME950101ABC",
        "razon_social": "Servicios Profesionales del Centro SA de CV",
        "sector": "Servicios profesionales",
        "health_score": 85,
        "monthly_revenue_range": (280000, 350000),
        "monthly_cfdis": 60,
        "semaforo": "all_green",
    },
    "B": {
        "name": "Scale-up en Riesgo",
        "description": "Empresa de tecnología en crecimiento con alertas de riesgo",
        "rfc": "TEC180501XYZ",
        "razon_social": "Innovación Tecnológica del Pacífico SA de CV",
        "sector": "Tecnología",
        "health_score": 62,
        "monthly_revenue_range": (1200000, 1800000),
        "monthly_cfdis": 250,
        "semaforo": "with_warnings",
    },
    "C": {
        "name": "Despacho Contable",
        "description": "Contador con cartera de 20 clientes",
        "rfc": "DCP100601DEF",
        "razon_social": "Despacho Contable Profesional SC",
        "sector": "Servicios contables",
        "health_score": 78,
        "monthly_revenue_range": (150000, 200000),
        "monthly_cfdis": 80,
        "semaforo": "mixed",
        "is_accountant": True,
        "num_clients": 20,
    },
}


def generate_cfdis_for_company(
    db: Session,
    company: Company,
    months: int = 8,
    monthly_count: int = 60,
    revenue_range: tuple = (280000, 350000),
) -> list[CFDI]:
    """Genera CFDIs realistas para una empresa"""
    cfdis = []
    today = datetime.now()

    for month_offset in range(months):
        month_date = today - timedelta(days=30 * month_offset)
        monthly_revenue = random.uniform(*revenue_range)

        # 70% ingresos, 30% egresos
        num_ingresos = int(monthly_count * 0.7)
        num_egresos = monthly_count - num_ingresos

        # Generar CFDIs de ingreso
        for i in range(num_ingresos):
            cliente = random.choice(CLIENTES_FICTICIOS)
            monto = monthly_revenue / num_ingresos * random.uniform(0.5, 1.5)

            cfdi = CFDI(
                uuid=str(uuid.uuid4()),
                folio=f"A-{1800 + month_offset * monthly_count + i}",
                serie="A",
                tipo_comprobante=TipoCFDI.INGRESO,
                estado=EstadoCFDI.VIGENTE if random.random() > 0.02 else EstadoCFDI.CANCELADO,
                emisor_rfc=company.rfc,
                emisor_nombre=company.razon_social,
                receptor_rfc=cliente[1],
                receptor_nombre=cliente[0],
                subtotal=Decimal(str(round(monto / 1.16, 2))),
                iva=Decimal(str(round(monto / 1.16 * 0.16, 2))),
                total=Decimal(str(round(monto, 2))),
                moneda="MXN",
                fecha_emision=month_date - timedelta(days=random.randint(0, 28)),
                fecha_timbrado=month_date - timedelta(days=random.randint(0, 28)),
                uso_cfdi="G03",
                uso_cfdi_descripcion="Gastos en general",
                metodo_pago="PUE",
                forma_pago="03",
                company_id=company.id,
            )
            cfdis.append(cfdi)

        # Generar CFDIs de egreso
        for i in range(num_egresos):
            proveedor = random.choice(PROVEEDORES_FICTICIOS)
            monto = (monthly_revenue * 0.65) / num_egresos * random.uniform(0.5, 1.5)

            cfdi = CFDI(
                uuid=str(uuid.uuid4()),
                folio=f"B-{900 + month_offset * num_egresos + i}",
                serie="B",
                tipo_comprobante=TipoCFDI.EGRESO,
                estado=EstadoCFDI.VIGENTE,
                emisor_rfc=proveedor[1],
                emisor_nombre=proveedor[0],
                receptor_rfc=company.rfc,
                receptor_nombre=company.razon_social,
                subtotal=Decimal(str(round(monto / 1.16, 2))),
                iva=Decimal(str(round(monto / 1.16 * 0.16, 2))),
                total=Decimal(str(round(monto, 2))),
                moneda="MXN",
                fecha_emision=month_date - timedelta(days=random.randint(0, 28)),
                fecha_timbrado=month_date - timedelta(days=random.randint(0, 28)),
                uso_cfdi="G03",
                metodo_pago="PUE",
                forma_pago="03",
                company_id=company.id,
            )
            cfdis.append(cfdi)

    db.add_all(cfdis)
    return cfdis


def generate_health_score(db: Session, company: Company, score: int) -> HealthScore:
    """Genera un score de salud financiera"""
    # Distribuir el score en componentes
    variance = 15
    hs = HealthScore(
        company_id=company.id,
        score_total=score,
        liquidez=min(100, max(0, score + random.randint(-variance, variance))),
        cumplimiento_fiscal=min(100, max(0, score + random.randint(-5, 15))),
        diversificacion_clientes=min(100, max(0, score + random.randint(-20, 10))),
        tendencia_ingresos=min(100, max(0, score + random.randint(-10, 15))),
        margen_operativo=min(100, max(0, score + random.randint(-15, 10))),
        estacionalidad=min(100, max(0, score + random.randint(-15, 5))),
        antiguedad_cxc=min(100, max(0, score + random.randint(-10, 10))),
        riesgo_proveedores=min(100, max(0, score + random.randint(-5, 15))),
        periodo_inicio=datetime.now() - timedelta(days=240),
        periodo_fin=datetime.now(),
    )
    db.add(hs)
    return hs


def generate_fiscal_alerts(db: Session, company: Company, scenario: str) -> list[FiscalAlert]:
    """Genera alertas fiscales según el escenario"""
    alerts = []

    # Alertas base (siempre verdes)
    base_alerts = [
        (AlertType.DECLARACION, AlertSeverity.VERDE, "Declaraciones al corriente", "Última: Enero 2026"),
        (AlertType.CANCELACION, AlertSeverity.VERDE, "CFDIs sin cancelar indebidamente", "0 CFDIs irregulares"),
        (AlertType.CONCILIACION, AlertSeverity.VERDE, "Diferencias en conciliación", "$0 diferencias detectadas"),
    ]

    for alert_type, severity, titulo, detalle in base_alerts:
        alert = FiscalAlert(
            company_id=company.id,
            alert_type=alert_type,
            severity=severity,
            titulo=titulo,
            detalle=detalle,
        )
        alerts.append(alert)

    # Alertas específicas por escenario
    if scenario == "A":
        # SME: Todo verde
        alerts.append(FiscalAlert(
            company_id=company.id,
            alert_type=AlertType.EFOS,
            severity=AlertSeverity.VERDE,
            titulo="Sin proveedores EFOS",
            detalle="0 proveedores en lista negra",
        ))
        alerts.append(FiscalAlert(
            company_id=company.id,
            alert_type=AlertType.CONCENTRACION,
            severity=AlertSeverity.VERDE,
            titulo="Diversificación de clientes",
            detalle="Top cliente = 18% ingresos",
        ))

    elif scenario == "B":
        # Scale-up: Alertas amarillas
        alerts.append(FiscalAlert(
            company_id=company.id,
            alert_type=AlertType.EFOS,
            severity=AlertSeverity.AMARILLO,
            titulo="Proveedor en revisión EFOS",
            detalle="Logística Express MX (LEM120601MN7) en lista Art. 69-B",
            descripcion="El proveedor aparece en la lista de presuntos publicada el 15 de enero 2026. Tienes 16 CFDIs recibidos por un total de $520,000 MXN.",
        ))
        alerts.append(FiscalAlert(
            company_id=company.id,
            alert_type=AlertType.CONCENTRACION,
            severity=AlertSeverity.AMARILLO,
            titulo="Alta concentración de clientes",
            detalle="Top cliente = 32% ingresos",
            descripcion="Se recomienda diversificar la cartera de clientes para reducir riesgo.",
        ))

    elif scenario == "C":
        # Despacho: Mix
        alerts.append(FiscalAlert(
            company_id=company.id,
            alert_type=AlertType.EFOS,
            severity=AlertSeverity.VERDE,
            titulo="Sin proveedores EFOS",
            detalle="0 proveedores en lista negra",
        ))
        alerts.append(FiscalAlert(
            company_id=company.id,
            alert_type=AlertType.CONCENTRACION,
            severity=AlertSeverity.AMARILLO,
            titulo="Concentración moderada",
            detalle="Top cliente = 25% ingresos",
        ))

    db.add_all(alerts)
    return alerts


def seed_database(db: Session, scenario: str = None) -> dict:
    """
    Siembra la base de datos con datos de demo.

    Args:
        db: Sesión de SQLAlchemy
        scenario: "A", "B", "C" o None para todos

    Returns:
        Diccionario con estadísticas de seeding
    """
    stats = {"users": 0, "companies": 0, "cfdis": 0, "alerts": 0, "scores": 0}

    scenarios_to_seed = [scenario] if scenario else ["A", "B", "C"]

    for sc in scenarios_to_seed:
        config = SCENARIOS[sc]

        # Crear usuario
        user = User(
            email=f"demo_{sc.lower()}@poa.mx",
            hashed_password=hash_password("demo123"),
            full_name=f"Usuario Demo {config['name']}",
            role=UserRole.ACCOUNTANT if config.get("is_accountant") else UserRole.OWNER,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.flush()
        stats["users"] += 1

        # Crear empresa principal
        company = Company(
            rfc=config["rfc"],
            razon_social=config["razon_social"],
            regimen_fiscal="601",
            regimen_fiscal_nombre="General de Ley Personas Morales",
            codigo_postal="06600",
            sector=config["sector"],
            tamano="mediana" if sc == "B" else "pequena",
            sat_connected=True,
            sat_last_sync=datetime.now() - timedelta(hours=2),
            demo_scenario=sc,
            owner_id=user.id,
        )
        db.add(company)
        db.flush()
        stats["companies"] += 1

        # Generar CFDIs
        cfdis = generate_cfdis_for_company(
            db,
            company,
            months=8,
            monthly_count=config["monthly_cfdis"],
            revenue_range=config["monthly_revenue_range"],
        )
        stats["cfdis"] += len(cfdis)

        # Generar Score
        generate_health_score(db, company, config["health_score"])
        stats["scores"] += 1

        # Generar Alertas
        alerts = generate_fiscal_alerts(db, company, sc)
        stats["alerts"] += len(alerts)

        # Si es despacho, crear clientes adicionales
        if config.get("is_accountant"):
            for i in range(config["num_clients"]):
                client_company = Company(
                    rfc=f"CLI{sc}{i:02d}0101XY{i}",
                    razon_social=f"Cliente {i+1} del Despacho",
                    regimen_fiscal="601",
                    codigo_postal="06600",
                    sector="Comercio",
                    tamano="micro",
                    sat_connected=True,
                    sat_last_sync=datetime.now() - timedelta(hours=random.randint(1, 48)),
                    demo_scenario=sc,
                    owner_id=user.id,
                )
                db.add(client_company)
                db.flush()
                stats["companies"] += 1

                # CFDIs para cada cliente
                client_cfdis = generate_cfdis_for_company(
                    db,
                    client_company,
                    months=8,
                    monthly_count=random.randint(20, 80),
                    revenue_range=(50000, 500000),
                )
                stats["cfdis"] += len(client_cfdis)

                # Score aleatorio
                generate_health_score(db, client_company, random.randint(45, 92))
                stats["scores"] += 1

    db.commit()
    return stats
