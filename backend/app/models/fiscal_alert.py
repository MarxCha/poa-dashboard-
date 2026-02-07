"""
Modelo de Alertas Fiscales (Semáforo)
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class AlertSeverity(str, enum.Enum):
    VERDE = "verde"
    AMARILLO = "amarillo"
    ROJO = "rojo"


class AlertType(str, enum.Enum):
    DECLARACION = "declaracion"
    EFOS = "efos"
    CANCELACION = "cancelacion"
    CONCENTRACION = "concentracion"
    CONCILIACION = "conciliacion"
    LIQUIDEZ = "liquidez"


class FiscalAlert(Base):
    __tablename__ = "fiscal_alerts"

    id = Column(Integer, primary_key=True, index=True)

    # Tipo y severidad
    alert_type = Column(SQLEnum(AlertType), nullable=False)
    severity = Column(SQLEnum(AlertSeverity), nullable=False)

    # Contenido
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    detalle = Column(String(255), nullable=True)

    # Datos relacionados (JSON flexible)
    metadata_json = Column(Text, nullable=True)  # RFC afectado, montos, etc.

    # Estado
    is_resolved = Column(String(20), default="pending")  # pending, resolved, dismissed
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign Keys
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="fiscal_alerts")

    def __repr__(self):
        return f"<FiscalAlert {self.alert_type.value} - {self.severity.value}>"
