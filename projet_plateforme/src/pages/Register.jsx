import { useState } from 'react'
import { api } from '../api'
import VerifyEmail from './VerifyEmail'
import '../styles/Auth.css'

export default function Register({ onRegister, onSwitchLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !passwordConfirm) {
      setError('Tous les champs sont requis')
      return
    }

    if (!email.includes('@')) {
      setError('Email invalide')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères')
      return
    }

    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      const result = await api.register(email, name, password)
      if (result.error) {
        setError(result.error)
      } else {
        setRegisteredEmail(email)
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  if (registeredEmail) {
    return (
      <VerifyEmail
        email={registeredEmail}
        onVerified={(token, user) => {
          onRegister(user, token)
        }}
        onBack={() => setRegisteredEmail(null)}
      />
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎬 CinéÉtudiants</h1>
          <p>Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Nom</label>
            <input
              id="name"
              type="text"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">Confirmer mot de passe</label>
            <input
              id="passwordConfirm"
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Vous avez un compte ? <a onClick={onSwitchLogin} style={{cursor: 'pointer', color: '#06b6d4'}}>Se connecter</a></p>
        </div>
      </div>
    </div>
  )
}
