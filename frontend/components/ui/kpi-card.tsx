'use client'

import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface KPICardProps {
  icon: LucideIcon
  label: string
  value: string
  change?: string
  positive?: boolean
  accent: 'emerald' | 'cyan' | 'violet' | 'amber'
}

const accents = {
  emerald: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    icon: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
  violet: {
    bg: 'bg-violet-500/10',
    icon: 'text-violet-400',
    border: 'border-violet-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    border: 'border-amber-500/20',
  },
}

export function KPICard({ icon: Icon, label, value, change, positive, accent }: KPICardProps) {
  const a = accents[accent]

  return (
    <div className="bg-[#0d1321] rounded-xl border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all group">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${a.bg} border ${a.border} flex items-center justify-center`}>
          <Icon size={18} className={a.icon} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-[12px] font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </div>
        )}
      </div>
      <p className="text-white/40 text-[12px] mt-4 font-medium tracking-wide">{label}</p>
      <p className="text-white text-[22px] font-semibold mt-1 tracking-tight">{value}</p>
    </div>
  )
}
