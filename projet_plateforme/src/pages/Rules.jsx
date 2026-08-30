import RulesContent from '../components/RulesContent'
import '../styles/Rules.css'

export default function Rules({ onBack }) {
  return (
    <div className="rules-container">
      <header className="rules-header">
        <div className="rules-header-content">
          <button onClick={onBack} className="back-btn-rules">← Retour</button>
          <h1>Règles de dépôt</h1>
          <div></div>
        </div>
      </header>

      <main className="rules-main">
        <p className="rules-intro">
          Avant de déposer une vidéo sur CinéÉtudiants, merci de prendre connaissance des règles ci-dessous.
        </p>
        <RulesContent />
      </main>
    </div>
  )
}
