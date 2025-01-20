import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface AuthFormProps {
  onSuccess: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          data: {
            email_confirm: true
          },
          emailRedirectTo: undefined // Esto fuerza el envío de OTP en lugar de magic link
        },
      })

      if (error) throw error

      setShowOtpInput(true)
      setMessage('¡Código enviado! Revisa tu email')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ha ocurrido un error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (error) throw error

      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Código inválido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form">
      {!showOtpInput ? (
        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
          <button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Verificar email'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Ingresa el código"
            required
            maxLength={6}
            className="flex-1 px-3 py-2 bg-white border border-[#2E7D32] rounded-lg text-black"
          />
          <button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Confirmar código'}
          </button>
        </form>
      )}
      {message && (
        <div className="mt-2 text-green-700 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-2 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  )
} 