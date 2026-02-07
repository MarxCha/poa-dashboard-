"""
Schemas de Empresa
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CompanyBase(BaseModel):
    rfc: str
    razon_social: str
    regimen_fiscal: Optional[str] = None
    codigo_postal: Optional[str] = None
    sector: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyResponse(CompanyBase):
    id: int
    sat_connected: bool
    sat_last_sync: Optional[datetime] = None
    demo_scenario: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CompanyWithStats(CompanyResponse):
    total_cfdis: int = 0
    ingresos_mes: float = 0
    egresos_mes: float = 0
    health_score: int = 0
    alertas_activas: int = 0
