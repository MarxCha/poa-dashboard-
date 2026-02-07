"""
Schemas de CFDI
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from app.models.cfdi import TipoCFDI, EstadoCFDI


class CFDIBase(BaseModel):
    uuid: str
    folio: Optional[str] = None
    serie: Optional[str] = None
    tipo_comprobante: TipoCFDI
    emisor_rfc: str
    emisor_nombre: Optional[str] = None
    receptor_rfc: str
    receptor_nombre: Optional[str] = None
    subtotal: Decimal
    total: Decimal
    moneda: str = "MXN"
    fecha_emision: datetime


class CFDICreate(CFDIBase):
    company_id: int
    iva: Optional[Decimal] = 0
    descuento: Optional[Decimal] = 0


class CFDIResponse(CFDIBase):
    id: int
    estado: EstadoCFDI
    iva: Decimal
    fecha_timbrado: Optional[datetime] = None
    uso_cfdi: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CFDIUpload(BaseModel):
    """Schema para upload de XMLs"""
    xml_content: str


class CFDIListResponse(BaseModel):
    total: int
    page: int
    per_page: int
    cfdis: List[CFDIResponse]
