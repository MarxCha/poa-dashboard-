'use client'

import { motion } from 'framer-motion'
import { Lightbulb, ArrowRight, ShieldCheck, Users, TrendingUp } from 'lucide-react'

interface Recommendation {
  icon: typeof Lightbulb
  text: string
  action: string
  view: string
  color: string
}

interface RecommendationsBannerProps {
  healthScore: number
  semaforo: { estado: string }[]
  onNavigate: (view: string) => void
}

export function RecommendationsBanner({ healthScore, semaforo, onNavigate }: RecommendationsBannerProps) {
  const hasRedAlerts = semaforo.some((s) => s.estado === 'rojo')
  const hasYellowAlerts = semaforo.some((s) => s.estado === 'amarillo')

  const recommendations: Recommendation[] = []

  if (hasRedAlerts) {
    recommendations.push({
      icon: ShieldCheck,
      text: 'Tienes alertas criticas en tu semaforo fiscal',
      action: 'Revisar alertas',
      view: 'semaforo',
      color: 'text-red-400',
    })
  } else if (hasYellowAlerts) {
    recommendations.push({
      icon: ShieldCheck,
      text: 'Revisa tus alertas fiscales pendientes',
      action: 'Ver semaforo',
      view: 'semaforo',
      color: 'text-amber-400',
    })
  }

  if (healthScore < 70) {
    recommendations.push({
      icon: TrendingUp,
      text: `Tu score de salud (${healthScore}/100) puede mejorar`,
      action: 'Ver predicciones',
      view: 'predicciones',
      color: 'text-amber-400',
    })
  }

  if (healthScore >= 70 && !hasRedAlerts && !hasYellowAlerts) {
    recommendations.push({
      icon: Users,
      text: 'Tu empresa esta saludable — explora opciones de credito',
      action: 'Ver financiamiento',
      view: 'credito',
      color: 'text-emerald-400',
    })
  }

  if (recommendations.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0d1321]/80 border border-white/[0.06] rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={14} className="text-accent-400" />
        <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium">Recomendaciones</span>
      </div>
      <div className="flex gap-3">
        {recommendations.map((rec, i) => (
          <button
            key={i}
            onClick={() => onNavigate(rec.view)}
            className="flex-1 flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] transition-all group"
          >
            <rec.icon size={16} className={rec.color} />
            <span className="text-white/60 text-xs flex-1 text-left">{rec.text}</span>
            <span className="text-accent-400 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {rec.action} <ArrowRight size={10} />
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
