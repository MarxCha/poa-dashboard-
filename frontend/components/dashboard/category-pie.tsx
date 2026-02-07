'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { PieChartData } from '@/lib/api'

interface CategoryPieProps {
  data: PieChartData[]
}

export function CategoryPie({ data }: CategoryPieProps) {
  return (
    <div className="bg-[#0d1321] rounded-xl border border-white/[0.06] p-5">
      <h3 className="text-white text-[14px] font-semibold mb-2">Ingresos por Categoría</h3>
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5 mt-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-2 text-white/50">
              <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="text-white/70 font-medium">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
