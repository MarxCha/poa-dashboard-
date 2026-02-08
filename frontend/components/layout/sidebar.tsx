'use client'

import {
  Zap,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Brain,
  TrendingUp,
  CreditCard,
  Bell,
  Settings,
  ChevronRight,
  X,
} from 'lucide-react'

interface SidebarProps {
  active: string
  setActive: (id: string) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  satConnected?: boolean
  lastSync?: string | null
  userName?: string
  userRfc?: string
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'cfdis', icon: FileText, label: 'CFDIs' },
  { id: 'semaforo', icon: ShieldCheck, label: 'Semáforo Fiscal' },
  { id: 'cfo', icon: Brain, label: 'CFO Virtual' },
  { id: 'predicciones', icon: TrendingUp, label: 'Predicciones' },
  { id: 'credito', icon: CreditCard, label: 'Crédito' },
]

const bottomItems = [
  { id: 'notificaciones', icon: Bell, label: 'Alertas', badge: 3 },
  { id: 'config', icon: Settings, label: 'Configuración' },
]

export function Sidebar({
  active,
  setActive,
  collapsed,
  setCollapsed,
  satConnected = true,
  lastSync,
  userName = 'Usuario Demo',
  userRfc = 'RFC...',
}: SidebarProps) {
  const formatLastSync = (sync: string | null | undefined) => {
    if (!sync) return 'Nunca'
    const date = new Date(sync)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Hace minutos'
    if (diffHours < 24) return `Hace ${diffHours}h`
    return date.toLocaleDateString('es-MX')
  }

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-[#0a0f1a] border-r border-white/[0.06] flex flex-col z-50 transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-[#0a0f1a]" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span className="text-white font-semibold tracking-tight text-[15px]">
            Sistema POA
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-white/40 hover:text-white/80 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* SAT Status */}
      {!collapsed && (
        <div
          className={`mx-3 mt-4 mb-2 px-3 py-2.5 rounded-lg ${
            satConnected
              ? 'bg-accent-500/[0.08] border border-accent-500/20'
              : 'bg-red-500/[0.08] border border-red-500/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                satConnected ? 'bg-accent-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            <span
              className={`text-[11px] font-medium tracking-wide uppercase ${
                satConnected ? 'text-accent-400' : 'text-red-400'
              }`}
            >
              {satConnected ? 'SAT Conectado' : 'SAT Desconectado'}
            </span>
          </div>
          <p className="text-white/50 text-[11px] mt-1">
            Última sync: {formatLastSync(lastSync)}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 mt-2 px-2 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all
              ${
                active === item.id
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
          >
            <item.icon size={18} strokeWidth={active === item.id ? 2 : 1.5} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-white/[0.06] pt-2">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all
              ${
                active === item.id
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
          >
            <item.icon size={18} strokeWidth={1.5} />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}

        {/* User */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-white/[0.03]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-[11px] font-bold">
              {userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[12px] font-medium truncate">{userName}</p>
              <p className="text-white/30 text-[11px] truncate">{userRfc}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
