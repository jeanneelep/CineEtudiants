import { useState, useEffect } from 'react'
import { api } from '../api'
import Footer from '../components/Footer'
import '../styles/Explore.css'
import FavoriteButton from '../components/FavoriteButton'
import SearchBar from '../components/SearchBar'

const CATEGORIES = ['Drame', 'Animation', 'Documentaire', 'Poétique', 'Expérimental', 'Comédie', 'Horreur', 'Action']
const DURATIONS = [
  { label: 'Moins de 5 min', min: 0, max: 300 },
  { label: '5 à 10 min', min: 300, max: 600 },
  { label: '10 à 20 min', min: 600, max: 1200 },
  { label: 'Plus de 20 min', min: 1200, max: 100000 },
]

export default function Explore({ onNavigate, user, token, onProfileClick, onLogout, pendingVideo, onPendingVideoConsumed, onOpenCreator }) {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    duration: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [videoLikes, setVideoLikes] = useState(null)
  const [videoFavorites, setVideoFavorites] = useState(null)
  const [videoComments, setVideoComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentReplies, setCommentReplies] = useState({})
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [editingReplyId, setEditingReplyId] = useState(null)
  const [editReplyContent, setEditReplyContent] = useState('')
  const [openReplyMenuId, setOpenReplyMenuId] = useState(null)

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    if (selectedVideo) {
      loadVideoDetails()
    }
  }, [selectedVideo])

  useEffect(() => {
    if (pendingVideo) {
      setSelectedVideo(pendingVideo)
      onPendingVideoConsumed?.()
    }
  }, [pendingVideo])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.kebab-menu-container')) return
      setOpenMenuId(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
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

  const loadVideoDetails = async () => {
    try {
      const likes = await api.getVideoLikes(selectedVideo.id, token)
      const comments = await api.getVideoComments(selectedVideo.id)
      setVideoLikes(likes)
      setVideoComments(Array.isArray(comments) ? comments : [])
      const favorites = await api.getVideoFavoriteStatus(token, selectedVideo.id)
      setVideoFavorites(favorites)
      // Charger les réponses pour chaque commentaire
      if (Array.isArray(comments)) {
        const repliesMap = {}
        for (const comment of comments) {
          try {
            const replies = await api.getCommentReplies(comment.id)
            repliesMap[comment.id] = Array.isArray(replies) ? replies : []
          } catch (err) {
            repliesMap[comment.id] = []
          }
        }
        setCommentReplies(repliesMap)
      }
    } catch (err) {
      console.error('Erreur chargement détails:', err)
    }
  }

  const loadCommentReplies = async (commentId) => {
    try {
      const replies = await api.getCommentReplies(commentId)
      setCommentReplies(prev => ({
        ...prev,
        [commentId]: Array.isArray(replies) ? replies : []
      }))
    } catch (err) {
      console.error('Erreur chargement réponses:', err)
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

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  const handleSaveEdit = async (commentId) => {
    if (!token || !editContent.trim()) {
      alert('Le contenu du commentaire ne peut pas être vide')
      return
    }

    setEditLoading(true)
    try {
      const result = await api.editComment(token, commentId, editContent)
      if (result.error) {
        alert('Erreur: ' + result.error)
      } else {
        setEditingCommentId(null)
        setEditContent('')
        await loadVideoDetails()
      }
    } catch (err) {
      console.error('Erreur édition:', err)
      alert('Erreur lors de la modification: ' + err.message)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!user || !token || !window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return
    try {
      console.log('Suppression commentaire:', commentId, 'Token:', token ? 'OK' : 'MISSING')
      const result = await api.deleteComment(token, commentId)
      if (result.error) {
        console.error('Erreur suppression:', result.error)
        alert('Erreur: ' + result.error)
      } else {
        await loadVideoDetails()
      }
    } catch (err) {
      console.error('Erreur suppression:', err.message)
      alert('Erreur suppression: ' + err.message)
    }
  }

  const handleReply = async (commentId) => {
    if (!user || !token) {
      alert('Veuillez vous connecter pour répondre')
      return
    }
    if (!replyContent.trim()) {
      alert('Veuillez écrire une réponse')
      return
    }

    setReplyLoading(true)
    try {
      const result = await api.replyToComment(token, commentId, replyContent)
      if (result.error) {
        alert('Erreur: ' + result.error)
      } else {
        setReplyContent('')
        setReplyingTo(null)
        await loadCommentReplies(commentId)
      }
    } catch (err) {
      console.error('Erreur réponse:', err)
      alert('Erreur lors de l\'envoi de la réponse: ' + err.message)
    } finally {
      setReplyLoading(false)
    }
  }

  const handleEditReply = (reply) => {
    setEditingReplyId(reply.id)
    setEditReplyContent(reply.content)
  }

  const handleCancelReplyEdit = () => {
    setEditingReplyId(null)
    setEditReplyContent('')
  }

  const handleSaveReplyEdit = async (replyId, commentId) => {
    if (!token || !editReplyContent.trim()) {
      alert('Le contenu de la réponse ne peut pas être vide')
      return
    }

    setEditLoading(true)
    try {
      const result = await api.editComment(token, replyId, editReplyContent)
      if (result.error) {
        alert('Erreur: ' + result.error)
      } else {
        setEditingReplyId(null)
        setEditReplyContent('')
        await loadCommentReplies(commentId)
      }
    } catch (err) {
      console.error('Erreur édition réponse:', err)
      alert('Erreur lors de la modification: ' + err.message)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteReply = async (replyId, commentId) => {
    if (!user || !window.confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) return
    try {
      const tk = localStorage.getItem('token') || token
      console.log('Suppression réponse:', replyId, 'Token:', tk ? 'OK' : 'MISSING')
      const result = await api.deleteComment(tk, replyId)
      if (result.error) {
        console.error('Erreur suppression:', result.error)
        alert('Erreur: ' + result.error)
      } else {
        await loadCommentReplies(commentId)
      }
    } catch (err) {
      console.error('Erreur suppression réponse:', err.message)
      alert('Erreur suppression: ' + err.message)
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

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const getVideoUrl = (url) => {
    if (url.startsWith('http')) return url
    return `http://localhost:5000${url}`
  }

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null
    if (avatarPath.startsWith('http')) return avatarPath
    return `http://localhost:5000${avatarPath}`
  }

  const filteredVideos = videos.filter(video => {
    if (filters.category && video.category !== filters.category) return false
    if (filters.duration) {
      const [min, max] = filters.duration.split('-').map(Number)
      if (video.duration < min || video.duration > max) return false
    }
    return true
  })

  const itemsPerPage = 12
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const displayedVideos = filteredVideos.slice(startIdx, startIdx + itemsPerPage)

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? '' : value
    }))
    setCurrentPage(1)
  }

  const handleReset = () => {
    setFilters({ category: '', duration: '' })
    setCurrentPage(1)
  }

  return (
    <div className="explore-page">
      <header className="explore-header">
        <div className="explore-header-content">
          <h1>CinéÉtudiants</h1>
          <nav className="explore-nav">
            <button onClick={() => onNavigate('home')}>Accueil</button>
            <button className="active">Explorer</button>
            <button onClick={() => onNavigate('realisateurs')}>Réalisateurs</button>
            {user?.role === 'admin' && (
              <button className="moderation" onClick={() => onNavigate('admin')}>🔒 Modération</button>
            )}
          </nav>
          <div className="header-right">
            <SearchBar onSelectVideo={setSelectedVideo} onSelectCreator={onOpenCreator} />
            {user ? (
              <div className="user-menu">
                <button className="user-profile-btn" onClick={onProfileClick}>
                  {getAvatarUrl(user.avatar) ? (
                    <img src={getAvatarUrl(user.avatar)} alt={user.name} className="user-profile-avatar" />
                  ) : (
                    user.name.substring(0, 2).toUpperCase()
                  )}
                </button>
              </div>
            ) : (
              <button className="login-btn">Se connecter</button>
            )}
          </div>
        </div>
      </header>

      <main className="explore-main">
        <div className="explore-container">
          <aside className={`explore-filters ${showFilters ? 'open' : ''}`}>
            <div className="filters-header">
              <h3>Filtres</h3>
              <button className="filters-close" onClick={() => setShowFilters(false)}>✕</button>
            </div>

            <div className="filter-group">
              <h4>Catégories</h4>
              {CATEGORIES.map(cat => (
                <label key={cat} className="filter-label">
                  <input
                    type="checkbox"
                    checked={filters.category === cat}
                    onChange={() => handleFilterChange('category', cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Durée</h4>
              {DURATIONS.map(dur => (
                <label key={dur.label} className="filter-label">
                  <input
                    type="checkbox"
                    checked={filters.duration === `${dur.min}-${dur.max}`}
                    onChange={() => handleFilterChange('duration', `${dur.min}-${dur.max}`)}
                  />
                  {dur.label}
                </label>
              ))}
            </div>

            <button className="reset-filters" onClick={handleReset}>Réinitialiser</button>
          </aside>

          <div className="explore-content">
            <div className="content-header">
              <h2>Films Explorer</h2>
              <span style={{color: 'var(--text-secondary)'}}>{filteredVideos.length} résultats</span>
            </div>

            <button className="mobile-filters-btn" onClick={() => setShowFilters(true)}>
              🔽 Afficher les filtres
            </button>

            {loading ? (
              <div style={{padding: '2rem', textAlign: 'center', color: '#cbd5e1'}}>Chargement...</div>
            ) : displayedVideos.length > 0 ? (
              <>
                <div className="videos-grid">
                  {displayedVideos.map(video => (
                    <div
                      key={video.id}
                      className="video-card"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="card-thumbnail">
                        <img
                          src={video.thumbnail ? getVideoUrl(video.thumbnail) : '/thumbnails/default.jpg'}
                          alt={video.title}
                        />
                        <div className="card-overlay">
                          <button className="card-play">▶</button>
                        </div>
                      </div>
                      <div className="card-info">
                        <h3>{video.title}</h3>
                        <p className="card-meta">{video.category}</p>
                        <p className="card-creator">par {getCreatorName(video.creator)}</p>
                      </div>
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
                      ← Précédent
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
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">
                <p>Aucun film ne correspond à vos filtres</p>
              </div>
            )}
          </div>
        </div>
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
              <p className="info-creator">par {getCreatorName(selectedVideo.creator)}</p>
              {selectedVideo.description && <p style={{marginTop: '1rem', color: '#cbd5e1'}}>{selectedVideo.description}</p>}

              <div className="video-actions">
                <button className={`like-btn ${videoLikes?.userLiked ? 'liked' : ''}`} onClick={handleLike}>
                  ❤️ {videoLikes?.count || 0}
                </button>
                <FavoriteButton videoId={selectedVideo.id} user={user} token={token} isFavorite={videoFavorites?.isFavorite} count={videoFavorites?.count} />
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
                        <strong>@{comment.user.name}</strong>
                        <div className="comment-meta">
                          <span className="comment-time">{formatTime(comment.createdAt)}</span>
                          {user?.id === comment.userId && (
                            <div className="kebab-menu-container">
                              <button
                                className="kebab-button"
                                onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                                title="Options"
                              >
                                •••
                              </button>
                              {openMenuId === comment.id && (
                                <div className="kebab-menu">
                                  <button
                                    className="kebab-item"
                                    onClick={() => {
                                      handleEditComment(comment)
                                      setOpenMenuId(null)
                                    }}
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    className="kebab-item kebab-delete"
                                    onClick={() => {
                                      handleDeleteComment(comment.id)
                                      setOpenMenuId(null)
                                    }}
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {editingCommentId === comment.id ? (
                        <div className="comment-edit-form">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="edit-input"
                            placeholder="Modifier votre commentaire..."
                          />
                          <div className="edit-buttons">
                            <button
                              onClick={() => handleSaveEdit(comment.id)}
                              disabled={editLoading || !editContent.trim()}
                              className="edit-save-btn"
                            >
                              {editLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="edit-cancel-btn"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="comment-text">{comment.content}</p>
                      )}

                      {user && !editingCommentId && (
                        <div className="comment-footer">
                          <button
                            className="reply-btn"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            {replyingTo === comment.id ? 'Annuler' : 'Répondre'}
                          </button>
                        </div>
                      )}

                      {/* Formulaire de réponse */}
                      {replyingTo === comment.id && user && (
                        <div className="reply-form">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Votre réponse..."
                            className="reply-input"
                          />
                          <button
                            onClick={() => handleReply(comment.id)}
                            disabled={replyLoading || !replyContent.trim()}
                            className="reply-submit"
                          >
                            {replyLoading ? 'Envoi...' : 'Envoyer'}
                          </button>
                        </div>
                      )}

                      {/* Affichage des réponses */}
                      {commentReplies[comment.id] && commentReplies[comment.id].length > 0 && (
                        <div className="replies-container">
                          {commentReplies[comment.id].map(reply => (
                            <div key={reply.id} className="reply-item">
                              <div className="reply-header">
                                <strong>@{reply.user.name}</strong>
                                <div className="comment-meta">
                                  <span className="comment-time">{formatTime(reply.createdAt)}</span>
                                  {user?.id === reply.userId && (
                                    <div className="kebab-menu-container">
                                      <button
                                        className="kebab-button"
                                        onClick={() => setOpenReplyMenuId(openReplyMenuId === reply.id ? null : reply.id)}
                                        title="Options"
                                      >
                                        •••
                                      </button>
                                      {openReplyMenuId === reply.id && (
                                        <div className="kebab-menu">
                                          <button
                                            className="kebab-item"
                                            onClick={() => {
                                              handleEditReply(reply)
                                              setOpenReplyMenuId(null)
                                            }}
                                          >
                                            Modifier
                                          </button>
                                          <button
                                            className="kebab-item kebab-delete"
                                            onClick={() => {
                                              handleDeleteReply(reply.id, comment.id)
                                              setOpenReplyMenuId(null)
                                            }}
                                          >
                                            Supprimer
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {editingReplyId === reply.id ? (
                                <div className="comment-edit-form">
                                  <textarea
                                    value={editReplyContent}
                                    onChange={(e) => setEditReplyContent(e.target.value)}
                                    className="edit-input"
                                    placeholder="Modifier votre réponse..."
                                  />
                                  <div className="edit-buttons">
                                    <button
                                      onClick={() => handleSaveReplyEdit(reply.id, comment.id)}
                                      disabled={editLoading || !editReplyContent.trim()}
                                      className="edit-save-btn"
                                    >
                                      {editLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                                    </button>
                                    <button
                                      onClick={handleCancelReplyEdit}
                                      className="edit-cancel-btn"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="reply-text">{reply.content}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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
