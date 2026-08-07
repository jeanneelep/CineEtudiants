import { useState, useEffect } from 'react'
import { api } from '../api'
import Footer from '../components/Footer'
import '../styles/Home.css'

const CATEGORIES = ['Drame', 'Animation', 'Documentaire', 'Poétique', 'Expérimental']

export default function Home({ onNavigate, user, token, onProfileClick, onLogout }) {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [videoLikes, setVideoLikes] = useState(null)
  const [videoComments, setVideoComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    if (selectedVideo) {
      loadVideoDetails()
    }
  }, [selectedVideo])

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

  const loadVideoDetails = async () => {
    try {
      const likes = await api.getVideoLikes(selectedVideo.id)
      const comments = await api.getVideoComments(selectedVideo.id)
      setVideoLikes(likes)
      setVideoComments(Array.isArray(comments) ? comments : [])
    } catch (err) {
      console.error('Erreur chargement détails:', err)
    }
  }

  const handleLike = async () => {
    if (!user || !token) {
      alert('Veuillez vous connecter')
      return
    }
    try {
      await api.toggleLike(token, selectedVideo.id)
      await loadVideoDetails()
    } catch (err) {
      console.error('Erreur like:', err)
    }
  }

  const handleAddComment = async () => {
    if (!user || !token) {
      alert('Veuillez vous connecter pour commenter')
      return
    }
    if (!newComment.trim()) {
      alert('Veuillez écrire un commentaire')
      return
    }

    setCommentLoading(true)
    try {
      const result = await api.createComment(token, selectedVideo.id, newComment)
      if (result.error) {
        alert('Erreur: ' + result.error)
      } else {
        setNewComment('')
        await loadVideoDetails()
      }
    } catch (err) {
      console.error('Erreur commentaire:', err)
      alert('Erreur lors de l\'envoi du commentaire: ' + err.message)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!user) return
    try {
      const token = localStorage.getItem('token')
      await api.deleteComment(token, commentId)
      await loadVideoDetails()
    } catch (err) {
      console.error('Erreur suppression:', err)
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

  const getVideoUrl = (url) => {
    if (url.startsWith('http')) return url
    return `http://localhost:5000${url}`
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
              <div className="user-menu">
                <button className="user-profile-btn" onClick={onProfileClick}>
                  {user.name.substring(0, 2).toUpperCase()}
                </button>
                <button className="logout-btn" onClick={onLogout} title="Déconnexion">
                  🚪
                </button>
              </div>
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
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedVideo(null)}>✕</button>
            <div className="video-container">
              <video src={getVideoUrl(selectedVideo.url)} controls autoPlay className="video-player" />
            </div>
            <div className="video-info">
              <h2>{selectedVideo.title}</h2>
              <p className="info-meta">{selectedVideo.category} • {formatDuration(selectedVideo.duration)}</p>
              <p className="info-creator">Réalisateur: {getCreatorName(selectedVideo.creator)}</p>
              {selectedVideo.description && <p style={{marginTop: '1rem', color: '#cbd5e1'}}>{selectedVideo.description}</p>}

              <div className="video-actions">
                <button className={`like-btn ${videoLikes?.userLiked ? 'liked' : ''}`} onClick={handleLike}>
                  ❤️ {videoLikes?.count || 0}
                </button>
                <span className="comment-count">💬 {videoComments.length}</span>
              </div>

              <div className="comments-section">
                <h3>Commentaires ({videoComments.length})</h3>

                {user && (
                  <div className="comment-form">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      className="comment-input"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={commentLoading || !newComment.trim()}
                      className="comment-submit"
                    >
                      {commentLoading ? 'Envoi...' : 'Poster'}
                    </button>
                  </div>
                )}

                <div className="comments-list">
                  {videoComments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <strong>{comment.user.name}</strong>
                        {user?.id === comment.userId && (
                          <button
                            className="delete-comment-btn"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="comment-text">{comment.content}</p>
                      <p className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
