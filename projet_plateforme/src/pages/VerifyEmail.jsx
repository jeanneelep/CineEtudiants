import { useState } from 'react'
import { api } from '../api'
import '../styles/Auth.css'

export default function VerifyEmail({ email, onVerified, onBack }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await api.verifyEmail(email, code)
      setSuccess(true)
      setTimeout(() => {
        onVerified(result.token, result.user)
      }, 1500)
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setLoading(true)
    try {
      await api.resendCode(email)
      setCode('')
      setError('')
      setResendTimer(60)
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setError(err.message || 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎬 CinéÉtudiants</h1>
          <h2>Vérifiez votre email</h2>
        </div>

        {success ? (
          <div className="success-message">
            <p>✓ Email vérifié avec succès!</p>
            <p>Redirection...</p>
          </div>
        ) : (
          <>
            <p className="email-info">
              Code de vérification envoyé à <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label htmlFor="code">Code (6 chiffres)</label>
                <input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  className="form-input code-input"
                  disabled={loading}
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="auth-button" disabled={loading || code.length !== 6}>
                {loading ? 'Vérification...' : 'Vérifier'}
              </button>
            </form>

            <div className="verify-footer">
              <p>Pas reçu le code?</p>
              <button
                onClick={handleResend}
                disabled={resendTimer > 0 || loading}
                className="resend-btn"
              >
                {resendTimer > 0 ? `Renvoyer dans ${resendTimer}s` : 'Renvoyer le code'}
              </button>
            </div>

            <button onClick={onBack} className="back-link">
              ← Retour
            </button>
          </>
        )}
      </div>
    </div>
  )
}
