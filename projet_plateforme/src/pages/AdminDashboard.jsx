import { useState, useEffect } from 'react'
import { api } from '../api'
import '../styles/AdminDashboard.css'

export default function AdminDashboard({ user, token, onLogout, onBack }) {
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [comments, setComments] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingVideoId, setRejectingVideoId] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [editingVideo, setEditingVideo] = useState(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    thumbnail: ''
  })
  const [openMenuId, setOpenMenuId] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.kebab-menu-container')) return
      setOpenMenuId(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const statsData = await api.getAdminStats(token)
      setStats(statsData)

      const videosData = await api.getAdminVideos(token)
      setVideos(Array.isArray(videosData) ? videosData : [])

      const commentsData = await api.getAdminComments(token)
      setComments(Array.isArray(commentsData) ? commentsData : [])

      const usersData = await api.getAdminUsers(token)
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (err) {
      console.error('Erreur chargement dashboard:', err)
      alert('Erreur lors du chargement du dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveVideo = async (videoId) => {
    try {
      await api.approveVideo(token, videoId)
      alert('Vidéo approuvée!')
      loadDashboardData()
    } catch (err) {
      console.error('Erreur approbation vidéo:', err)
      alert('Erreur lors de l\'approbation')
    }
  }

  const handleRejectVideoClick = (videoId) => {
    setRejectingVideoId(videoId)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const handleRejectVideoConfirm = async () => {
    if (!rejectReason.trim()) {
      alert('Veuillez entrer une raison de rejet')
      return
    }

    try {
      await api.rejectVideo(token, rejectingVideoId, rejectReason)
      alert('Vidéo rejetée!')
      setShowRejectModal(false)
      loadDashboardData()
    } catch (err) {
      console.error('Erreur rejet vidéo:', err)
      alert('Erreur lors du rejet')
    }
  }

  const openEditModal = (video) => {
    setEditingVideo(video)
    setEditFormData({
      title: video.title || '',
      description: video.description || '',
      category: video.category || '',
      duration: video.duration || '',
      thumbnail: video.thumbnail || ''
    })
  }

  const closeEditModal = () => {
    setEditingVideo(null)
    setEditFormData({
      title: '',
      description: '',
      category: '',
      duration: '',
      thumbnail: ''
    })
  }

  const handleEditVideoChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveVideo = async () => {
    if (!editFormData.title.trim()) {
      alert('Le titre est requis')
      return
    }

    try {
      const dataToSend = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        category: editFormData.category.trim(),
        duration: editFormData.duration ? parseInt(editFormData.duration) : undefined,
        thumbnail: editFormData.thumbnail.trim()
      }

      // Remove undefined fields
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === undefined) {
          delete dataToSend[key]
        }
      })

      await api.editVideo(token, editingVideo.id, dataToSend)
      alert('Vidéo modifiée avec succès!')
      closeEditModal()
      loadDashboardData()
    } catch (err) {
      console.error('Erreur modification vidéo:', err)
      alert('Erreur lors de la modification')
    }
  }

  const handleApproveComment = async (commentId) => {
    try {
      await api.approveComment(token, commentId)
      alert('Commentaire approuvé!')
      loadDashboardData()
    } catch (err) {
      console.error('Erreur approbation commentaire:', err)
      alert('Erreur lors de l\'approbation')
    }
  }

  const handleRejectComment = async (commentId) => {
    try {
      await api.rejectComment(token, commentId)
      alert('Commentaire supprimé!')
      loadDashboardData()
    } catch (err) {
      console.error('Erreur rejet commentaire:', err)
      alert('Erreur lors du rejet')
    }
  }

  const openConfirmModal = (action, id, type) => {
    setConfirmAction({ action, id, type })
    setShowConfirmModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!confirmAction) return

    try {
      const { action, id, type } = confirmAction

      if (action === 'deleteVideo') {
        await api.deleteVideo(token, id)
      } else if (action === 'deleteComment') {
        await api.deleteComment(token, id)
      } else if (action === 'deleteUser') {
        await api.deleteUser(token, id)
      }

      alert('Supprimé avec succès!')
      setShowConfirmModal(false)
      setConfirmAction(null)
      loadDashboardData()
    } catch (err) {
      console.error('Erreur suppression:', err)
      alert('Erreur lors de la suppression')
      setShowConfirmModal(false)
      setConfirmAction(null)
    }
  }

  if (loading) {
    return <div className="admin-dashboard loading">Chargement...</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Dashboard Admin</h1>
        <div className="admin-header-actions">
          <span className="admin-user">Connecté: {user?.name}</span>
          <button onClick={onBack} className="btn-back">Retour</button>
          <button onClick={onLogout} className="btn-logout">Déconnexion</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistiques
        </button>
        <button
          className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Modération Vidéos
        </button>
        <button
          className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Modération Commentaires
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <div className="tab-content stats-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">Utilisateurs</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalVideos}</div>
              <div className="stat-label">Vidéos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalComments}</div>
              <div className="stat-label">Commentaires</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalLikes}</div>
              <div className="stat-label">Likes</div>
            </div>
          </div>

          <div className="chart-container">
            <h3>Vidéos par Catégorie</h3>
            <div className="bar-chart">
              {stats.videosByCategory && stats.videosByCategory.map(item => (
                <div key={item.category} className="bar-item">
                  <div className="bar-label">{item.category}</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        width: `${(item.count / Math.max(...stats.videosByCategory.map(x => x.count), 1)) * 100}%`
                      }}
                    >
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="tab-content moderation-content">
          <h2>Modération des Vidéos</h2>
          {videos.length === 0 ? (
            <p className="empty-message">Aucune vidéo à modérer</p>
          ) : (
            <div className="moderation-list">
              {videos.map(video => (
                <div key={video.id} className="moderation-item">
                  <div className="item-header">
                    <h4>{video.title}</h4>
                    <span className={`status-badge ${video.status}`}>{video.status}</span>
                  </div>
                  <div className="item-details">
                    <p><strong>Auteur:</strong> {video.creator?.name} ({video.creator?.email})</p>
                    <p><strong>Catégorie:</strong> {video.category}</p>
                    <p><strong>Durée:</strong> {video.duration}s</p>
                    <p><strong>Description:</strong> {video.description || 'N/A'}</p>
                    {video.commentCount && (
                      <p><strong>Commentaires:</strong> {video.commentCount}</p>
                    )}
                  </div>
                  <div className="item-actions">
                    <div className="kebab-menu-container">
                      <button
                        className="kebab-button"
                        onClick={() => setOpenMenuId(openMenuId === `video-${video.id}` ? null : `video-${video.id}`)}
                        title="Options"
                      >
                        •••
                      </button>
                      {openMenuId === `video-${video.id}` && (
                        <div className="kebab-menu">
                          <button
                            className="kebab-item"
                            onClick={() => {
                              openEditModal(video)
                              setOpenMenuId(null)
                            }}
                          >
                            Modifier
                          </button>
                          {video.status === 'pending' && (
                            <>
                              <button
                                className="kebab-item"
                                onClick={() => {
                                  handleApproveVideo(video.id)
                                  setOpenMenuId(null)
                                }}
                              >
                                Approuver
                              </button>
                              <button
                                className="kebab-item"
                                onClick={() => {
                                  handleRejectVideoClick(video.id)
                                  setOpenMenuId(null)
                                }}
                              >
                                Rejeter
                              </button>
                            </>
                          )}
                          <button
                            className="kebab-item kebab-delete"
                            onClick={() => {
                              openConfirmModal('deleteVideo', video.id, 'video')
                              setOpenMenuId(null)
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="tab-content moderation-content">
          <h2>Modération des Commentaires</h2>
          {comments.length === 0 ? (
            <p className="empty-message">Aucun commentaire à modérer</p>
          ) : (
            <div className="moderation-list">
              {comments.map(comment => (
                <div key={comment.id} className="moderation-item comment-item">
                  <div className="item-header">
                    <h4>Commentaire de {comment.user?.name}</h4>
                    <span className={`status-badge ${comment.status}`}>{comment.status}</span>
                  </div>
                  <div className="item-details">
                    <p><strong>Vidéo:</strong> {comment.video?.title}</p>
                    <p><strong>Utilisateur:</strong> {comment.user?.email}</p>
                    <p className="comment-content">"{comment.content}"</p>
                    <p className="comment-date">{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="item-actions">
                    {comment.status === 'pending' && (
                      <div className="kebab-menu-container">
                        <button
                          className="kebab-button"
                          onClick={() => setOpenMenuId(openMenuId === `comment-${comment.id}` ? null : `comment-${comment.id}`)}
                          title="Options"
                        >
                          •••
                        </button>
                        {openMenuId === `comment-${comment.id}` && (
                          <div className="kebab-menu">
                            <button
                              className="kebab-item"
                              onClick={() => {
                                handleApproveComment(comment.id)
                                setOpenMenuId(null)
                              }}
                            >
                              Approuver
                            </button>
                            <button
                              className="kebab-item kebab-delete"
                              onClick={() => {
                                openConfirmModal('deleteComment', comment.id, 'comment')
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
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="tab-content moderation-content">
          <h2>Gestion des Utilisateurs</h2>
          {users.length === 0 ? (
            <p className="empty-message">Aucun utilisateur</p>
          ) : (
            <div className="users-list">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nom</th>
                    <th>Rôle</th>
                    <th>Date d'inscription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{user.name}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        {user.role !== 'admin' && (
                          <div className="kebab-menu-container">
                            <button
                              className="kebab-button"
                              onClick={() => setOpenMenuId(openMenuId === `user-${user.id}` ? null : `user-${user.id}`)}
                              title="Options"
                            >
                              •••
                            </button>
                            {openMenuId === `user-${user.id}` && (
                              <div className="kebab-menu">
                                <button
                                  className="kebab-item kebab-delete"
                                  onClick={() => {
                                    openConfirmModal('deleteUser', user.id, 'user')
                                    setOpenMenuId(null)
                                  }}
                                >
                                  Supprimer
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Êtes-vous sûr?</h3>
            <p>Cette action est irréversible.</p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowConfirmModal(false)
                  setConfirmAction(null)
                }}
              >
                Annuler
              </button>
              <button
                className="btn-confirm-delete"
                onClick={handleConfirmDelete}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Raison du rejet</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Entrez la raison du rejet..."
              className="modal-textarea"
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowRejectModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn-confirm"
                onClick={handleRejectVideoConfirm}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {editingVideo && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal">
            <h3>Modifier la vidéo</h3>
            <div className="form-group">
              <label>Titre</label>
              <input
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditVideoChange}
                placeholder="Titre de la vidéo"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditVideoChange}
                placeholder="Description de la vidéo"
                className="form-textarea"
                rows="4"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Catégorie</label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditVideoChange}
                  className="form-select"
                >
                  <option value="">-- Sélectionner une catégorie --</option>
                  <option value="Drame">Drame</option>
                  <option value="Animation">Animation</option>
                  <option value="Comédie">Comédie</option>
                  <option value="Action">Action</option>
                  <option value="Horreur">Horreur</option>
                  <option value="Romance">Romance</option>
                  <option value="Documentaire">Documentaire</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Durée (secondes)</label>
                <input
                  type="number"
                  name="duration"
                  value={editFormData.duration}
                  onChange={handleEditVideoChange}
                  placeholder="300"
                  className="form-input"
                  min="0"
                />
              </div>
            </div>
            <div className="form-group">
              <label>URL Thumbnail (optionnel)</label>
              <input
                type="text"
                name="thumbnail"
                value={editFormData.thumbnail}
                onChange={handleEditVideoChange}
                placeholder="https://..."
                className="form-input"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={closeEditModal}
              >
                Annuler
              </button>
              <button
                className="btn-confirm"
                onClick={handleSaveVideo}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
