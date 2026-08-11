import { useState, useEffect } from 'react'
import { api } from '../api'
import Footer from '../components/Footer'
import FavoriteButton from '../components/FavoriteButton'
import '../styles/Profile.css'

export default function Profile({ user, token, onBack, onUploadClick, onLogout }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [myVideos, setMyVideos] = useState([])
  const [myVideosLoading, setMyVideosLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'favorites' | 'videos'
  const [playingVideo, setPlayingVideo] = useState(null)

  useEffect(() => {
    if (user?.id) {
      loadProfile()
      loadFavorites()
      loadMyVideos()
    }
  }, [user?.id])

  const loadMyVideos = async () => {
    setMyVideosLoading(true)
    try {
      const data = await api.getUserVideos(user.id)
      setMyVideos(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement de mes vidéos:', err)
      setMyVideos([])
    } finally {
      setMyVideosLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      const data = await api.getUserProfile(token, user.id)
      setProfile(data)
    } catch (err) {
      console.error('Erreur chargement profil:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = async () => {
    if (!token) return
    setFavoritesLoading(true)
    try {
      const data = await api.getUserFavorites(token, user.id)
      setFavorites(Array.isArray(data.favorites) ? data.favorites : [])
    } catch (err) {
      console.error('Erreur chargement favoris:', err)
      setFavorites([])
    } finally {
      setFavoritesLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getVideoUrl = (url) => {
    if (url.startsWith('http')) return url
    return `http://localhost:5000/api/videos/stream/${url}`
  }

  const getCreatorName = (creator) => {
    return typeof creator === 'string' ? creator : creator?.name || 'Inconnu'
  }

  const handleFavoriteRemoved = () => {
    loadFavorites()
  }

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

          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profil
            </button>
            <button
              className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              🎬 Mes Films ({myVideos.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              ⭐ Mes Favoris ({favorites.length})
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              {loading ? (
                <div style={{padding: '2rem', textAlign: 'center', color: '#cbd5e1'}}>Chargement...</div>
              ) : (
                <div className="stats-section">
                  <h3>Statistiques</h3>
                  <div className="stats-grid">
                    <button className="stat-card stat-card-clickable" onClick={() => setActiveTab('videos')}>
                      <div className="stat-number">{profile?.stats?.videoCount || 0}</div>
                      <div className="stat-label">Films uploadés</div>
                    </button>
                    <div className="stat-card">
                      <div className="stat-number">{profile?.stats?.likesReceived || 0}</div>
                      <div className="stat-label">Likes reçus</div>
                    </div>
                    <button className="stat-card stat-card-clickable" onClick={() => setActiveTab('favorites')}>
                      <div className="stat-number">{favorites.length}</div>
                      <div className="stat-label">Favoris</div>
                    </button>
                  </div>
                </div>
              )}

              <div className="actions-section">
                <h3>Actions</h3>
                <button className="action-btn" onClick={onUploadClick}>
                  📤 Uploader une vidéo
                </button>
                <button className="action-btn secondary">
                  ⚙️ Paramètres du compte
                </button>
                <button className="action-btn logout-btn" onClick={onLogout}>
                  🚪 Se déconnecter
                </button>
              </div>

              <div className="about-section">
                <h3>À propos</h3>
                <p className="about-text">
                  Bienvenue sur CinéÉtudiants! Commencez par uploader votre premier court métrage pour rejoindre la communauté de réalisateurs.
                </p>
              </div>
            </>
          )}

          {/* My Videos Tab */}
          {activeTab === 'videos' && (
            <div className="favorites-section">
              {myVideosLoading ? (
                <div style={{padding: '2rem', textAlign: 'center', color: '#cbd5e1'}}>Chargement de vos films...</div>
              ) : myVideos.length === 0 ? (
                <div style={{padding: '2rem', textAlign: 'center', color: '#cbd5e1'}}>
                  <p>Vous n'avez pas encore uploadé de film</p>
                </div>
              ) : (
                <div className="favorites-grid">
                  {myVideos.map(video => (
                    <div
                      key={video.id}
                      className="favorite-card"
                      onClick={() => setPlayingVideo(video)}
                    >
                      <div className="favorite-thumbnail">
                        <img
                          src={video.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={video.title}
                          style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        />
                        <div className="favorite-overlay">
                          <button className="play-btn">▶</button>
                        </div>
                        <span className={`video-status-badge status-${video.status}`}>
                          {video.status === 'approved' ? 'Publié' : video.status === 'pending' ? 'En attente' : 'Rejeté'}
                        </span>
                      </div>
                      <div className="favorite-info">
                        <h4>{video.title}</h4>
                        <p className="favorite-meta">{video.category} • {formatDuration(video.duration)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="favorites-section">
              {favoritesLoading ? (
                <div style={{padding: '2rem', textAlign: 'center', color: '#cbd5e1'}}>Chargement des favoris...</div>
              ) : favorites.length === 0 ? (
                <div style={{padding: '2rem', textAlign: 'center', color: '#cbd5e1'}}>
                  <p>Aucune vidéo en favori pour le moment</p>
                </div>
              ) : (
                <div className="favorites-grid">
                  {favorites.map(video => (
                    <div key={video.id} className="favorite-card">
                      <div className="favorite-thumbnail">
                        <img
                          src={video.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={video.title}
                          style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        />
                        <div className="favorite-overlay">
                          <button className="play-btn">▶</button>
                        </div>
                      </div>
                      <div className="favorite-info">
                        <h4>{video.title}</h4>
                        <p className="favorite-meta">{video.category} • {formatDuration(video.duration)}</p>
                        <p className="favorite-creator">par {getCreatorName(video.creator)}</p>
                        <div className="favorite-actions">
                          <FavoriteButton
                            videoId={video.id}
                            user={user}
                            token={token}
                            isFavorite={true}
                            onUpdate={handleFavoriteRemoved}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {playingVideo && (
        <div className="profile-video-modal-overlay" onClick={() => setPlayingVideo(null)}>
          <div className="profile-video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="profile-video-modal-close" onClick={() => setPlayingVideo(null)}>✕</button>
            <video src={getVideoUrl(playingVideo.url)} controls autoPlay className="profile-video-player" />
            <div className="profile-video-modal-info">
              <h3>{playingVideo.title}</h3>
              <p>{playingVideo.category} • {formatDuration(playingVideo.duration)}</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
