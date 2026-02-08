'use client'

import { AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react'
import { Modal } from '@/components/ui/modal'

interface NoDisponibleModalProps {
  isOpen: boolean
  onClose: () => void
  optionName: string
  score: number
  onNavigateToSemaforo: () => void
}

export function NoDisponibleModal({
  isOpen,
  onClose,
  optionName,
  score,
  onNavigateToSemaforo,
}: NoDisponibleModalProps) {
  const scoreNeeded = 80
  const gap = scoreNeeded - score

  const steps = [
    {
      title: 'Resuelve alertas fiscales',
      description: 'Las alertas amarillas y rojas reducen tu score. Resolverlas puede subir hasta +15 puntos.',
      actionLabel: 'Ir a Semaforo Fiscal',
      onAction: () => {
        onClose()
        onNavigateToSemaforo()
      },
    },
    {
      title: 'Diversifica tu cartera de clientes',
      description: 'Una alta concentracion en pocos clientes es un factor de riesgo. Busca nuevos clientes para mejorar.',
    },
    {
      title: 'Mantén declaraciones al corriente',
      description: 'Las declaraciones atrasadas penalizan el score de cumplimiento fiscal.',
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Producto No Disponible" size="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-medium">{optionName}</p>
            <p className="text-white/50 text-sm mt-1">
              Tu score actual es <span className="text-amber-400 font-semibold">{score}/100</span>.
              Necesitas al menos <span className="text-emerald-400 font-semibold">{scoreNeeded}</span> para acceder a este producto.
              Te faltan <span className="text-white font-semibold">{gap > 0 ? gap : 0} puntos</span>.
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp size={12} />
            Pasos para mejorar tu score
          </h4>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                <p className="text-white text-sm font-medium">{step.title}</p>
                <p className="text-white/40 text-xs mt-1">{step.description}</p>
                {step.onAction && (
                  <button
                    onClick={step.onAction}
                    className="mt-2 flex items-center gap-1 text-emerald-400 text-xs font-medium hover:text-emerald-300 transition-colors"
                  >
                    {step.actionLabel} <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
