'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { CashFlowData, formatMXN } from '@/lib/api'

interface CashFlowChartProps {
  data: CashFlowData[]
  month?: string
}

export function CashFlowChart({ data, month = 'Febrero 2026' }: CashFlowChartProps) {
  return (
    <div className="bg-[#0d1321] rounded-xl border border-white/[0.06] p-5">
      <h3 className="text-white text-[14px] font-semibold mb-4">
        Flujo de Efectivo Estimado — {month}
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="dia"
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
            formatter={(v: number) => formatMXN(v)}
          />
          <Area
            type="monotone"
            dataKey="saldo"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#cashGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
