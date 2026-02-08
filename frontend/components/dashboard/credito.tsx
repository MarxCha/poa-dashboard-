'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Star,
  CheckCircle2,
  Shield,
  Users,
  Zap,
  ArrowRight,
  Award,
  TrendingUp,
  Loader2,
  Check,
  Circle,
} from 'lucide-react'
import { CreditData, FinancingOption, formatMXN, getCreditInfo } from '@/lib/api'
import { ScoreRing } from '@/components/ui/score-ring'
import { SolicitarModal } from '@/components/dashboard/solicitar-modal'
import { DetallesPanel } from '@/components/dashboard/detalles-panel'
import { NoDisponibleModal } from '@/components/dashboard/no-disponible-modal'

interface CreditoProps {
  companyId: number
  companyName?: string
  onNavigateToSemaforo?: () => void
}

export function Credito({ companyId, companyName, onNavigateToSemaforo }: CreditoProps) {
  const [data, setData] = useState<CreditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'credito' | 'partners' | 'planes'>('credito')

  // Bloque D states
  const [selectedOption, setSelectedOption] = useState<FinancingOption | null>(null)
  const [showSolicitar, setShowSolicitar] = useState(false)
  const [showDetalles, setShowDetalles] = useState(false)
  const [showNoDisponible, setShowNoDisponible] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getCreditInfo(companyId)
        setData(result)
      } catch (e) {
        console.error('Failed to load credit info:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [companyId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const readinessColors: Record<string, { text: string; bg: string; border: string }> = {
    alta: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    media: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    baja: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  }

  const rc = readinessColors[data.readiness.nivel]

  const partnerLevelColors: Record<string, string> = {
    Bronce: 'from-amber-700 to-amber-500',
    Plata: 'from-gray-400 to-gray-300',
    Oro: 'from-yellow-500 to-amber-400',
  }

  const badgeConfig: Record<string, { label: string; bg: string; border: string; text: string }> = {
    'pre-aprobado': { label: 'Pre-aprobado', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    'disponible': { label: 'Disponible', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    'no disponible': { label: 'No Elegible', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
  }

  const handleOptionClick = (option: FinancingOption) => {
    setSelectedOption(option)
    if (option.estado === 'pre-aprobado') {
      setShowSolicitar(true)
    } else if (option.estado === 'disponible') {
      setShowDetalles(!showDetalles || selectedOption?.nombre !== option.nombre)
    } else {
      setShowNoDisponible(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">
          Credito y Financiamiento
        </h1>
        <p className="text-white/40 text-[13px] mt-1">
          Opciones de financiamiento y programa POA Partners - {companyName}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#0d1321] rounded-lg border border-white/[0.06] w-fit">
        {[
          { id: 'credito' as const, label: 'Financiamiento', icon: CreditCard },
          { id: 'partners' as const, label: 'POA Partners', icon: Users },
          { id: 'planes' as const, label: 'Planes', icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Credit Readiness + Financing */}
      {activeTab === 'credito' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Readiness Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${rc.bg} border ${rc.border} rounded-xl p-6`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl ${rc.bg} border ${rc.border} flex items-center justify-center`}>
                  <Shield size={32} className={rc.text} />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${rc.text}`}>
                    Aptitud Crediticia: {data.readiness.nivel.charAt(0).toUpperCase() + data.readiness.nivel.slice(1)}
                  </h2>
                  <p className="text-white/50 text-sm mt-1">{data.readiness.recommendation}</p>
                </div>
              </div>
              <ScoreRing score={data.readiness.score} size={56} />
            </div>

            {/* Onboarding Steps */}
            <div className="mt-6 flex items-center gap-3">
              {data.onboarding_steps.map((step, i) => (
                <div key={step.paso} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
                    step.completado
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/[0.06] text-white/40 border border-white/[0.08]'
                  }`}>
                    {step.completado ? <Check size={12} /> : <Circle size={12} />}
                    {step.titulo}
                  </div>
                  {i < data.onboarding_steps.length - 1 && (
                    <ArrowRight size={12} className="text-white/20" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Financing Options - Fixed height cards with bottom-aligned buttons */}
          <div className="grid grid-cols-3 gap-4">
            {data.financing_options.map((option, i) => {
              const badge = badgeConfig[option.estado] || badgeConfig['no disponible']
              return (
                <motion.div
                  key={option.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className={`bg-[#0d1321] rounded-xl border p-5 flex flex-col ${
                    option.estado === 'pre-aprobado'
                      ? 'border-emerald-500/30'
                      : option.estado === 'disponible'
                      ? 'border-white/[0.08]'
                      : 'border-white/[0.04] opacity-60'
                  }`}
                >
                  {/* Badge - Always visible */}
                  <div className="flex items-center gap-1 mb-3">
                    <span className={`px-2 py-0.5 rounded-full ${badge.bg} border ${badge.border} ${badge.text} text-[10px] font-medium uppercase tracking-wider`}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold text-sm">{option.nombre}</h3>
                  <p className="text-white/40 text-xs mt-1">por {option.proveedor}</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Monto</span>
                      <span className="text-white/80">{formatMXN(option.monto_min)} - {formatMXN(option.monto_max)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Tasa</span>
                      <span className="text-emerald-400 font-medium">{option.tasa}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Plazo</span>
                      <span className="text-white/80">{option.plazo}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Requisitos</p>
                    {option.requisitos.map((req, j) => (
                      <div key={j} className="flex items-center gap-1.5 text-xs text-white/50 mt-1">
                        <CheckCircle2 size={10} className="text-emerald-400/50" />
                        {req}
                      </div>
                    ))}
                  </div>

                  {/* Button pushed to bottom with mt-auto */}
                  <button
                    onClick={() => handleOptionClick(option)}
                    className={`w-full mt-auto pt-4`}
                  >
                    <span className={`block w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      option.estado === 'pre-aprobado'
                        ? 'bg-emerald-500 text-[#0a0f1a] hover:bg-emerald-400'
                        : option.estado === 'disponible'
                        ? 'bg-transparent border border-white/[0.12] text-white/60 hover:bg-white/[0.06] hover:text-white/80'
                        : 'bg-white/[0.04] border border-white/[0.06] text-white/30 cursor-not-allowed'
                    }`}>
                      {option.estado === 'pre-aprobado' ? 'Solicitar Ahora' : option.estado === 'disponible' ? 'Ver Detalles' : 'No Disponible'}
                    </span>
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Detalles Panel - Expandable below the cards */}
          <DetallesPanel
            isOpen={showDetalles && selectedOption?.estado === 'disponible'}
            onClose={() => setShowDetalles(false)}
            option={selectedOption}
          />
        </motion.div>
      )}

      {/* POA Partners */}
      {activeTab === 'partners' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Current Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#0d1321] to-[#1a1f2e] rounded-xl border border-white/[0.06] p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${partnerLevelColors[data.partners_program.nivel_actual]} flex items-center justify-center`}>
                <Award size={28} className="text-white" />
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider">Tu nivel actual</p>
                <h2 className="text-white text-2xl font-bold">Partner {data.partners_program.nivel_actual}</h2>
              </div>
            </div>
          </motion.div>

          {/* Partner Levels */}
          <div className="grid grid-cols-3 gap-4">
            {data.partners_program.niveles.map((nivel, i) => {
              const isActive = nivel.nombre === data.partners_program.nivel_actual
              return (
                <motion.div
                  key={nivel.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className={`bg-[#0d1321] rounded-xl border p-5 ${
                    isActive ? 'border-emerald-500/30 ring-1 ring-emerald-500/20' : 'border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${partnerLevelColors[nivel.nombre]} flex items-center justify-center`}>
                      <Star size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{nivel.nombre}</h3>
                      <p className="text-white/40 text-xs">{nivel.requisito}</p>
                    </div>
                    {isActive && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                        Actual
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Descuento</span>
                      <span className="text-emerald-400 font-semibold">{nivel.descuento}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Comision referidos</span>
                      <span className="text-violet-400 font-semibold">{nivel.comision_referidos}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] space-y-1.5">
                    {nivel.beneficios.map((b, j) => (
                      <div key={j} className="flex items-start gap-1.5 text-xs text-white/50">
                        <CheckCircle2 size={10} className="text-emerald-400/50 mt-0.5 flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  {nivel.ejemplo && (
                    <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-emerald-400/80 text-[11px]">{nivel.ejemplo}</p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Plans */}
      {activeTab === 'planes' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-3 gap-4">
            {data.plans.map((plan, i) => (
              <motion.div
                key={plan.nombre}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-[#0d1321] rounded-xl border p-6 relative ${
                  plan.popular
                    ? 'border-emerald-500/30 ring-1 ring-emerald-500/20'
                    : plan.es_actual
                    ? 'border-violet-500/30'
                    : 'border-white/[0.06]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-[#0a0f1a] text-[10px] font-bold uppercase tracking-wider">
                      Popular
                    </span>
                  </div>
                )}
                {plan.es_actual && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-violet-500 text-white text-[10px] font-bold uppercase tracking-wider">
                      Plan Actual
                    </span>
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <h3 className="text-white text-lg font-semibold">{plan.nombre}</h3>
                  <div className="mt-2">
                    <span className={`text-3xl font-bold ${plan.precio === 0 ? 'text-emerald-400' : 'text-white'}`}>
                      {plan.precio_label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full mt-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                    plan.es_actual
                      ? 'bg-white/[0.06] border border-white/[0.08] text-white/40 cursor-default'
                      : plan.popular
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-[#0a0f1a]'
                      : 'bg-white/[0.06] border border-white/[0.08] text-white/60 hover:bg-white/[0.1]'
                  }`}
                >
                  {plan.es_actual ? 'Plan Actual' : plan.popular ? 'Actualizar Ahora' : 'Seleccionar'}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Progression Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0d1321] rounded-xl border border-white/[0.06] p-5"
          >
            <h3 className="text-white text-[14px] font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              Ejemplo de Progresion
            </h3>
            <div className="flex items-center gap-4">
              {[
                { label: 'Starter (Gratis)', desc: 'Dashboard basico, primeros 100 CFDIs', time: 'Mes 1-2' },
                { label: 'Profesional ($499)', desc: 'CFO Virtual + alertas fiscales', time: 'Mes 3-5' },
                { label: 'Avanzado ($1,499)', desc: 'Integracion bancaria + predicciones', time: 'Mes 6+' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4 flex-1">
                  <div className="flex-1 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-white text-xs font-medium">{step.label}</p>
                    <p className="text-white/40 text-[10px] mt-1">{step.desc}</p>
                    <p className="text-emerald-400 text-[10px] mt-1">{step.time}</p>
                  </div>
                  {i < 2 && <ArrowRight size={14} className="text-white/20 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modals */}
      {selectedOption && (
        <>
          <SolicitarModal
            isOpen={showSolicitar}
            onClose={() => setShowSolicitar(false)}
            option={selectedOption}
            companyName={companyName}
          />
          <NoDisponibleModal
            isOpen={showNoDisponible}
            onClose={() => setShowNoDisponible(false)}
            optionName={selectedOption.nombre}
            score={data.readiness.score}
            onNavigateToSemaforo={onNavigateToSemaforo || (() => {})}
          />
        </>
      )}
    </div>
  )
}
