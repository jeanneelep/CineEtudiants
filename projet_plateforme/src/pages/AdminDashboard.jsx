import { useState, useEffect } from 'react'
import { api } from '../api'
import '../styles/AdminDashboard.css'

export default function AdminDashboard({ user, token, onLogout, onBack }) {
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [comments, setComments] = useState([])
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingVideoId, setRejectingVideoId] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    loadDashboardData()
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
                    {video.status === 'pending' && (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleApproveVideo(video.id)}
                        >
                          Approuver
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectVideoClick(video.id)}
                        >
                          Rejeter
                        </button>
                      </>
                    )}
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
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleApproveComment(comment.id)}
                        >
                          Approuver
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectComment(comment.id)}
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </div>
  )
}
