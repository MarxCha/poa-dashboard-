'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Calendar,
  Shield,
  Loader2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { PredictionsData, formatMXN, getPredictions } from '@/lib/api'

interface PrediccionesProps {
  companyId: number
  companyName?: string
}

export function Predicciones({ companyId, companyName }: PrediccionesProps) {
  const [data, setData] = useState<PredictionsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getPredictions(companyId)
        setData(result)
      } catch (e) {
        console.error('Failed to load predictions:', e)
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

  const riskColors: Record<string, string> = {
    bajo: 'text-emerald-400',
    medio: 'text-amber-400',
    alto: 'text-red-400',
  }

  const riskBg: Record<string, string> = {
    bajo: 'bg-emerald-500/10 border-emerald-500/30',
    medio: 'bg-amber-500/10 border-amber-500/30',
    alto: 'bg-red-500/10 border-red-500/30',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">
          Predicciones Financieras
        </h1>
        <p className="text-white/40 text-[13px] mt-1">
          Proyecciones basadas en {companyName} - Modelos predictivos con datos de CFDIs
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0d1321]/80 border border-white/[0.06] rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-white/40 text-[11px] uppercase tracking-wide">Ingresos 3M</p>
          <p className="text-white text-xl font-semibold mt-1">
            {formatMXN(data.kpis.ingresos_3m)}
          </p>
          <p className="text-emerald-400 text-[11px] mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> Tendencia {data.kpis.revenue_trend}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0d1321]/80 border border-white/[0.06] rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <TrendingDown size={16} className="text-cyan-400" />
            </div>
          </div>
          <p className="text-white/40 text-[11px] uppercase tracking-wide">Egresos 3M</p>
          <p className="text-white text-xl font-semibold mt-1">
            {formatMXN(data.kpis.egresos_3m)}
          </p>
          <p className="text-cyan-400 text-[11px] mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> Tendencia {data.kpis.expense_trend}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0d1321]/80 border border-white/[0.06] rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <BarChart3 size={16} className="text-violet-400" />
            </div>
          </div>
          <p className="text-white/40 text-[11px] uppercase tracking-wide">Flujo Neto 3M</p>
          <p className={`text-xl font-semibold mt-1 ${data.kpis.flujo_neto_3m >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatMXN(data.kpis.flujo_neto_3m)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`border rounded-xl p-4 ${riskBg[data.risk_assessment.nivel]}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-9 h-9 rounded-lg ${riskBg[data.risk_assessment.nivel]} flex items-center justify-center`}>
              <Shield size={16} className={riskColors[data.risk_assessment.nivel]} />
            </div>
          </div>
          <p className="text-white/40 text-[11px] uppercase tracking-wide">Riesgo</p>
          <p className={`text-xl font-semibold mt-1 capitalize ${riskColors[data.risk_assessment.nivel]}`}>
            {data.risk_assessment.nivel}
          </p>
          <p className="text-white/40 text-[11px] mt-1">
            {data.kpis.meses_riesgo} meses con alerta
          </p>
        </motion.div>
      </div>

      {/* Projections Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#0d1321] rounded-xl border border-white/[0.06] p-5"
      >
        <h3 className="text-white text-[14px] font-semibold mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-emerald-400" />
          Proyecciones Mensuales
        </h3>

        <div className="overflow-hidden rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-white/40 text-[11px] uppercase tracking-wide py-3 px-4">Mes</th>
                <th className="text-right text-white/40 text-[11px] uppercase tracking-wide py-3 px-4">Ingresos</th>
                <th className="text-right text-white/40 text-[11px] uppercase tracking-wide py-3 px-4">Egresos</th>
                <th className="text-right text-white/40 text-[11px] uppercase tracking-wide py-3 px-4">Flujo Neto</th>
                <th className="text-center text-white/40 text-[11px] uppercase tracking-wide py-3 px-4">Confianza</th>
                <th className="text-center text-white/40 text-[11px] uppercase tracking-wide py-3 px-4">Alerta</th>
              </tr>
            </thead>
            <tbody>
              {data.projections.map((proj, i) => (
                <motion.tr
                  key={proj.mes}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-4 text-white text-sm font-medium">{proj.mes}</td>
                  <td className="py-3 px-4 text-emerald-400 text-sm text-right font-medium">
                    {formatMXN(proj.ingresos_proyectados)}
                  </td>
                  <td className="py-3 px-4 text-cyan-400 text-sm text-right font-medium">
                    {formatMXN(proj.egresos_proyectados)}
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-semibold ${proj.flujo_neto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatMXN(proj.flujo_neto)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{ width: `${proj.confianza}%` }}
                        />
                      </div>
                      <span className="text-white/50 text-xs">{proj.confianza}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {proj.alerta ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px]">
                        <AlertTriangle size={10} /> {proj.alerta}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px]">
                        <CheckCircle2 size={10} /> OK
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Projection Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#0d1321] rounded-xl border border-white/[0.06] p-5"
        >
          <h3 className="text-white text-[14px] font-semibold mb-4">Flujo Neto Proyectado</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  background: '#151d2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(v: number) => formatMXN(v)}
              />
              <Bar dataKey="flujo_neto" radius={[4, 4, 0, 0]}>
                {data.projections.map((entry, i) => (
                  <Cell key={i} fill={entry.flujo_neto >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Seasonality */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#0d1321] rounded-xl border border-white/[0.06] p-5"
        >
          <h3 className="text-white text-[14px] font-semibold mb-4">Estacionalidad Anual</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {data.seasonality.map((month, i) => {
              const isCurrentMonth = i === 1 // Feb
              return (
                <div
                  key={month.mes}
                  className={`flex items-center gap-3 p-2 rounded-lg ${isCurrentMonth ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-white/[0.02]'} transition-colors`}
                >
                  <span className={`text-xs font-medium w-8 ${isCurrentMonth ? 'text-emerald-400' : 'text-white/50'}`}>
                    {month.mes}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${month.factor >= 1.0 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(month.factor * 80, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs w-10 text-right ${month.factor >= 1.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {month.factor >= 1.0 ? '+' : ''}{((month.factor - 1) * 100).toFixed(0)}%
                  </span>
                  <span className="text-white/30 text-[10px] w-40 truncate">{month.nota}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Risk Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`border rounded-xl p-5 ${riskBg[data.risk_assessment.nivel]}`}
      >
        <h3 className={`text-[14px] font-semibold mb-3 ${riskColors[data.risk_assessment.nivel]}`}>
          Evaluacion de Riesgo: {data.risk_assessment.nivel.charAt(0).toUpperCase() + data.risk_assessment.nivel.slice(1)}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {data.risk_assessment.factores.map((factor, i) => (
            <div key={i} className="flex items-start gap-2">
              <ArrowRight size={14} className={`mt-0.5 ${riskColors[data.risk_assessment.nivel]}`} />
              <span className="text-white/60 text-sm">{factor}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
