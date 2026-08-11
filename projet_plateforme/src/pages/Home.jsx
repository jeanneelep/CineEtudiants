import { useState, useEffect } from 'react'
import { api } from '../api'
import Footer from '../components/Footer'
import '../styles/Home.css'
import FavoriteButton from '../components/FavoriteButton'
import SearchBar from '../components/SearchBar'

const CATEGORIES = ['Drame', 'Animation', 'Documentaire', 'Poétique', 'Expérimental']

export default function Home({ onNavigate, user, token, onProfileClick, onLogout, onAdminClick, pendingVideo, onPendingVideoConsumed, onOpenCreator }) {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
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
      const likes = await api.getVideoLikes(selectedVideo.id)
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
    if (!user || !window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return
    try {
      const tk = localStorage.getItem('token') || token
      console.log('Suppression commentaire:', commentId, 'Token:', tk ? 'OK' : 'MISSING')
      const result = await api.deleteComment(tk, commentId)
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
            {user?.role === 'admin' && (
              <button className="nav-link moderation" onClick={() => onNavigate('admin')}>🔒 Modération</button>
            )}
          </nav>
          <div className="header-right">
            <SearchBar onSelectVideo={setSelectedVideo} onSelectCreator={onOpenCreator} />
            {user ? (
              <div className="user-menu">
                {user.role === 'admin' && (
                  <button className="admin-btn" onClick={onAdminClick} title="Dashboard Admin">
                    👑
                  </button>
                )}
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
