'use client'

interface DemoModeToggleProps {
  currentScenario: 'A' | 'B' | 'C'
  onScenarioChange: (scenario: 'A' | 'B' | 'C') => void
  loading?: boolean
}

const scenarios = [
  { id: 'A' as const, label: 'SME', description: 'Estable' },
  { id: 'B' as const, label: 'Scale-up', description: 'En riesgo' },
  { id: 'C' as const, label: 'Despacho', description: '20 clientes' },
]

export function DemoModeToggle({ currentScenario, onScenarioChange, loading }: DemoModeToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-[#0d1321] rounded-lg border border-white/[0.06]">
      <span className="text-white/40 text-[11px] font-medium px-2">DEMO</span>
      {scenarios.map((s) => (
        <button
          key={s.id}
          onClick={() => onScenarioChange(s.id)}
          disabled={loading}
          className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all
            ${currentScenario === s.id
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
