'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CircleDollarSign,
  Receipt,
  Scale,
  Gauge,
  Calendar,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Mic,
  MicOff,
} from 'lucide-react'

import { Sidebar } from '@/components/layout/sidebar'
import { DemoModeToggle } from '@/components/ui/demo-mode-toggle'
import { DraggableKPIGrid } from '@/components/ui/draggable-kpi-grid'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { CashFlowChart } from '@/components/dashboard/cashflow-chart'
import { CategoryPie } from '@/components/dashboard/category-pie'
import { TopList } from '@/components/dashboard/top-list'
import { HealthScoreCard } from '@/components/dashboard/health-score-card'
import { SemaforoFiscal } from '@/components/dashboard/semaforo-fiscal'
import { CFOVirtual } from '@/components/dashboard/cfo-virtual'
import { XMLDropZone } from '@/components/dashboard/xml-drop-zone'
import { Predicciones } from '@/components/dashboard/predicciones'
import { Credito } from '@/components/dashboard/credito'
import { Configuracion } from '@/components/dashboard/configuracion'
import { CFDIsTable } from '@/components/dashboard/cfdis-table'
import { RecommendationsBanner } from '@/components/dashboard/recommendations-banner'
import { LoginScreen } from '@/components/auth/login-screen'
import { useVoiceCommands } from '@/hooks/use-voice-commands'

import {
  checkHealth,
  seedDatabase,
  getCompanies,
  getDashboardStats,
  getHealthScore,
  sendCFOMessage,
  formatMXN,
  authGetMe,
  DashboardStats,
  Company,
  ScoreComponent,
  AuthUser,
} from '@/lib/api'

type Scenario = 'A' | 'B' | 'C'
type View = 'dashboard' | 'cfdis' | 'semaforo' | 'cfo' | 'predicciones' | 'credito' | 'config'

