"""
Modelo de Score de Salud Financiera
"""
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class HealthScore(Base):
    __tablename__ = "health_scores"

    id = Column(Integer, primary_key=True, index=True)

    # Score general (0-100)
    score_total = Column(Integer, nullable=False)

    # Componentes individuales (0-100 cada uno)
    liquidez = Column(Integer, default=0)
    cumplimiento_fiscal = Column(Integer, default=0)
    diversificacion_clientes = Column(Integer, default=0)
    tendencia_ingresos = Column(Integer, default=0)
    margen_operativo = Column(Integer, default=0)
    estacionalidad = Column(Integer, default=0)
    antiguedad_cxc = Column(Integer, default=0)
    riesgo_proveedores = Column(Integer, default=0)

    # Pesos de cada componente (%)
    peso_liquidez = Column(Integer, default=20)
    peso_cumplimiento = Column(Integer, default=20)
    peso_diversificacion = Column(Integer, default=15)
    peso_tendencia = Column(Integer, default=15)
    peso_margen = Column(Integer, default=10)
    peso_estacionalidad = Column(Integer, default=10)
    peso_cxc = Column(Integer, default=5)
    peso_proveedores = Column(Integer, default=5)

    # Período evaluado
    periodo_inicio = Column(DateTime(timezone=True), nullable=True)
    periodo_fin = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    notas = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Foreign Keys
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="health_scores")

    def __repr__(self):
        return f"<HealthScore {self.score_total}/100 for company_id={self.company_id}>"
