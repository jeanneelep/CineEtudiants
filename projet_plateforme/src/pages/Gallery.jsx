import { useState } from 'react'
import '../styles/Gallery.css'

const videos = [
  { id: 1, title: 'Lumières de Nuit', src: '/videos/video_1.mp4', thumb: '/thumbnails/thumb_1.jpg', category: 'Drame', duration: '12:34' },
  { id: 2, title: 'Voyage Sonore', src: '/videos/video_2.mp4', thumb: '/thumbnails/thumb_2.jpg', category: 'Animation', duration: '14:22' },
  { id: 3, title: 'Réflexions', src: '/videos/video_3.mp4', thumb: '/thumbnails/thumb_3.jpg', category: 'Documentaire', duration: '10:15' },
  { id: 4, title: 'Instant Éphémère', src: '/videos/video_4.mp4', thumb: '/thumbnails/thumb_4.jpg', category: 'Poétique', duration: '08:45' },
  { id: 5, title: 'Couleurs du Silence', src: '/videos/video_5.mp4', thumb: '/thumbnails/thumb_5.jpg', category: 'Expérimental', duration: '15:00' },
  { id: 6, title: 'Mouvements', src: '/videos/video_6.mp4', thumb: '/thumbnails/thumb_6.jpg', category: 'Drame', duration: '11:30' },
]

export default function Gallery({ user, onLogout, onProfileClick }) {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredVideos, setFilteredVideos] = useState(videos)

  const heroVideo = videos[0]

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    setFilteredVideos(
      videos.filter(v =>
        v.title.toLowerCase().includes(term) ||
        v.category.toLowerCase().includes(term)
      )
    )
  }

  return (
    <div className="gallery-app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🎬</span>
            <h1>CinéÉtudiants</h1>
          </div>
          <div className="header-right">
            <button
              className="user-profile"
              onClick={onProfileClick}
              title="Voir mon profil"
            >
              👤 {user.name}
            </button>
            <button onClick={onLogout} className="logout-btn">Déconnexion</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background" style={{backgroundImage: `url(${heroVideo.thumb})`}}></div>
        <div className="hero-gradient"></div>
        <div className="hero-content">
          <h2 className="hero-title">{heroVideo.title}</h2>
          <p className="hero-category">{heroVideo.category} • {heroVideo.duration}</p>
          <button
            className="hero-button"
            onClick={() => setSelectedVideo(heroVideo)}
          >
            ▶ Regarder maintenant
          </button>
        </div>
      </section>

      {/* Search Bar */}
      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher un film, une catégorie..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
          <span className="search-icon">🔍</span>
        </div>
      </section>

      {/* Main Gallery */}
      <main className="main-content">
        <div className="gallery-header">
          <h2>Films en Vedette</h2>
          <span className="count">{filteredVideos.length} films</span>
        </div>

        <div className="gallery">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="video-card"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="card-image-wrapper">
                <img
                  src={video.thumb}
                  alt={video.title}
                  className="card-image"
                />
                <div className="card-overlay">
                  <button className="play-btn">▶</button>
                </div>
              </div>
              <div className="card-info">
                <h3 className="card-title">{video.title}</h3>
                <p className="card-meta">{video.category} • {video.duration}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="empty-state">
            <p>Aucun film trouvé pour "{searchTerm}"</p>
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedVideo(null)}
            >
              ✕
            </button>
            <div className="video-container">
              <video
                src={selectedVideo.src}
                controls
                autoPlay
                className="video-player"
              />
            </div>
            <div className="video-info">
              <h2>{selectedVideo.title}</h2>
              <p className="info-meta">{selectedVideo.category} • {selectedVideo.duration}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 CinéÉtudiants • Plateforme de courts métrages étudiants</p>
      </footer>
    </div>
  )
}
