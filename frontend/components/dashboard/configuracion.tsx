'use client'

import { motion } from 'framer-motion'
import { Palette, Check } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'

export function Configuracion() {
  const { theme: currentTheme, setTheme, themes } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">
          Configuración
        </h1>
        <p className="text-white/40 text-[13px] mt-1">
          Personaliza la apariencia de tu dashboard
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0d1321] border border-white/[0.06] rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent-500/20 border border-accent-500/30 flex items-center justify-center">
            <Palette size={18} className="text-accent-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Tema de Color</h2>
            <p className="text-white/40 text-sm">Selecciona el esquema de colores para tu dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {themes.map((t, i) => {
            const isActive = t.id === currentTheme.id
            return (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setTheme(t.id)}
                className={`relative group p-4 rounded-xl border transition-all text-left ${
                  isActive
                    ? 'border-white/20 bg-white/[0.06] ring-1 ring-white/10'
                    : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03]'
                }`}
              >
                {/* Color Preview */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: t.preview }}
                  />
                  <div
                    className="w-4 h-4 rounded-md opacity-60"
                    style={{ backgroundColor: t.preview }}
                  />
                  <div
                    className="w-3 h-3 rounded opacity-30"
                    style={{ backgroundColor: t.preview }}
                  />
                </div>

                {/* Preview bar */}
                <div className="h-1.5 rounded-full mb-3 overflow-hidden flex gap-0.5">
                  <div className="flex-[3] rounded-full" style={{ backgroundColor: t.preview }} />
                  <div className="flex-[2] rounded-full opacity-50" style={{ backgroundColor: t.preview }} />
                  <div className="flex-1 rounded-full opacity-20" style={{ backgroundColor: t.preview }} />
                </div>

                <h3 className="text-white text-sm font-medium">{t.name}</h3>
                <p className="text-white/30 text-[11px] mt-0.5">{t.description}</p>

                {/* Active Checkmark */}
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#0d1321] border border-white/[0.06] rounded-xl p-6"
      >
        <h3 className="text-white font-semibold mb-4">Vista previa</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-accent-500/10 border border-accent-500/30">
            <p className="text-accent-400 text-sm font-medium">Boton Primario</p>
            <button className="mt-2 px-4 py-2 rounded-lg bg-accent-500 text-[#0a0f1a] text-sm font-semibold">
              Accion
            </button>
          </div>
          <div className="p-4 rounded-lg bg-accent-500/10 border border-accent-500/30">
            <p className="text-accent-400 text-sm font-medium">Boton Outline</p>
            <button className="mt-2 px-4 py-2 rounded-lg border border-accent-500/30 text-accent-400 text-sm font-medium">
              Secundario
            </button>
          </div>
          <div className="p-4 rounded-lg bg-accent-500/10 border border-accent-500/30">
            <p className="text-accent-400 text-sm font-medium">Badges y Tags</p>
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-0.5 rounded-full bg-accent-500/20 border border-accent-500/30 text-accent-400 text-[10px] font-medium">
                Activo
              </span>
              <span className="px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400/60 text-[10px]">
                Info
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
