"""
Modelo de CFDI (Comprobante Fiscal Digital por Internet)
"""
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class TipoCFDI(str, enum.Enum):
    INGRESO = "I"
    EGRESO = "E"
    TRASLADO = "T"
    NOMINA = "N"
    PAGO = "P"


class EstadoCFDI(str, enum.Enum):
    VIGENTE = "vigente"
    CANCELADO = "cancelado"


class CFDI(Base):
    __tablename__ = "cfdis"

    id = Column(Integer, primary_key=True, index=True)

    # Identificadores
    uuid = Column(String(36), unique=True, index=True, nullable=False)
    folio = Column(String(50), nullable=True)
    serie = Column(String(25), nullable=True)

    # Tipo y estado
    tipo_comprobante = Column(SQLEnum(TipoCFDI), nullable=False)
    estado = Column(SQLEnum(EstadoCFDI), default=EstadoCFDI.VIGENTE)

    # Emisor
    emisor_rfc = Column(String(13), index=True, nullable=False)
    emisor_nombre = Column(String(255), nullable=True)

    # Receptor
    receptor_rfc = Column(String(13), index=True, nullable=False)
    receptor_nombre = Column(String(255), nullable=True)

    # Montos
    subtotal = Column(Numeric(18, 2), nullable=False)
    descuento = Column(Numeric(18, 2), default=0)
    iva = Column(Numeric(18, 2), default=0)
    isr_retenido = Column(Numeric(18, 2), default=0)
    iva_retenido = Column(Numeric(18, 2), default=0)
    total = Column(Numeric(18, 2), nullable=False)

    # Moneda
    moneda = Column(String(3), default="MXN")
    tipo_cambio = Column(Numeric(10, 4), default=1)

    # Fechas
    fecha_emision = Column(DateTime(timezone=True), nullable=False)
    fecha_timbrado = Column(DateTime(timezone=True), nullable=True)
    fecha_cancelacion = Column(DateTime(timezone=True), nullable=True)

    # Uso CFDI
    uso_cfdi = Column(String(5), nullable=True)
    uso_cfdi_descripcion = Column(String(255), nullable=True)

    # Método y forma de pago
    metodo_pago = Column(String(3), nullable=True)  # PUE, PPD
    forma_pago = Column(String(2), nullable=True)   # 01, 02, etc.

    # XML original (comprimido o referencia a S3)
    xml_content = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign Keys
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="cfdis")

    def __repr__(self):
        return f"<CFDI {self.uuid} - {self.tipo_comprobante.value} ${self.total}>"
