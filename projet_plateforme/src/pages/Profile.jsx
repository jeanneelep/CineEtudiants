import { useState, useEffect, useRef } from 'react'
import { api } from '../api'
import Footer from '../components/Footer'
import FavoriteButton from '../components/FavoriteButton'
import '../styles/Profile.css'

export default function Profile({ user, token, onBack, onUploadClick, onLogout, onUserUpdate }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [myVideos, setMyVideos] = useState([])
  const [myVideosLoading, setMyVideosLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'favorites' | 'videos'
  const [videosSubTab, setVideosSubTab] = useState('films') // 'films' | 'likes'
  const [receivedLikes, setReceivedLikes] = useState([])
  const [receivedLikesLoading, setReceivedLikesLoading] = useState(false)
  const [receivedLikesLoaded, setReceivedLikesLoaded] = useState(false)
  const [playingVideo, setPlayingVideo] = useState(null)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const avatarInputRef = useRef(null)
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
  const [editingVideoId, setEditingVideoId] = useState(null)
  const [editVideoTitle, setEditVideoTitle] = useState('')
  const [editVideoDescription, setEditVideoDescription] = useState('')
  const [editVideoFile, setEditVideoFile] = useState(null)
  const [editVideoThumbnail, setEditVideoThumbnail] = useState(null)
  const [editVideoLoading, setEditVideoLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadProfile()
      loadFavorites()
      loadMyVideos()
    }
  }, [user?.id])

  useEffect(() => {
    if (playingVideo) {
      loadVideoDetails()
    }
  }, [playingVideo])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.kebab-menu-container')) return
      setOpenMenuId(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const loadVideoDetails = async () => {
    try {
      const likes = await api.getVideoLikes(playingVideo.id, token)
      const comments = await api.getVideoComments(playingVideo.id)
      setVideoLikes(likes)
      setVideoComments(Array.isArray(comments) ? comments : [])
      const favs = await api.getVideoFavoriteStatus(token, playingVideo.id)
      setVideoFavorites(favs)
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
      await api.toggleLike(token, playingVideo.id)
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
      const result = await api.createComment(token, playingVideo.id, newComment)
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
      const result = await api.deleteComment(token, commentId)
      if (result.error) {
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
      const result = await api.deleteComment(token, replyId)
      if (result.error) {
        alert('Erreur: ' + result.error)
      } else {
        await loadCommentReplies(commentId)
      }
    } catch (err) {
      console.error('Erreur suppression réponse:', err.message)
      alert('Erreur suppression: ' + err.message)
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

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

  const loadReceivedLikes = async () => {
    setReceivedLikesLoading(true)
    try {
      const data = await api.getReceivedLikes(token, user.id)
      setReceivedLikes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement des likes reçus:', err)
      setReceivedLikes([])
    } finally {
      setReceivedLikesLoading(false)
      setReceivedLikesLoaded(true)
    }
  }

  const handleVideosSubTabClick = (tab) => {
    setVideosSubTab(tab)
    if (tab === 'likes' && !receivedLikesLoaded) {
      loadReceivedLikes()
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce film ? Cette action est irréversible.')) return
    try {
      await api.deleteMyVideo(token, videoId)
      setMyVideos(prev => prev.filter(v => v.id !== videoId))
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression')
    }
  }

  const handleStartEditVideo = (video) => {
    setEditingVideoId(video.id)
    setEditVideoTitle(video.title)
    setEditVideoDescription(video.description || '')
    setEditVideoFile(null)
    setEditVideoThumbnail(null)
  }

  const handleCancelEditVideo = () => {
    setEditingVideoId(null)
    setEditVideoTitle('')
    setEditVideoDescription('')
    setEditVideoFile(null)
    setEditVideoThumbnail(null)
  }

  const handleSaveEditVideo = async (videoId) => {
    if (!editVideoTitle.trim()) return
    if (editVideoFile && !window.confirm('Remplacer le fichier vidéo renverra ce film en attente de modération. Continuer ?')) return
    setEditVideoLoading(true)
    try {
      const updated = await api.updateMyVideo(token, videoId, {
        title: editVideoTitle.trim(),
        description: editVideoDescription.trim(),
        videoFile: editVideoFile,
        thumbnailFile: editVideoThumbnail
      })
      setMyVideos(prev => prev.map(v => v.id === videoId ? { ...v, ...updated } : v))
      handleCancelEditVideo()
    } catch (err) {
      alert(err.message || 'Erreur lors de la modification')
    } finally {
      setEditVideoLoading(false)
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
    return `http://localhost:5000${url}`
  }

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null
    if (avatarPath.startsWith('http')) return avatarPath
    return `http://localhost:5000${avatarPath}`
  }

  const handleAvatarButtonClick = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Format non supporté. Utilisez JPEG, PNG ou WEBP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop lourde (max 5MB).')
      return
    }

    setAvatarSaving(true)
    try {
      const updatedUser = await api.uploadAvatar(token, user.id, file)
      setProfile(prev => ({ ...prev, avatar: updatedUser.avatar }))
      onUserUpdate?.({ avatar: updatedUser.avatar })
    } catch (err) {
      console.error('Erreur upload avatar:', err)
      alert(err.message || 'Erreur lors de l\'envoi de la photo')
    } finally {
      setAvatarSaving(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setAvatarSaving(true)
    try {
      const updatedUser = await api.updateUserProfile(token, user.id, { avatar: null })
      setProfile(prev => ({ ...prev, avatar: updatedUser.avatar }))
      onUserUpdate?.({ avatar: null })
    } catch (err) {
      console.error('Erreur suppression avatar:', err)
      alert('Erreur lors de la suppression de la photo')
    } finally {
      setAvatarSaving(false)
    }
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
            <div className="avatar-wrapper">
              <div className="avatar">
                {getAvatarUrl(profile?.avatar) ? (
                  <img src={getAvatarUrl(profile.avatar)} alt={user.name} className="avatar-image" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <button
                className="avatar-edit-btn"
                onClick={handleAvatarButtonClick}
                disabled={avatarSaving}
                title="Changer la photo de profil"
              >
                {avatarSaving ? '...' : '📷'}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarFileChange}
                style={{ display: 'none' }}
              />
              {profile?.avatar && (
                <button className="avatar-remove-btn" onClick={handleRemoveAvatar} disabled={avatarSaving}>
                  Retirer la photo
                </button>
              )}
            </div>
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
                      <div className="stat-label">Films</div>
                    </button>
                    <button
                      className="stat-card stat-card-clickable"
                      onClick={() => { setActiveTab('videos'); handleVideosSubTabClick('likes') }}
                    >
                      <div className="stat-number">{profile?.stats?.likesReceived || 0}</div>
                      <div className="stat-label">Likes</div>
                    </button>
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
              <div className="videos-subtabs">
                <button
                  className={`subtab-btn ${videosSubTab === 'films' ? 'active' : ''}`}
                  onClick={() => handleVideosSubTabClick('films')}
                >
                  Mes films
                </button>
                <button
                  className={`subtab-btn ${videosSubTab === 'likes' ? 'active' : ''}`}
                  onClick={() => handleVideosSubTabClick('likes')}
                >
                  Mes likes
                </button>
              </div>

              {videosSubTab === 'films' && (
              myVideosLoading ? (
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
                      onClick={() => editingVideoId !== video.id && setPlayingVideo(video)}
                    >
                      <div className="favorite-thumbnail">
                        <img
                          src={video.thumbnail ? getVideoUrl(video.thumbnail) : 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={video.title}
                          style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        />
                        <div className="favorite-overlay">
                          <button className="play-btn">▶</button>
                        </div>
                        <span className={`video-status-badge status-${video.status}`}>
                          {video.status === 'approved' ? 'Publié' : video.status === 'pending' ? 'En attente' : 'Rejeté'}
                        </span>
                        <div className="kebab-menu-container" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="kebab-button"
                            onClick={() => setOpenMenuId(openMenuId === video.id ? null : video.id)}
                            title="Options"
                          >
                            •••
                          </button>
                          {openMenuId === video.id && (
                            <div className="kebab-menu">
                              <button
                                className="kebab-item"
                                onClick={() => { handleStartEditVideo(video); setOpenMenuId(null) }}
                              >
                                Modifier
                              </button>
                              <button
                                className="kebab-item kebab-delete"
                                onClick={() => { handleDeleteVideo(video.id); setOpenMenuId(null) }}
                              >
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {editingVideoId === video.id ? (
                        <div className="comment-edit-form" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editVideoTitle}
                            onChange={(e) => setEditVideoTitle(e.target.value)}
                            className="edit-input"
                            placeholder="Titre"
                          />
                          <textarea
                            value={editVideoDescription}
                            onChange={(e) => setEditVideoDescription(e.target.value)}
                            className="edit-input"
                            placeholder="Description"
                          />
                          <label className="form-hint" style={{display: 'block', marginBottom: '0.3rem'}}>
                            Remplacer le fichier vidéo (optionnel — repasse le film en attente de modération)
                          </label>
                          <input
                            type="file"
                            accept="video/*,.mp4,.mov"
                            onChange={(e) => setEditVideoFile(e.target.files[0] || null)}
                            className="edit-input"
                          />
                          {editVideoFile && (
                            <p className="form-hint">Nouveau fichier : {editVideoFile.name}</p>
                          )}
                          <label className="form-hint" style={{display: 'block', marginTop: '0.6rem', marginBottom: '0.3rem'}}>
                            Remplacer la vignette (optionnel)
                          </label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => setEditVideoThumbnail(e.target.files[0] || null)}
                            className="edit-input"
                          />
                          {editVideoThumbnail && (
                            <p className="form-hint">Nouvelle vignette : {editVideoThumbnail.name}</p>
                          )}
                          <div className="edit-buttons">
                            <button
                              onClick={() => handleSaveEditVideo(video.id)}
                              disabled={editVideoLoading || !editVideoTitle.trim()}
                              className="edit-save-btn"
                            >
                              {editVideoLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                            <button onClick={handleCancelEditVideo} className="edit-cancel-btn">
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="favorite-info">
                          <h4>{video.title}</h4>
                          <p className="favorite-meta">{video.category} • {formatDuration(video.duration)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
              )}

              {videosSubTab === 'likes' && (
                <div className="received-likes-list">
                  {receivedLikesLoading ? (
                    <div style={{padding: '2rem', textAlign: 'center', color: '#cbd5e1'}}>Chargement de vos likes...</div>
                  ) : receivedLikes.length === 0 ? (
                    <div style={{padding: '2rem', textAlign: 'center', color: '#cbd5e1'}}>
                      <p>Personne n'a encore aimé un de vos films</p>
                    </div>
                  ) : (
                    receivedLikes.map(like => (
                      <p key={like.id} className="received-like-item">
                        <strong>{like.user.name}</strong> a aimé votre film « {like.video.title} »
                      </p>
                    ))
                  )}
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
                    <div key={video.id} className="favorite-card" onClick={() => setPlayingVideo(video)}>
                      <div className="favorite-thumbnail">
                        <img
                          src={video.thumbnail ? getVideoUrl(video.thumbnail) : 'https://via.placeholder.com/300x200?text=No+Image'}
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
                        <div className="favorite-actions" onClick={(e) => e.stopPropagation()}>
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
        <div className="modal-overlay" onClick={() => setPlayingVideo(null)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPlayingVideo(null)}>✕</button>
            <div className="video-container">
              <video src={getVideoUrl(playingVideo.url)} controls autoPlay className="video-player" />
            </div>
            <div className="video-info">
              <h2>{playingVideo.title}</h2>
              <p className="info-meta">{playingVideo.category} • {formatDuration(playingVideo.duration)}</p>
              {playingVideo.creator && <p className="info-creator">Réalisateur: {getCreatorName(playingVideo.creator)}</p>}
              {playingVideo.description && <p style={{marginTop: '1rem', color: '#cbd5e1'}}>{playingVideo.description}</p>}

              <div className="video-actions">
                <button className={`like-btn ${videoLikes?.userLiked ? 'liked' : ''}`} onClick={handleLike}>
                  ❤️ {videoLikes?.count || 0}
                </button>
                <FavoriteButton videoId={playingVideo.id} user={user} token={token} isFavorite={videoFavorites?.isFavorite} count={videoFavorites?.count} />
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
