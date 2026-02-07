'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { RevenueData, formatMXN } from '@/lib/api'

interface RevenueChartProps {
  data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-[#0d1321] rounded-xl border border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white text-[14px] font-semibold">Ingresos vs. Egresos</h3>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Ingresos
          </span>
          <span className="flex items-center gap-1.5 text-white/40">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/50" /> Egresos
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={3}>
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
            tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
          />
          <Tooltip
            contentStyle={{
              background: '#151d2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
            formatter={(v: number) => formatMXN(v)}
          />
          <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="egresos" fill="rgba(6,182,212,0.4)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
