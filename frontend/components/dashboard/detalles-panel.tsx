'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { FinancingOption, formatMXN } from '@/lib/api'

interface DetallesPanelProps {
  isOpen: boolean
  onClose: () => void
  option: FinancingOption | null
}

const providerDetails: Record<string, {
  descripcion: string
  requisitos_detallados: { nombre: string; cumple: boolean }[]
  beneficios: string[]
  tasas_desglosadas: { concepto: string; valor: string }[]
}> = {
  'Crédito PyME': {
    descripcion: 'Linea de credito revolvente para capital de trabajo, ideal para cubrir necesidades operativas de corto y mediano plazo.',
    requisitos_detallados: [
      { nombre: '2+ anos de operacion', cumple: true },
      { nombre: 'Ingresos > $200K/mes', cumple: true },
      { nombre: 'Score fiscal > 70', cumple: true },
      { nombre: 'Sin alertas EFOS', cumple: true },
      { nombre: 'Estados financieros auditados', cumple: false },
    ],
    beneficios: [
      'Desembolso en 48 horas',
      'Sin garantia hipotecaria',
      'Tasa preferencial por Score POA',
      'Pre-pago sin penalizacion',
    ],
    tasas_desglosadas: [
      { concepto: 'Tasa anual', valor: '12-18%' },
      { concepto: 'CAT promedio', valor: '22.4%' },
      { concepto: 'Comision apertura', valor: '2%' },
      { concepto: 'Anualidad', valor: '$0' },
    ],
  },
  'Factoraje Digital': {
    descripcion: 'Anticipo de facturas por cobrar. Convierte tus cuentas por cobrar en liquidez inmediata sin endeudarte.',
    requisitos_detallados: [
      { nombre: 'CFDIs vigentes emitidos', cumple: true },
      { nombre: 'Clientes con buen historial', cumple: true },
      { nombre: 'Facturacion > $100K/mes', cumple: true },
      { nombre: 'Score fiscal > 50', cumple: true },
    ],
    beneficios: [
      'Liquidez en 24 horas',
      'No genera deuda',
      'Descuento directo en factura',
      'Proceso 100% digital',
    ],
    tasas_desglosadas: [
      { concepto: 'Descuento por factura', valor: '1.5-3% mensual' },
      { concepto: 'Comision apertura', valor: '$0' },
      { concepto: 'Adelanto', valor: 'Hasta 90% del valor' },
      { concepto: 'Plazo maximo', valor: '120 dias' },
    ],
  },
  'Crédito Empresarial': {
    descripcion: 'Linea de credito a mediano plazo para expansion, adquisicion de activos o proyectos estrategicos.',
    requisitos_detallados: [
      { nombre: '3+ anos de operacion', cumple: true },
      { nombre: 'Ingresos > $500K/mes', cumple: false },
      { nombre: 'Score fiscal > 80', cumple: false },
      { nombre: 'Sin alertas criticas', cumple: true },
      { nombre: 'Plan de negocios', cumple: false },
      { nombre: 'Garantia hipotecaria', cumple: false },
    ],
    beneficios: [
      'Montos hasta $5M MXN',
      'Plazos flexibles',
      'Tasa competitiva',
      'Asesor dedicado',
    ],
    tasas_desglosadas: [
      { concepto: 'Tasa anual', valor: '15-22%' },
      { concepto: 'CAT promedio', valor: '28.1%' },
      { concepto: 'Comision apertura', valor: '2.5%' },
      { concepto: 'Seguro de vida', valor: 'Incluido' },
    ],
  },
}

export function DetallesPanel({ isOpen, onClose, option }: DetallesPanelProps) {
  if (!option) return null

  const details = providerDetails[option.nombre] || providerDetails['Crédito PyME']

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden col-span-3"
        >
          <div className="bg-[#0d1321] border border-white/[0.08] rounded-xl p-6 mt-4">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold">{option.nombre}</h3>
                <p className="text-white/40 text-sm mt-1">por {option.proveedor}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white/60 transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-white/50 text-sm mb-5">{details.descripcion}</p>

            <div className="grid grid-cols-3 gap-5">
              {/* Requisitos */}
              <div>
                <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">Requisitos Detallados</h4>
                <div className="space-y-2">
                  {details.requisitos_detallados.map((req) => (
                    <div key={req.nombre} className="flex items-center gap-2 text-sm">
                      {req.cumple ? (
                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-red-400/60 flex-shrink-0" />
                      )}
                      <span className={req.cumple ? 'text-white/60' : 'text-white/30'}>{req.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Beneficios */}
              <div>
                <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">Beneficios</h4>
                <div className="space-y-2">
                  {details.beneficios.map((ben) => (
                    <div key={ben} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0" />
                      <span className="text-white/60">{ben}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasas */}
              <div>
                <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">Tasas y Comisiones</h4>
                <div className="space-y-2">
                  {details.tasas_desglosadas.map((t) => (
                    <div key={t.concepto} className="flex justify-between text-sm">
                      <span className="text-white/40">{t.concepto}</span>
                      <span className="text-white/80 font-medium">{t.valor}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-emerald-400/80 text-xs">
                    Rango: {formatMXN(option.monto_min)} - {formatMXN(option.monto_max)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
