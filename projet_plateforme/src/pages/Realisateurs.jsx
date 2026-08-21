import { useState, useEffect } from 'react'
import { api } from '../api'
import Footer from '../components/Footer'
import SearchBar from '../components/SearchBar'
import '../styles/Realisateurs.css'

export default function Realisateurs({ onNavigate, user, onProfileClick, onOpenVideo, pendingCreatorLetter, onPendingCreatorLetterConsumed }) {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLetter, setSelectedLetter] = useState('A')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingCreator, setViewingCreator] = useState(null)
  const [creatorVideos, setCreatorVideos] = useState([])
  const [creatorVideosLoading, setCreatorVideosLoading] = useState(false)

  const getVideoUrl = (url) => {
    if (url.startsWith('http')) return url
    return `http://localhost:5000${url}`
  }

  useEffect(() => {
    loadCreators()
  }, [])

  useEffect(() => {
    if (pendingCreatorLetter) {
      handleLetterClick(pendingCreatorLetter)
      onPendingCreatorLetterConsumed?.()
    }
  }, [pendingCreatorLetter])

  const loadCreators = async () => {
    try {
      const data = await api.getCreators()
      setCreators(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement réalisateurs:', err)
      setCreators([])
    } finally {
      setLoading(false)
    }
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const filteredCreators = creators.filter(creator =>
    creator.name.charAt(0).toUpperCase() === selectedLetter
  )

  const topCreators = [...creators].sort((a, b) => b.likesReceived - a.likesReceived).slice(0, 4)
  const itemsPerPage = 8
  const totalPages = Math.ceil(filteredCreators.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const displayedCreators = filteredCreators.slice(startIdx, startIdx + itemsPerPage)

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter)
    setCurrentPage(1)
  }

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null
    if (avatarPath.startsWith('http')) return avatarPath
    return `http://localhost:5000${avatarPath}`
  }

  const handleViewProfile = async (creator) => {
    setViewingCreator(creator)
    setCreatorVideosLoading(true)
    try {
      const videos = await api.getUserVideos(creator.id)
      setCreatorVideos(Array.isArray(videos) ? videos.filter(v => v.status === 'approved') : [])
    } catch (err) {
      console.error('Erreur chargement des vidéos du réalisateur:', err)
      setCreatorVideos([])
    } finally {
      setCreatorVideosLoading(false)
    }
  }

  const closeCreatorModal = () => {
    setViewingCreator(null)
    setCreatorVideos([])
  }

  const handleSelectCreatorVideo = (video) => {
    closeCreatorModal()
    onOpenVideo(video)
  }

  const formatDuration = (seconds) => {
    if (typeof seconds !== 'number') return seconds
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
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
            <SearchBar onSelectVideo={onOpenVideo} onSelectCreator={(creator) => handleLetterClick(creator.name.charAt(0).toUpperCase())} />
            {user ? (
              <button className="user-profile-btn" onClick={onProfileClick}>
                {getAvatarUrl(user.avatar) ? (
                  <img src={getAvatarUrl(user.avatar)} alt={user.name} className="user-profile-avatar" />
                ) : (
                  user.name.substring(0, 2).toUpperCase()
                )}
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

        {loading ? (
          <div style={{padding: '2rem', textAlign: 'center', color: '#cbd5e1'}}>Chargement des réalisateurs...</div>
        ) : creators.length === 0 ? (
          <div style={{padding: '2rem', textAlign: 'center', color: '#cbd5e1'}}>
            <p>Aucun réalisateur pour le moment. Les premiers arriveront dès qu'une vidéo sera publiée !</p>
          </div>
        ) : (
          <>
            {topCreators.length > 0 && (
              <section className="featured-section">
                <div className="featured-header">
                  <h2>Les réalisateurs les mieux notés</h2>
                </div>
                <div className="creators-carousel">
                  {topCreators.map(creator => (
                    <div key={creator.id} className="creator-card featured">
                      <div className="creator-avatar featured-avatar">
                        {getAvatarUrl(creator.avatar) ? (
                          <img src={getAvatarUrl(creator.avatar)} alt={creator.name} className="creator-avatar-img" />
                        ) : (
                          creator.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <h3>{creator.name}</h3>
                      <p className="creator-bio">{creator.bio || 'Réalisateur sur CinéÉtudiants'}</p>
                      <div className="creator-stats">
                        <span>{creator.videoCount} film{creator.videoCount > 1 ? 's' : ''}</span>
                        <span>{creator.likesReceived} likes</span>
                      </div>
                      <button className="view-btn" onClick={() => handleViewProfile(creator)}>Voir profil</button>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
                          {getAvatarUrl(creator.avatar) ? (
                            <img src={getAvatarUrl(creator.avatar)} alt={creator.name} className="creator-avatar-img" />
                          ) : (
                            creator.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <h3>{creator.name}</h3>
                        <p className="creator-bio">{creator.bio || 'Réalisateur sur CinéÉtudiants'}</p>
                        <div className="creator-stats">
                          <span>{creator.videoCount} film{creator.videoCount > 1 ? 's' : ''}</span>
                          <span>{creator.likesReceived} likes</span>
                        </div>
                        <button className="view-btn" onClick={() => handleViewProfile(creator)}>Voir profil</button>
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
          </>
        )}
      </main>

      {viewingCreator && (
        <div className="modal-overlay" onClick={closeCreatorModal}>
          <div className="creator-profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeCreatorModal}>✕</button>
            <div className="creator-profile-header">
              <div className="creator-avatar creator-profile-avatar">
                {getAvatarUrl(viewingCreator.avatar) ? (
                  <img src={getAvatarUrl(viewingCreator.avatar)} alt={viewingCreator.name} className="creator-avatar-img" />
                ) : (
                  viewingCreator.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <h3>{viewingCreator.name}</h3>
                <p className="creator-bio">{viewingCreator.bio || 'Réalisateur sur CinéÉtudiants'}</p>
                <div className="creator-stats">
                  <span>{viewingCreator.videoCount} film{viewingCreator.videoCount > 1 ? 's' : ''}</span>
                  <span>{viewingCreator.likesReceived} likes</span>
                </div>
              </div>
            </div>

            <div className="creator-profile-videos">
              <h4>Films</h4>
              {creatorVideosLoading ? (
                <p style={{color: 'var(--text-secondary)'}}>Chargement...</p>
              ) : creatorVideos.length === 0 ? (
                <p style={{color: 'var(--text-secondary)'}}>Aucun film publié pour le moment.</p>
              ) : (
                <div className="creator-videos-grid">
                  {creatorVideos.map(video => (
                    <div key={video.id} className="creator-video-card" onClick={() => handleSelectCreatorVideo(video)}>
                      <div className="creator-video-thumb">
                        <img src={video.thumbnail ? getVideoUrl(video.thumbnail) : '/thumbnails/default.jpg'} alt={video.title} />
                      </div>
                      <div className="creator-video-info">
                        <div className="creator-video-title">{video.title}</div>
                        <div className="creator-video-meta">{video.category} • {formatDuration(video.duration)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
