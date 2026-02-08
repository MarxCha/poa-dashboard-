'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Calculator, CheckCircle2, ArrowRight, ArrowLeft, PartyPopper } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { FinancingOption, formatMXN } from '@/lib/api'

interface SolicitarModalProps {
  isOpen: boolean
  onClose: () => void
  option: FinancingOption
  companyName?: string
  companyRfc?: string
  ingresosMensuales?: number
}

export function SolicitarModal({
  isOpen,
  onClose,
  option,
  companyName = 'Empresa Demo',
  companyRfc = 'XXX000000XX0',
  ingresosMensuales = 300000,
}: SolicitarModalProps) {
  const [step, setStep] = useState(1)
  const [monto, setMonto] = useState(Math.round((option.monto_min + option.monto_max) / 2))
  const [plazo, setPlazo] = useState(12)
  const [submitted, setSubmitted] = useState(false)

  // Parse tasa from string like "12-18% anual"
  const tasaNum = parseFloat(option.tasa) / 100 / 12 // monthly rate

  // PMT formula: cuota = monto * (r * (1+r)^n) / ((1+r)^n - 1)
  const calcCuota = (m: number, r: number, n: number) => {
    if (r === 0) return m / n
    const factor = Math.pow(1 + r, n)
    return m * (r * factor) / (factor - 1)
  }

  const cuotaMensual = calcCuota(monto, tasaNum, plazo)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setStep(1)
      onClose()
    }, 3000)
  }

  const handleClose = () => {
    setStep(1)
    setSubmitted(false)
    onClose()
  }

  const plazos = [6, 12, 18, 24]

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Solicitar ${option.nombre}`} size="lg">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <PartyPopper size={36} className="text-emerald-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mt-4">Solicitud Enviada</h3>
            <p className="text-white/50 text-sm mt-2 max-w-sm mx-auto">
              Tu solicitud de {formatMXN(monto)} ha sido enviada a {option.proveedor}.
              Recibiras respuesta en 24-48 horas.
            </p>
          </motion.div>
        ) : (
          <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      s <= step
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        : 'bg-white/[0.06] border border-white/[0.08] text-white/30'
                    }`}
                  >
                    {s < step ? <CheckCircle2 size={14} /> : s}
                  </div>
                  {s < 3 && <div className={`flex-1 h-px ${s < step ? 'bg-emerald-500/30' : 'bg-white/[0.08]'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Company Data */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 size={20} className="text-emerald-400" />
                  <h3 className="text-white font-medium">Confirma tus datos</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                    <label className="text-white/40 text-[11px] uppercase tracking-wider">Empresa</label>
                    <p className="text-white text-sm font-medium mt-0.5">{companyName}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                    <label className="text-white/40 text-[11px] uppercase tracking-wider">RFC</label>
                    <p className="text-white text-sm font-medium mt-0.5">{companyRfc}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                    <label className="text-white/40 text-[11px] uppercase tracking-wider">Ingresos Mensuales</label>
                    <p className="text-emerald-400 text-sm font-medium mt-0.5">{formatMXN(ingresosMensuales)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Amount & Term */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-4">
                  <Calculator size={20} className="text-emerald-400" />
                  <h3 className="text-white font-medium">Configura tu credito</h3>
                </div>

                {/* Monto Slider */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-white/60 text-sm">Monto solicitado</label>
                    <span className="text-emerald-400 font-semibold text-lg">{formatMXN(monto)}</span>
                  </div>
                  <input
                    type="range"
                    min={option.monto_min}
                    max={option.monto_max}
                    step={10000}
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/[0.08] accent-emerald-500"
                  />
                  <div className="flex justify-between text-white/30 text-xs mt-1">
                    <span>{formatMXN(option.monto_min)}</span>
                    <span>{formatMXN(option.monto_max)}</span>
                  </div>
                </div>

                {/* Plazo Selector */}
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Plazo</label>
                  <div className="grid grid-cols-4 gap-2">
                    {plazos.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlazo(p)}
                        className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          plazo === p
                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                            : 'bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white/80'
                        }`}
                      >
                        {p} meses
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Payment */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Cuota mensual estimada</p>
                  <p className="text-emerald-400 text-2xl font-bold">{formatMXN(Math.round(cuotaMensual))}</p>
                  <p className="text-white/30 text-xs mt-1">Tasa: {option.tasa} · Total: {formatMXN(Math.round(cuotaMensual * plazo))}</p>
                </div>
              </div>
            )}

            {/* Step 3: Summary */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-white font-medium mb-4">Resumen de solicitud</h3>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
                  {[
                    ['Proveedor', option.proveedor],
                    ['Producto', option.nombre],
                    ['Monto', formatMXN(monto)],
                    ['Plazo', `${plazo} meses`],
                    ['Tasa', option.tasa],
                    ['Cuota mensual', formatMXN(Math.round(cuotaMensual))],
                    ['Total a pagar', formatMXN(Math.round(cuotaMensual * plazo))],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-white/40">{label}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-white/30 text-[11px]">
                  * Esta es una simulacion de demo. En produccion, la solicitud sera procesada por {option.proveedor}.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/50 hover:text-white/80 text-sm transition-colors"
                >
                  <ArrowLeft size={14} /> Anterior
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                >
                  Siguiente <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 text-[#0a0f1a] text-sm font-semibold hover:bg-emerald-400 transition-colors"
                >
                  Enviar Solicitud
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
