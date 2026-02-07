"""
Modelo de Empresa (Company)
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    # Datos fiscales
    rfc = Column(String(13), unique=True, index=True, nullable=False)
    razon_social = Column(String(255), nullable=False)
    regimen_fiscal = Column(String(10), nullable=True)  # Clave SAT
    regimen_fiscal_nombre = Column(String(255), nullable=True)
    codigo_postal = Column(String(5), nullable=True)

    # Datos de contacto
    email = Column(String(255), nullable=True)
    telefono = Column(String(20), nullable=True)

    # Conexión SAT
    sat_connected = Column(Boolean, default=False)
    sat_last_sync = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    sector = Column(String(100), nullable=True)
    tamano = Column(String(50), nullable=True)  # micro, pequena, mediana, grande

    # Escenario de demo (A, B, C)
    demo_scenario = Column(String(1), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign Keys
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="companies")
    cfdis = relationship("CFDI", back_populates="company")
    health_scores = relationship("HealthScore", back_populates="company")
    fiscal_alerts = relationship("FiscalAlert", back_populates="company")

    def __repr__(self):
        return f"<Company {self.rfc} - {self.razon_social}>"
