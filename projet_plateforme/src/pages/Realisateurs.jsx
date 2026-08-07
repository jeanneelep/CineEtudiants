import { useState } from 'react'
import Footer from '../components/Footer'
import '../styles/Realisateurs.css'

const CREATORS = [
  { id: 1, name: 'Alice Martin', avatar: 'A', videos: 5, followers: 234, bio: 'Réalisatrice passionnée par les histoires intimistes' },
  { id: 2, name: 'Bob Leclerc', avatar: 'B', videos: 3, followers: 156, bio: 'Spécialiste de l\'animation numérique' },
  { id: 3, name: 'Charlie Durand', avatar: 'C', videos: 7, followers: 456, bio: 'Documentariste engagé' },
  { id: 4, name: 'Diana Rousseau', avatar: 'D', videos: 4, followers: 287, bio: 'Cinéaste expérimentale' },
  { id: 5, name: 'Eve Moreau', avatar: 'E', videos: 2, followers: 98, bio: 'Réalisatrice en herbe' },
  { id: 6, name: 'Frank Petit', avatar: 'F', videos: 6, followers: 389, bio: 'Spécialiste des courts dramatiques' },
  { id: 7, name: 'Grace Chen', avatar: 'G', videos: 3, followers: 167, bio: 'Réalisatrice multimédia' },
  { id: 8, name: 'Henry Laurent', avatar: 'H', videos: 5, followers: 312, bio: 'Réalisateur de poésie visuelle' },
]

export default function Realisateurs({ onNavigate, user, onProfileClick }) {
  const [selectedLetter, setSelectedLetter] = useState('A')
  const [currentPage, setCurrentPage] = useState(1)

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const filteredCreators = CREATORS.filter(creator =>
    creator.name.charAt(0).toUpperCase() === selectedLetter
  )

  const creatorsOfTheFuture = CREATORS.slice(0, 4)
  const itemsPerPage = 8
  const totalPages = Math.ceil(filteredCreators.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const displayedCreators = filteredCreators.slice(startIdx, startIdx + itemsPerPage)

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter)
    setCurrentPage(1)
  }

  return (
    <div className="realisateurs-page">
      <header className="realisateurs-header">
        <div className="realisateurs-header-content">
          <h1>CinéÉtudiants</h1>
          <nav className="realisateurs-nav">
            <button onClick={() => onNavigate('home')}>Accueil</button>
            <button onClick={() => onNavigate('explore')}>Explorer</button>
            <button className="active">Réalisateurs</button>
            {user?.role === 'admin' && (
              <button className="moderation" onClick={() => onNavigate('admin')}>🔒 Modération</button>
            )}
          </nav>
          <div className="header-right">
            {user ? (
              <button className="user-profile-btn" onClick={onProfileClick}>
                {user.name.substring(0, 2).toUpperCase()}
              </button>
            ) : (
              <button className="login-btn">Se connecter</button>
            )}
          </div>
        </div>
      </header>

      <main className="realisateurs-main">
        <section className="alphabet-section">
          <div className="alphabet-grid">
            {alphabet.map(letter => (
              <button
                key={letter}
                className={`letter-btn ${selectedLetter === letter ? 'active' : ''}`}
                onClick={() => handleLetterClick(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        </section>

        <section className="featured-section">
          <div className="featured-header">
            <h2>Les réalisateurs de demain</h2>
            <a href="#" className="view-all">Voir tous</a>
          </div>
          <div className="creators-carousel">
            {creatorsOfTheFuture.map(creator => (
              <div key={creator.id} className="creator-card featured">
                <div className="creator-avatar featured-avatar">
                  {creator.avatar}
                </div>
                <h3>{creator.name}</h3>
                <p className="creator-bio">{creator.bio}</p>
                <div className="creator-stats">
                  <span>{creator.videos} films</span>
                  <span>{creator.followers} followers</span>
                </div>
                <button className="view-btn">Voir profil</button>
              </div>
            ))}
          </div>
        </section>

        <section className="all-creators-section">
          <div className="creators-header">
            <h2>Réalisateurs ({filteredCreators.length})</h2>
          </div>

          {displayedCreators.length > 0 ? (
            <>
              <div className="creators-grid">
                {displayedCreators.map(creator => (
                  <div key={creator.id} className="creator-card">
                    <div className="creator-avatar">
                      {creator.avatar}
                    </div>
                    <h3>{creator.name}</h3>
                    <p className="creator-bio">{creator.bio}</p>
                    <div className="creator-stats">
                      <span>{creator.videos} films</span>
                      <span>{creator.followers} followers</span>
                    </div>
                    <button className="view-btn">Voir profil</button>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <p>Aucun réalisateur trouvé commençant par {selectedLetter}</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
