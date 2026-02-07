"""
Schemas Pydantic para validación y serialización
"""
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.schemas.company import CompanyCreate, CompanyResponse, CompanyWithStats
from app.schemas.cfdi import CFDICreate, CFDIResponse, CFDIUpload
from app.schemas.analytics import (
    DashboardStats,
    RevenueData,
    TopClient,
    TopProvider,
    CashFlowData,
    SemaforoItem,
    HealthScoreResponse,
)

__all__ = [
    "UserCreate", "UserResponse", "UserLogin",
    "CompanyCreate", "CompanyResponse", "CompanyWithStats",
    "CFDICreate", "CFDIResponse", "CFDIUpload",
    "DashboardStats", "RevenueData", "TopClient", "TopProvider",
    "CashFlowData", "SemaforoItem", "HealthScoreResponse",
]
