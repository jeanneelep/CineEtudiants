import { useState, useEffect } from 'react'
import { api } from '../api'
import Footer from '../components/Footer'
import '../styles/Home.css'

const CATEGORIES = ['Drame', 'Animation', 'Documentaire', 'Poétique', 'Expérimental']

export default function Home({ onNavigate, user, onProfileClick }) {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      const data = await api.getAllVideos()
      setVideos(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement vidéos:', err)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (typeof seconds === 'string') return seconds
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const getCreatorName = (creator) => {
    if (typeof creator === 'string') return creator
    return creator?.name || 'Inconnu'
  }

  const recentVideos = [...videos].reverse()
  const featuredVideos = videos.slice(0, 3)

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-content">
          <div className="logo">
            <h1>🎬 CinéÉtudiants</h1>
          </div>
          <nav className="home-nav">
            <button className="nav-link active" onClick={() => onNavigate('home')}>Accueil</button>
            <button className="nav-link" onClick={() => onNavigate('explore')}>Explorer</button>
            <button className="nav-link" onClick={() => onNavigate('realisateurs')}>Réalisateurs</button>
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

      <section className="hero-section">
        <div className="hero-content">
          <h2>Découvre de nouveaux films, partage ta vision et trouve ton public !</h2>
          <p>Une plateforme dédiée aux courts métrages étudiants.</p>
        </div>
      </section>

      <main className="home-main">
        {loading ? (
          <div style={{padding: '2rem', textAlign: 'center', color: '#cbd5e1'}}>Chargement des vidéos...</div>
        ) : (
          <>
            <section className="rail-section">
              <div className="rail-header">
                <h2>Récemment ajoutés</h2>
                <a href="#" className="view-all">Voir tous</a>
              </div>
              <div className="carousel">
                {recentVideos.slice(0, 4).map(video => (
                  <div key={video.id} className="carousel-item" onClick={() => setSelectedVideo(video)}>
                    <div className="carousel-thumbnail">
                      <img src={video.thumbnail || '/thumbnails/default.jpg'} alt={video.title} />
                      <div className="carousel-overlay">
                        <button className="carousel-play">▶</button>
                      </div>
                    </div>
                    <div className="carousel-info">
                      <h3>{video.title}</h3>
                      <p className="carousel-meta">{video.category} • {formatDuration(video.duration)}</p>
                      <p className="carousel-creator">par {getCreatorName(video.creator)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rail-section">
              <div className="rail-header">
                <h2>Coup de coeur</h2>
                <a href="#" className="view-all">Voir tous</a>
              </div>
              <div className="carousel">
                {featuredVideos.map(video => (
                  <div key={video.id} className="carousel-item" onClick={() => setSelectedVideo(video)}>
                    <div className="carousel-thumbnail featured">
                      <img src={video.thumbnail || '/thumbnails/default.jpg'} alt={video.title} />
                      <div className="featured-badge">Sélectionné</div>
                      <div className="carousel-overlay">
                        <button className="carousel-play">▶</button>
                      </div>
                    </div>
                    <div className="carousel-info">
                      <h3>{video.title}</h3>
                      <p className="carousel-meta">{video.category} • {formatDuration(video.duration)}</p>
                      <p className="carousel-creator">par {getCreatorName(video.creator)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {CATEGORIES.map(category => {
              const categoryVideos = videos.filter(v => v.category === category)
              if (categoryVideos.length === 0) return null
              return (
                <section key={category} className="rail-section">
                  <div className="rail-header">
                    <h2>{category}</h2>
                    <a href="#" className="view-all">Voir tous</a>
                  </div>
                  <div className="carousel">
                    {categoryVideos.slice(0, 4).map(video => (
                      <div key={video.id} className="carousel-item" onClick={() => setSelectedVideo(video)}>
                        <div className="carousel-thumbnail">
                          <img src={video.thumbnail || '/thumbnails/default.jpg'} alt={video.title} />
                          <div className="carousel-overlay">
                            <button className="carousel-play">▶</button>
                          </div>
                        </div>
                        <div className="carousel-info">
                          <h3>{video.title}</h3>
                          <p className="carousel-meta">{video.category} • {formatDuration(video.duration)}</p>
                          <p className="carousel-creator">par {getCreatorName(video.creator)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}
      </main>

      {selectedVideo && (
        <div className="modal-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedVideo(null)}>✕</button>
            <div className="video-container">
              <video src={selectedVideo.url} controls autoPlay className="video-player" />
            </div>
            <div className="video-info">
              <h2>{selectedVideo.title}</h2>
              <p className="info-meta">{selectedVideo.category} • {formatDuration(selectedVideo.duration)}</p>
              <p className="info-creator">Réalisateur: {getCreatorName(selectedVideo.creator)}</p>
              {selectedVideo.description && <p style={{marginTop: '1rem', color: '#cbd5e1'}}>{selectedVideo.description}</p>}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
