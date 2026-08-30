import '../styles/Footer.css'

export default function Footer({ onNavigate }) {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>CinéÉtudiants</h4>
          <p>Plateforme de courts métrages réalisés par les étudiants</p>
        </div>
        <div className="footer-section">
          <h4>Liens</h4>
          <ul>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#mentions">Mentions légales</a></li>
            {onNavigate && (
              <li><a href="#rules" onClick={(e) => { e.preventDefault(); onNavigate('rules') }}>Règles de dépôt</a></li>
            )}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 CinéÉtudiants • Tous droits réservés</p>
      </div>
    </footer>
  )
}
