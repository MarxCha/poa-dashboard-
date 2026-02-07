/**
 * API Client para Sistema POA
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface RevenueData {
  mes: string
  ingresos: number
  egresos: number
}

export interface CashFlowData {
  dia: string
  saldo: number
}

export interface TopClient {
  nombre: string
  rfc: string
  monto: number
  facturas: number
  tendencia: 'up' | 'down'
}

export interface TopProvider {
  nombre: string
  rfc: string
  monto: number
  facturas: number
  tendencia: 'up' | 'down'
}

export interface SemaforoItem {
  nombre: string
  estado: 'verde' | 'amarillo' | 'rojo'
  detalle: string
}

export interface PieChartData {
  name: string
  value: number
  color: string
}

export interface ScoreComponent {
  nombre: string
  valor: number
  peso: string
}

export interface DashboardStats {
  ingresos_mes: number
  egresos_mes: number
  margen_bruto: number
  health_score: number
  ingresos_variacion: number
  egresos_variacion: number
  margen_variacion: number
  score_variacion: number
  revenue_data: RevenueData[]
  cash_flow_data: CashFlowData[]
  top_clientes: TopClient[]
  top_proveedores: TopProvider[]
  ingresos_por_categoria: PieChartData[]
  semaforo: SemaforoItem[]
  total_cfdis: number
  last_sync: string | null
}

export interface Company {
  id: number
  rfc: string
  razon_social: string
  regimen_fiscal: string | null
  codigo_postal: string | null
  sector: string | null
  sat_connected: boolean
  sat_last_sync: string | null
  demo_scenario: string | null
  created_at: string
  total_cfdis: number
  ingresos_mes: number
  egresos_mes: number
  health_score: number
  alertas_activas: number
}

export interface HealthScoreResponse {
  score_total: number
  componentes: ScoreComponent[]
  periodo: string | null
}

// Health check
export async function checkHealth(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${API_URL}/health`)
  if (!res.ok) throw new Error('API not available')
  return res.json()
}

// Seed database
export async function seedDatabase(scenario?: 'A' | 'B' | 'C'): Promise<any> {
  const url = scenario
    ? `${API_URL}/api/seed?scenario=${scenario}`
    : `${API_URL}/api/seed`
  const res = await fetch(url, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to seed database')
  return res.json()
}

// Get companies
export async function getCompanies(scenario?: string): Promise<Company[]> {
  const url = scenario
    ? `${API_URL}/api/companies?scenario=${scenario}`
    : `${API_URL}/api/companies`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch companies')
  return res.json()
}

// Get dashboard stats
export async function getDashboardStats(companyId: number): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/api/dashboard/${companyId}`)
  if (!res.ok) throw new Error('Failed to fetch dashboard stats')
  return res.json()
}

// Get health score
export async function getHealthScore(companyId: number): Promise<HealthScoreResponse> {
  const res = await fetch(`${API_URL}/api/companies/${companyId}/health-score`)
  if (!res.ok) throw new Error('Failed to fetch health score')
  return res.json()
}

// CFO Chat
export async function sendCFOMessage(message: string, companyId: number): Promise<{
  response: string
  sources: string[]
  disclaimer: string
}> {
  const res = await fetch(
    `${API_URL}/api/cfo/chat?message=${encodeURIComponent(message)}&company_id=${companyId}`,
    { method: 'POST' }
  )
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

// Format helpers
export function formatMXN(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatCompact(n: number): string {
  if (n >= 1000000) {
    return `$${(n / 1000000).toFixed(1)}M`
  }
  if (n >= 1000) {
    return `$${(n / 1000).toFixed(0)}K`
  }
  return `$${n}`
}
