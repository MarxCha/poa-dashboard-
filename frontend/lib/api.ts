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
  ejemplo?: string
  accion_recomendada?: string
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

// Predictions
export interface Projection {
  mes: string
  ingresos_proyectados: number
  egresos_proyectados: number
  flujo_neto: number
  alerta: string | null
  confianza: number
}

export interface SeasonalMonth {
  mes: string
  factor: number
  nota: string
}

export interface PredictionsData {
  projections: Projection[]
  kpis: {
    ingresos_3m: number
    egresos_3m: number
    flujo_neto_3m: number
    meses_riesgo: number
    revenue_trend: string
    expense_trend: string
  }
  seasonality: SeasonalMonth[]
  risk_assessment: {
    nivel: string
    factores: string[]
  }
  company_name: string
}

export async function getPredictions(companyId: number): Promise<PredictionsData> {
  const res = await fetch(`${API_URL}/api/predictions/${companyId}`)
  if (!res.ok) throw new Error('Failed to fetch predictions')
  return res.json()
}

// Credit
export interface FinancingOption {
  nombre: string
  proveedor: string
  monto_min: number
  monto_max: number
  tasa: string
  plazo: string
  requisitos: string[]
  estado: string
  beneficio_partner: string
}

export interface PartnerLevel {
  nombre: string
  requisito: string
  descuento: string
  comision_referidos: string
  beneficios: string[]
  ejemplo?: string
}

export interface PlanInfo {
  nombre: string
  precio: number
  precio_label: string
  features: string[]
  es_actual: boolean
  popular?: boolean
}

export interface OnboardingStep {
  paso: number
  titulo: string
  descripcion: string
  completado: boolean
}

export interface CreditData {
  readiness: {
    nivel: string
    score: number
    recommendation: string
    health_score: number
  }
  financing_options: FinancingOption[]
  partners_program: {
    niveles: PartnerLevel[]
    nivel_actual: string
  }
  plans: PlanInfo[]
  company_name: string
  onboarding_steps: OnboardingStep[]
}

export async function getCreditInfo(companyId: number): Promise<CreditData> {
  const res = await fetch(`${API_URL}/api/credit/${companyId}`)
  if (!res.ok) throw new Error('Failed to fetch credit info')
  return res.json()
}

// CFDIs
export interface CFDIItem {
  id: number
  uuid: string
  folio: string | null
  serie: string | null
  tipo_comprobante: 'ingreso' | 'egreso'
  estado: 'vigente' | 'cancelado'
  emisor_rfc: string
  emisor_nombre: string | null
  receptor_rfc: string
  receptor_nombre: string | null
  subtotal: number
  total: number
  iva: number
  moneda: string
  fecha_emision: string
  fecha_timbrado: string | null
  uso_cfdi: string | null
  created_at: string
}

export interface CFDIListResponse {
  total: number
  page: number
  per_page: number
  cfdis: CFDIItem[]
}

export async function getCFDIs(
  companyId: number,
  page: number = 1,
  perPage: number = 10,
  tipo?: 'ingreso' | 'egreso'
): Promise<CFDIListResponse> {
  let url = `${API_URL}/api/companies/${companyId}/cfdis?page=${page}&per_page=${perPage}`
  if (tipo) url += `&tipo=${tipo}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch CFDIs')
  return res.json()
}

// Auth
export interface AuthUser {
  id: number
  email: string
  full_name: string
  role: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

export async function authRegister(email: string, password: string, fullName: string): Promise<AuthResponse> {
  const params = new URLSearchParams({ email, password, full_name: fullName })
  const res = await fetch(`${API_URL}/api/auth/register?${params}`, { method: 'POST' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Error al registrar')
  }
  return res.json()
}

export async function authLogin(email: string, password: string): Promise<AuthResponse> {
  const params = new URLSearchParams({ email, password })
  const res = await fetch(`${API_URL}/api/auth/login?${params}`, { method: 'POST' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Error al iniciar sesión')
  }
  return res.json()
}

export async function authGetMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('No autenticado')
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
