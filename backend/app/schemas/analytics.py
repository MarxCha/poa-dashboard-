"""
Schemas de Analytics y Dashboard
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class RevenueData(BaseModel):
    mes: str
    ingresos: float
    egresos: float


class CashFlowData(BaseModel):
    dia: str
    saldo: float


class TopClient(BaseModel):
    nombre: str
    rfc: str
    monto: float
    facturas: int
    tendencia: str  # "up" | "down"


class TopProvider(BaseModel):
    nombre: str
    rfc: str
    monto: float
    facturas: int
    tendencia: str


class SemaforoItem(BaseModel):
    nombre: str
    estado: str  # "verde" | "amarillo" | "rojo"
    detalle: str


class ScoreComponent(BaseModel):
    nombre: str
    valor: int
    peso: str


class HealthScoreResponse(BaseModel):
    score_total: int
    componentes: List[ScoreComponent]
    periodo: Optional[str] = None


class PieChartData(BaseModel):
    name: str
    value: float
    color: str


class DashboardStats(BaseModel):
    # KPIs principales
    ingresos_mes: float
    egresos_mes: float
    margen_bruto: float
    health_score: int

    # Variaciones
    ingresos_variacion: float
    egresos_variacion: float
    margen_variacion: float
    score_variacion: int

    # Datos para gráficas
    revenue_data: List[RevenueData]
    cash_flow_data: List[CashFlowData]
    top_clientes: List[TopClient]
    top_proveedores: List[TopProvider]
    ingresos_por_categoria: List[PieChartData]

    # Semáforo fiscal
    semaforo: List[SemaforoItem]

    # Metadata
    total_cfdis: int
    last_sync: Optional[datetime] = None
