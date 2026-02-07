'use client'

import { TopClient, TopProvider, formatMXN } from '@/lib/api'

interface TopListProps {
  title: string
  items: (TopClient | TopProvider)[]
  type: 'clientes' | 'proveedores'
}

export function TopList({ title, items, type }: TopListProps) {
  const accentColor = type === 'clientes' ? 'emerald' : 'cyan'

  return (
    <div className="bg-[#0d1321] rounded-xl border border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-[14px] font-semibold">{title}</h3>
        <span className="text-[11px] text-white/30">Últimos 8 meses</span>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.rfc} className="flex items-center gap-3 group">
            <span className="text-[11px] text-white/20 w-4">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-white text-[12px] font-medium truncate group-hover:text-${accentColor}-400 transition-colors`}>
                {item.nombre}
              </p>
              <p className="text-white/30 text-[10px]">
                {item.rfc} · {item.facturas} facturas
              </p>
            </div>
            <div className="text-right">
              <p className="text-white text-[12px] font-medium">{formatMXN(item.monto)}</p>
              <span
                className={`text-[10px] ${
                  type === 'clientes'
                    ? item.tendencia === 'up'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                    : item.tendencia === 'up'
                    ? 'text-red-400'
                    : 'text-emerald-400'
                }`}
              >
                {item.tendencia === 'up' ? '↑' : '↓'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
