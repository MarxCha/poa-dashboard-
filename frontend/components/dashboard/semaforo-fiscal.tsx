'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Shield,
  FileWarning,
  Users,
  Clock,
  FileCheck,
} from 'lucide-react'

interface SemaforoAlert {
  nombre: string
  estado: 'verde' | 'amarillo' | 'rojo'
  detalle: string
  descripcion?: string
}

interface SemaforoFiscalProps {
  alerts: SemaforoAlert[]
  companyName?: string
}

const statusConfig = {
  verde: {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    label: 'Sin riesgo',
  },
  amarillo: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    label: 'Requiere atención',
  },
  rojo: {
    icon: XCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400',
    label: 'Riesgo alto',
  },
}

const categoryIcons: Record<string, typeof Shield> = {
  efos: Shield,
  concentracion: Users,
  declaracion: FileCheck,
  cancelacion: FileWarning,
  conciliacion: Clock,
}

function getCategoryIcon(nombre: string) {
  const lower = nombre.toLowerCase()
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lower.includes(key)) return icon
  }
  return Shield
}

export function SemaforoFiscal({ alerts, companyName }: SemaforoFiscalProps) {
  const summary = {
    verde: alerts.filter((a) => a.estado === 'verde').length,
    amarillo: alerts.filter((a) => a.estado === 'amarillo').length,
    rojo: alerts.filter((a) => a.estado === 'rojo').length,
  }

  const overallStatus = summary.rojo > 0 ? 'rojo' : summary.amarillo > 0 ? 'amarillo' : 'verde'
  const overallConfig = statusConfig[overallStatus]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">
          Semáforo Fiscal
        </h1>
        <p className="text-white/40 text-[13px] mt-1">
          Estado de cumplimiento y alertas de {companyName || 'la empresa'}
        </p>
      </div>

      {/* Overall Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${overallConfig.bg} border ${overallConfig.border} rounded-xl p-6`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl ${overallConfig.bg} border ${overallConfig.border} flex items-center justify-center`}>
              <overallConfig.icon size={32} className={overallConfig.text} />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${overallConfig.text}`}>
                {overallStatus === 'verde' && 'Cumplimiento Óptimo'}
                {overallStatus === 'amarillo' && 'Alertas Pendientes'}
                {overallStatus === 'rojo' && 'Acción Requerida'}
              </h2>
              <p className="text-white/50 text-sm mt-1">
                {summary.verde} sin riesgo · {summary.amarillo} advertencias · {summary.rojo} críticos
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {(['verde', 'amarillo', 'rojo'] as const).map((status) => (
              <div
                key={status}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusConfig[status].bg} border ${statusConfig[status].border}`}
              >
                <div className={`w-3 h-3 rounded-full ${statusConfig[status].dot}`} />
                <span className={`text-lg font-semibold ${statusConfig[status].text}`}>
                  {summary[status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-2 gap-4">
        {alerts.map((alert, index) => {
          const config = statusConfig[alert.estado]
          const CategoryIcon = getCategoryIcon(alert.nombre)

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${config.bg} border ${config.border} rounded-xl p-5 hover:scale-[1.02] transition-transform cursor-pointer group`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center`}>
                    <CategoryIcon size={18} className={config.text} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{alert.nombre}</h3>
                    <p className={`text-sm ${config.text}`}>{alert.detalle}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${config.bg} border ${config.border}`}>
                  <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <span className={`text-xs font-medium ${config.text}`}>
                    {config.label}
                  </span>
                </div>
              </div>

              {alert.descripcion && (
                <p className="text-white/40 text-sm mt-4 pl-13">
                  {alert.descripcion}
                </p>
              )}

              <div className="flex items-center justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={`text-sm ${config.text} flex items-center gap-1`}>
                  Ver detalles <ChevronRight size={14} />
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-500/30 transition-colors">
          Descargar Reporte PDF
        </button>
        <button className="flex-1 py-3 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 font-medium hover:bg-white/[0.1] transition-colors">
          Programar Revisión
        </button>
      </div>
    </div>
  )
}
