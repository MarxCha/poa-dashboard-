'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react'
import { authLogin, authRegister, AuthUser } from '@/lib/api'

interface LoginScreenProps {
  onLogin: (token: string, user: AuthUser) => void
  onSkip: () => void
}

export function LoginScreen({ onLogin, onSkip }: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = mode === 'login'
        ? await authLogin(email, password)
        : await authRegister(email, password, fullName)

      localStorage.setItem('poa_token', res.access_token)
      localStorage.setItem('poa_user', JSON.stringify(res.user))
      onLogin(res.access_token, res.user)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Zap size={24} className="text-[#0a0f1a]" strokeWidth={2.5} />
          </div>
          <span className="text-white text-2xl font-semibold tracking-tight">Sistema POA</span>
        </div>

        {/* Card */}
        <div className="bg-[#0d1321] border border-white/[0.06] rounded-2xl p-8">
          <h2 className="text-white text-xl font-semibold mb-1">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-white/40 text-sm mb-6">
            {mode === 'login'
              ? 'Ingresa tus credenciales para acceder'
              : 'Registra una cuenta para comenzar'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nombre completo"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 text-sm"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 text-sm"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0a0f1a] font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Crear Cuenta'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-emerald-400/70 hover:text-emerald-400 text-sm transition-colors"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>

        {/* Demo mode skip */}
        <button
          onClick={onSkip}
          className="w-full mt-4 py-3 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04] text-sm transition-colors"
        >
          Entrar en modo demo (sin cuenta)
        </button>
      </motion.div>
    </div>
  )
}
