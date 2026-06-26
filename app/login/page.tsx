'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || email.split('@')[0] }
          }
        })
        if (error) throw error
        setMessage('✅ Conta criada! Verifique seu e-mail para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-spain-yellow rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛫</div>
          <h1 className="text-3xl font-bold text-white mb-2">Rumbo +34</h1>
          <p className="text-slate-400 text-sm">
            🇧🇷 Brasil → Espanha 🇪🇸
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-2xl">🇧🇷</span>
            <div className="h-px w-16 bg-gradient-to-r from-spain-red to-spain-yellow" />
            <span className="text-xl">✈️</span>
            <div className="h-px w-16 bg-gradient-to-r from-spain-yellow to-spain-red" />
            <span className="text-2xl">🇪🇸</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            {isSignUp ? 'Criar conta' : 'Acceder al Sistema'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="label">Seu nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: João ou Maria"
                  className="input-field"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                ⚠️ {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl border border-green-100">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base"
            >
              {loading ? '⏳ CARGANDO...' : isSignUp ? '🚀 Criar conta' : '🔐 ORGANIZAR NUESTRO FUTURO'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              {isSignUp
                ? '🚀 Já tenho conta → Entrar'
                : '🚀 Não tenho conta → Criar agora'}
            </button>
          </div>

          {!isSignUp && (
            <p className="mt-4 text-xs text-slate-400 text-center">
              💡 N᥆ tᥱ ρrᥱ᥆ᥴᥙρᥱ᥉, Dι᥆᥉ ᥒᥙᥒᥴᥲ ᥣᥣᥱgᥲ tᥲrdᥱ.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
