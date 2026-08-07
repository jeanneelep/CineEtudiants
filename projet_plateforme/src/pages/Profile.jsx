import { useState } from 'react'
import Footer from '../components/Footer'
import '../styles/Profile.css'

export default function Profile({ user, onBack, onUploadClick }) {
  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="profile-header-content">
          <button onClick={onBack} className="back-btn">← Retour</button>
          <h1>Profil</h1>
          <div></div>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-card">
          <div className="profile-header-section">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="profile-info">
              <h2 className="profile-name">{user.name}</h2>
              <p className="profile-email">{user.email}</p>
              <p className="profile-member">Membre depuis aujourd'hui</p>
            </div>
          </div>

          <div className="stats-section">
            <h3>Statistiques</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Films uploadés</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Vues totales</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Likes reçus</div>
              </div>
            </div>
          </div>

          <div className="actions-section">
            <h3>Actions</h3>
            <button className="action-btn" onClick={onUploadClick}>
              📤 Uploader une vidéo
            </button>
            <button className="action-btn secondary">
              ⚙️ Paramètres du compte
            </button>
          </div>

          <div className="about-section">
            <h3>À propos</h3>
            <p className="about-text">
              Bienvenue sur CinéÉtudiants! Commencez par uploader votre premier court métrage pour rejoindre la communauté de réalisateurs.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
