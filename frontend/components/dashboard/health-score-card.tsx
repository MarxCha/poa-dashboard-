'use client'

import { ChevronRight } from 'lucide-react'
import { ScoreRing } from '@/components/ui/score-ring'
import { ScoreComponent } from '@/lib/api'

interface HealthScoreCardProps {
  score: number
  components: ScoreComponent[]
}

export function HealthScoreCard({ score, components }: HealthScoreCardProps) {
  return (
    <div className="bg-[#0d1321] rounded-xl border border-white/[0.06] p-5 flex flex-col items-center">
      <h3 className="text-white text-[14px] font-semibold self-start mb-4">
        Score de Salud Financiera
      </h3>
      <ScoreRing score={score} />
      <div className="w-full mt-4 space-y-2">
        {components.slice(0, 4).map((c) => (
          <div key={c.nombre} className="flex items-center justify-between text-[11px]">
            <span className="text-white/40">{c.nombre}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${c.valor}%`,
                    background:
                      c.valor >= 75 ? '#10b981' : c.valor >= 50 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-white/60 w-6 text-right">{c.valor}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-3 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
        Ver desglose completo <ChevronRight size={12} />
      </button>
    </div>
  )
}