export default function Home() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('poa_token')
    const savedUser = localStorage.getItem('poa_user')
    if (token && savedUser) {
      setAuthUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    } else if (localStorage.getItem('poa_demo_mode') === 'true') {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [])

  const handleLogin = (token: string, user: AuthUser) => {
    setAuthUser(user)
    setIsAuthenticated(true)
  }

  const handleSkipAuth = () => {
    localStorage.setItem('poa_demo_mode', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('poa_token')
    localStorage.removeItem('poa_user')
    localStorage.removeItem('poa_demo_mode')
    setAuthUser(null)
    setIsAuthenticated(false)
  }

  // UI State
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Data State
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiConnected, setApiConnected] = useState(false)
  const [hasData, setHasData] = useState(false)

  // Dashboard Data
  const [currentScenario, setCurrentScenario] = useState<Scenario>('A')
  const [companies, setCompanies] = useState<Company[]>([])
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [scoreComponents, setScoreComponents] = useState<ScoreComponent[]>([])

  // Voice commands
  const { isListening, isSupported, startListening, stopListening, transcript } =
    useVoiceCommands({
      onCommand: (command, text) => {
        switch (command) {
          case 'mostrar-ingresos':
          case 'mostrar-egresos':
            setActiveView('dashboard')
            break
          case 'abrir-semaforo':
            setActiveView('semaforo')
            break
          case 'abrir-cfo':
            setActiveView('cfo')
            break
          case 'cambiar-escenario-a':
            handleScenarioChange('A')
            break
          case 'cambiar-escenario-b':
            handleScenarioChange('B')
            break
          case 'cambiar-escenario-c':
            handleScenarioChange('C')
            break
          case 'sincronizar-sat':
            // TODO: Implement SAT sync
            break
        }
      },
    })

  // Check API health on mount
  useEffect(() => {
    const init = async () => {
      try {
        await checkHealth()
        setApiConnected(true)

        // Try to get companies
        const companyList = await getCompanies()
        if (companyList.length > 0) {
          setHasData(true)
          setCompanies(companyList)

          // Find company for scenario A by default
          const scenarioCompany = companyList.find((c) => c.demo_scenario === 'A')
          if (scenarioCompany) {
            setCurrentCompany(scenarioCompany)
            await loadDashboard(scenarioCompany.id)
          }
        }
      } catch (e) {
        setError('No se puede conectar con el backend. Ejecuta: docker-compose up')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Load dashboard data
  const loadDashboard = async (companyId: number) => {
    try {
      const [stats, health] = await Promise.all([
        getDashboardStats(companyId),
        getHealthScore(companyId),
      ])
      setDashboardStats(stats)
      setScoreComponents(health.componentes)
    } catch (e) {
      console.error('Failed to load dashboard:', e)
    }
  }

  // Handle scenario change
  const handleScenarioChange = useCallback(async (scenario: Scenario) => {
    setCurrentScenario(scenario)
    setLoading(true)

    try {
      const companyList = await getCompanies(scenario)
      if (companyList.length > 0) {
        const company = companyList[0]
        setCurrentCompany(company)
        await loadDashboard(company.id)
      }
    } catch (e) {
      console.error('Failed to change scenario:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Seed database
  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedDatabase()
      // Reload data
      const companyList = await getCompanies()
      setCompanies(companyList)
      setHasData(true)

      const scenarioCompany = companyList.find((c) => c.demo_scenario === 'A')
      if (scenarioCompany) {
        setCurrentCompany(scenarioCompany)
        await loadDashboard(scenarioCompany.id)
      }
    } catch (e) {
      console.error('Failed to seed:', e)
      setError('Error al sembrar datos')
    } finally {
      setSeeding(false)
    }
  }

  // Handle CFO messages
  const handleCFOMessage = async (message: string) => {
    if (!currentCompany) throw new Error('No company selected')
    return sendCFOMessage(message, currentCompany.id)
  }

  // KPI items for draggable grid
  const kpiItems = dashboardStats
    ? [
        {
          id: 'ingresos',
          icon: CircleDollarSign,
          label: 'INGRESOS (MES)',
          value: formatMXN(dashboardStats.ingresos_mes),
          change: `${dashboardStats.ingresos_variacion > 0 ? '+' : ''}${dashboardStats.ingresos_variacion}%`,
          positive: dashboardStats.ingresos_variacion > 0,
          accent: 'emerald' as const,
        },
        {
          id: 'egresos',
          icon: Receipt,
          label: 'EGRESOS (MES)',
          value: formatMXN(dashboardStats.egresos_mes),
          change: `${dashboardStats.egresos_variacion}%`,
          positive: dashboardStats.egresos_variacion < 0,
          accent: 'cyan' as const,
        },
        {
          id: 'margen',
          icon: Scale,
          label: 'MARGEN BRUTO',
          value: `${dashboardStats.margen_bruto}%`,
          change: `+${dashboardStats.margen_variacion}pp`,
          positive: dashboardStats.margen_variacion > 0,
          accent: 'violet' as const,
        },
        {
          id: 'score',
          icon: Gauge,
          label: 'SCORE DE SALUD',
          value: `${dashboardStats.health_score}/100`,
          change: `+${dashboardStats.score_variacion} pts`,
          positive: dashboardStats.score_variacion > 0,
          accent: 'amber' as const,
        },
      ]
    : []

  // Auth gate
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      </div>
    )
  }

  if (isAuthenticated === false) {
    return <LoginScreen onLogin={handleLogin} onSkip={handleSkipAuth} />
  }

  // Loading state
  if (loading && !dashboardStats) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 text-accent-400 animate-spin mx-auto" />
          <p className="text-white/40 mt-4">Cargando Sistema POA...</p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error && !apiConnected) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md text-center"
        >
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-white text-lg font-semibold mt-4">Backend no disponible</h2>
          <p className="text-white/50 text-sm mt-2">{error}</p>
          <code className="block mt-4 bg-white/5 p-3 rounded-lg text-accent-400 text-sm">
            docker-compose up -d
          </code>
        </motion.div>
      </div>
    )
  }

  // No data state
  if (!hasData) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0d1321] border border-white/[0.06] rounded-xl p-8 max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mx-auto">
            <RefreshCw className={`w-8 h-8 text-accent-400 ${seeding ? 'animate-spin' : ''}`} />
          </div>
          <h2 className="text-white text-lg font-semibold mt-4">Base de datos vacía</h2>
          <p className="text-white/50 text-sm mt-2">
            Genera datos de demo para los 3 escenarios de usuario.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="mt-6 px-6 py-3 rounded-lg bg-accent-500 hover:bg-accent-400 text-[#0a0f1a] font-semibold transition-colors disabled:opacity-50"
          >
            {seeding ? 'Generando...' : 'Sembrar Datos de Demo'}
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <Sidebar
        active={activeView}
        setActive={(v) => setActiveView(v as View)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        satConnected={currentCompany?.sat_connected}
        lastSync={dashboardStats?.last_sync}
        userName={authUser?.full_name || currentCompany?.razon_social?.split(' ').slice(0, 2).join(' ')}
        userRfc={currentCompany?.rfc}
        onLogout={handleLogout}
      />

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[68px]' : 'ml-[240px]'
        } p-5`}
      >
        {/* Voice Command Indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-full bg-accent-500/20 border border-accent-500/30"
            >
              <div className="w-3 h-3 rounded-full bg-accent-400 animate-pulse" />
              <span className="text-accent-400 text-sm font-medium">
                {transcript || 'Escuchando...'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard View */}
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && dashboardStats && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[22px] font-semibold text-white tracking-tight">
                    Inteligencia Financiera
                  </h1>
                  <p className="text-white/40 text-[13px] mt-1">
                    Datos derivados de {dashboardStats.total_cfdis.toLocaleString()} CFDIs ·{' '}
                    {currentCompany?.razon_social}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Voice Control Button */}
                  {isSupported && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`p-2 rounded-lg border transition-colors ${
                        isListening
                          ? 'bg-accent-500/20 border-accent-500/30 text-accent-400'
                          : 'bg-white/[0.06] border-white/[0.08] text-white/60 hover:bg-white/[0.1]'
                      }`}
                      title="Comandos de voz"
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                  )}

                  <DemoModeToggle
                    currentScenario={currentScenario}
                    onScenarioChange={handleScenarioChange}
                    loading={loading}
                  />
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60 text-[13px] hover:bg-white/[0.1] transition-colors">
                    <Calendar size={14} /> Últimos 8 meses
                    <ChevronDown size={14} />
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500/20 border border-accent-500/30 text-accent-400 text-[13px] hover:bg-accent-500/30 transition-colors">
                    <RefreshCw size={14} /> Sincronizar SAT
                  </button>
                </div>
              </div>

              {/* Recommendations Banner */}
              <RecommendationsBanner
                healthScore={dashboardStats.health_score}
                semaforo={dashboardStats.semaforo}
                onNavigate={(view) => setActiveView(view as View)}
              />

              {/* Draggable KPI Grid */}
              <DraggableKPIGrid items={kpiItems} />

              {/* Charts Row 1 */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="col-span-2"
                >
                  <RevenueChart data={dashboardStats.revenue_data} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <HealthScoreCard
                    score={dashboardStats.health_score}
                    components={scoreComponents}
                  />
                </motion.div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="col-span-2"
                >
                  <CashFlowChart data={dashboardStats.cash_flow_data} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <CategoryPie data={dashboardStats.ingresos_por_categoria} />
                </motion.div>
              </div>

              {/* Top Lists */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <TopList
                    title="Top Clientes"
                    items={dashboardStats.top_clientes}
                    type="clientes"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <TopList
                    title="Top Proveedores"
                    items={dashboardStats.top_proveedores}
                    type="proveedores"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* CFDIs View - XML Drop Zone */}
          {activeView === 'cfdis' && (
            <motion.div
              key="cfdis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-[22px] font-semibold text-white tracking-tight">
                  Gestión de CFDIs
                </h1>
                <p className="text-white/40 text-[13px] mt-1">
                  Carga y administra tus comprobantes fiscales digitales
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-white font-medium">Cargar CFDIs</h2>
                  <XMLDropZone />
                </div>

                <div className="space-y-4">
                  <h2 className="text-white font-medium">Resumen</h2>
                  <div className="bg-[#0d1321]/80 border border-white/[0.06] rounded-xl p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-white/60">Total CFDIs</span>
                      <span className="text-white font-semibold">
                        {dashboardStats?.total_cfdis.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Ingresos (mes)</span>
                      <span className="text-emerald-400 font-semibold">
                        {formatMXN(dashboardStats?.ingresos_mes || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Egresos (mes)</span>
                      <span className="text-cyan-400 font-semibold">
                        {formatMXN(dashboardStats?.egresos_mes || 0)}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-white/[0.06]">
                      <p className="text-white/40 text-xs">
                        Última sincronización: {dashboardStats?.last_sync || 'Nunca'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CFDIs Table */}
              {currentCompany && (
                <CFDIsTable companyId={currentCompany.id} />
              )}
            </motion.div>
          )}

          {/* Semáforo Fiscal View */}
          {activeView === 'semaforo' && dashboardStats && (
            <motion.div
              key="semaforo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SemaforoFiscal
                alerts={dashboardStats.semaforo}
                companyName={currentCompany?.razon_social}
                onNavigate={(view) => setActiveView(view as View)}
              />
            </motion.div>
          )}

          {/* CFO Virtual View */}
          {activeView === 'cfo' && currentCompany && (
            <motion.div
              key="cfo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CFOVirtual
                companyId={currentCompany.id}
                companyName={currentCompany.razon_social}
                onSendMessage={handleCFOMessage}
              />
            </motion.div>
          )}

          {/* Predicciones View */}
          {activeView === 'predicciones' && currentCompany && (
            <motion.div
              key="predicciones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Predicciones
                companyId={currentCompany.id}
                companyName={currentCompany.razon_social}
              />
            </motion.div>
          )}

          {/* Crédito View */}
          {activeView === 'credito' && currentCompany && (
            <motion.div
              key="credito"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Credito
                companyId={currentCompany.id}
                companyName={currentCompany.razon_social}
                onNavigateToSemaforo={() => setActiveView('semaforo')}
              />
            </motion.div>
          )}

          {/* Configuración View */}
          {activeView === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Configuracion />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
