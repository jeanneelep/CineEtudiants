import { useState, useRef } from 'react'
import { api } from '../api'
import '../styles/Upload.css'

const GENRES = [
  'Drame', 'Comédie', 'Animation', 'Documentaire', 'Poétique',
  'Expérimental', 'Horreur', 'Thriller', 'Romance', 'Action',
  'Science-fiction', 'Fantasy', 'Aventure', 'Historique', 'Autre'
]

const VALID_VIDEO_TYPES = ['video/mp4', 'video/quicktime']
const VALID_VIDEO_EXTENSIONS = ['.mp4', '.mov']
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 // 2 Go
const MAX_DURATION_MINUTES = 45

export default function Upload({ user, token, onBack, onUpload }) {
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedVideo, setUploadedVideo] = useState(null)
  const [validationError, setValidationError] = useState('')

  const getVideoUrl = (url) => {
    if (url.startsWith('http')) return url
    return `http://localhost:5000${url}`
  }
  const [coAuthors, setCoAuthors] = useState([''])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Drame',
    year: new Date().getFullYear(),
    duration: '',
    visibility: 'public',
    tags: '',
  })

  const videoInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)
  const videoPreviewRef = useRef(null)

  // Validation: Check file size and format BEFORE upload
  const isValidVideoFile = (file) => {
    setValidationError('')
    
    if (!file) {
      setValidationError('Aucun fichier sélectionné')
      return false
    }

    // Check file extension
    const fileName = file.name.toLowerCase()
    const hasValidExt = VALID_VIDEO_EXTENSIONS.some(ext => fileName.endsWith(ext))
    if (!hasValidExt) {
      setValidationError(`Format non supporté. Formats acceptés: ${VALID_VIDEO_EXTENSIONS.join(', ')} (vidéo H.264, audio AAC)`)
      return false
    }

    // Check file size (max 2 Go)
    if (file.size > MAX_FILE_SIZE) {
      const sizeGo = (file.size / 1024 / 1024 / 1024).toFixed(2)
      setValidationError(`Fichier trop volumineux (${sizeGo} Go). Maximum autorisé : 2 Go`)
      return false
    }

    // Check MIME type (optional, some browsers don't support it)
    if (file.type && !VALID_VIDEO_TYPES.includes(file.type)) {
      // Allow if extension is correct
      if (hasValidExt) {
        return true
      }
      setValidationError('Type de fichier invalide')
      return false
    }

    return true
  }

  const handleVideoDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleVideoDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (isValidVideoFile(file)) {
        setVideoFile(file)
      }
    }
  }

  const handleVideoClick = () => videoInputRef.current?.click()
  const handleVideoInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file && isValidVideoFile(file)) {
      setVideoFile(file)
    }
  }

  const handleThumbnailClick = () => thumbnailInputRef.current?.click()
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setThumbnail(file)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({...prev, [name]: value}))
  }

  const handleCoAuthorChange = (index, value) => {
    const newCoAuthors = [...coAuthors]
    newCoAuthors[index] = value
    setCoAuthors(newCoAuthors)
  }

  const addCoAuthor = () => {
    setCoAuthors([...coAuthors, ''])
  }

  const removeCoAuthor = (index) => {
    setCoAuthors(coAuthors.filter((_, i) => i !== index))
  }

  const handleGoHome = () => {
    onUpload(uploadedVideo)
  }

  const handleUploadNewVideo = () => {
    setVideoFile(null)
    setUploadSuccess(false)
    setUploadedVideo(null)
    setUploadProgress(0)
    setFormData({
      title: '',
      description: '',
      genre: 'Drame',
      year: new Date().getFullYear(),
      duration: '',
      visibility: 'public',
      tags: '',
    })
    setCoAuthors([''])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!videoFile) {
      setValidationError('Sélectionnez une vidéo')
      return
    }
    if (!formData.title.trim()) {
      setValidationError('Entrez un titre')
      return
    }
    if (formData.duration && parseInt(formData.duration) > MAX_DURATION_MINUTES) {
      setValidationError(`La durée indiquée dépasse le maximum autorisé (${MAX_DURATION_MINUTES} minutes)`)
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setValidationError('')

    try {
      const durationSec = parseInt(formData.duration) * 60 || 300

      const formDataMultipart = new FormData()
      formDataMultipart.append('videoFile', videoFile)
      formDataMultipart.append('title', formData.title)
      formDataMultipart.append('description', formData.description)
      formDataMultipart.append('category', formData.genre)
      formDataMultipart.append('duration', durationSec.toString())
      if (thumbnail) {
        formDataMultipart.append('thumbnail', thumbnail)
      }

      setUploadProgress(10)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 85 + 10
          setUploadProgress(Math.round(percentComplete))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const result = JSON.parse(xhr.responseText)
          setUploadProgress(100)
          setUploadedVideo(result)
          setUploadSuccess(true)
          setUploading(false)
        } else {
          const error = JSON.parse(xhr.responseText)
          setValidationError('Erreur: ' + (error.error || 'Upload failed'))
          setUploading(false)
        }
      })

      xhr.addEventListener('error', () => {
        setValidationError('Erreur de connexion')
        setUploading(false)
      })

      xhr.open('POST', 'http://localhost:5000/api/videos')
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(formDataMultipart)
    } catch (err) {
      setValidationError('Erreur: ' + err.message)
      setUploading(false)
    }
  }

  // Success state - show video preview
  if (uploadSuccess && uploadedVideo) {
    return (
      <div className="upload-container">
        <header className="upload-header">
          <div className="upload-header-content">
            <button onClick={onBack} className="back-btn-upload">← Retour</button>
            <h1>Uploader une vidéo</h1>
            <div></div>
          </div>
        </header>

        <main className="upload-main">
          <div className="success-container">
            <div className="success-icon-large">✅</div>
            <h1>Vidéo uploadée avec succès!</h1>
            <p className="success-subtitle">Votre vidéo est maintenant en attente de modération</p>

            <div className="video-preview-section">
              <h2>Aperçu de votre vidéo</h2>
              <div className="video-preview">
                <video 
                  ref={videoPreviewRef}
                  controls
                  width="100%"
                  poster={uploadedVideo.thumbnail ? getVideoUrl(uploadedVideo.thumbnail) : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"%3E%3Crect fill="%23111827" width="400" height="225"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="24"%3E📹%3C/text%3E%3C/svg%3E'}
                >
                  <source src={URL.createObjectURL(videoFile)} type={videoFile.type || 'video/mp4'} />
                  Votre navigateur ne supporte pas la lecture vidéo
                </video>
              </div>
              <div className="video-info">
                <p><strong>Titre:</strong> {formData.title}</p>
                <p><strong>Genre:</strong> {formData.genre}</p>
                <p><strong>Taille:</strong> {(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                {formData.description && <p><strong>Description:</strong> {formData.description}</p>}
              </div>
            </div>

            <div className="success-actions">
              <button onClick={handleGoHome} className="success-btn success-btn-primary">
                → Voir ma vidéo
              </button>
              <button onClick={handleUploadNewVideo} className="success-btn success-btn-secondary">
                ⬆️ Uploader une autre vidéo
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="upload-container">
      <header className="upload-header">
        <div className="upload-header-content">
          <button onClick={onBack} className="back-btn-upload">← Retour</button>
          <h1>Uploader une vidéo</h1>
          <div></div>
        </div>
      </header>

      <main className="upload-main">
        <div className="guide-section">
          <h2>Guide de publication</h2>
          <div className="guide-grid">
            <div className="guide-card">
              <div className="guide-icon">📹</div>
              <h3>Format vidéo</h3>
              <p>MP4 ou MOV — vidéo H.264, audio AAC</p>
            </div>
            <div className="guide-card">
              <div className="guide-icon">⏱️</div>
              <h3>Durée</h3>
              <p>Jusqu'à {MAX_DURATION_MINUTES} min</p>
            </div>
            <div className="guide-card">
              <div className="guide-icon">💾</div>
              <h3>Taille</h3>
              <p>Max 2 Go</p>
            </div>
          </div>
          <div className="guide-tips">
            <h4>✓ Conseils pour réussir</h4>
            <ul>
              <li>Donnez un titre accrocheur</li>
              <li>Écrivez une description détaillée</li>
              <li>Choisissez une bonne miniature</li>
              <li>Vérifiez la catégorie</li>
              <li>Si votre fichier est refusé, réexportez-le en H.264 (par exemple avec HandBrake, gratuit)</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="upload-section">
            <h2>Votre vidéo</h2>

            <div
              className={`drag-drop-area ${dragActive ? 'active' : ''} ${videoFile ? 'uploaded' : ''}`}
              onDragEnter={handleVideoDrag}
              onDragLeave={handleVideoDrag}
              onDragOver={handleVideoDrag}
              onDrop={handleVideoDrop}
              onClick={handleVideoClick}
            >
              {videoFile ? (
                <div className="upload-success">
                  <div className="success-icon">✓</div>
                  <h3>{videoFile.name}</h3>
                  <p>{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  <button type="button" className="upload-change-btn" onClick={handleVideoClick}>
                    Changer le fichier
                  </button>
                </div>
              ) : (
                <div className="upload-prompt">
                  <div className="upload-icon">📹</div>
                  <h3>Glissez votre vidéo ici</h3>
                  <p>ou cliquez pour sélectionner</p>
                  <span className="upload-hint">MP4, MOV (H.264/AAC) • Jusqu'à {MAX_DURATION_MINUTES} min • Jusqu'à 2 Go</span>
                </div>
              )}
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*,.mp4,.mov"
              onChange={handleVideoInputChange}
              style={{display: 'none'}}
            />

            {validationError && (
              <div className="validation-error">
                <span className="error-icon">⚠️</span>
                <span className="error-message">{validationError}</span>
              </div>
            )}

            {uploading && (
              <div className="progress-section">
                <div className="progress-label-container">
                  <p className="progress-label">Uploading...</p>
                  <p className="progress-percent">{Math.round(uploadProgress)}%</p>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${uploadProgress}%`}}></div>
                </div>
                <p className="progress-detail">Ne fermez pas cette fenêtre pendant l'upload</p>
              </div>
            )}
          </div>

          <div className="upload-section">
            <h2>Informations</h2>

            <div className="form-group">
              <label>Titre *</label>
              <input
                type="text"
                name="title"
                placeholder="Ex: Mon court métrage incroyable"
                value={formData.title}
                onChange={handleFormChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Décrivez votre film, l'histoire, vos intentions..."
                value={formData.description}
                onChange={handleFormChange}
                className="form-textarea"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Genre</label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  {GENRES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Année</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleFormChange}
                  className="form-input"
                  min="2000"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="form-group">
                <label>Durée (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  placeholder="Ex: 15"
                  value={formData.duration}
                  onChange={handleFormChange}
                  className={`form-input ${formData.duration && parseInt(formData.duration) > MAX_DURATION_MINUTES ? 'invalid' : ''}`}
                  min="1"
                  max={MAX_DURATION_MINUTES}
                />
                {formData.duration && parseInt(formData.duration) > MAX_DURATION_MINUTES && (
                  <p className="field-error">Maximum {MAX_DURATION_MINUTES} minutes</p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Visibilité</label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Non listé</option>
                  <option value="private">Privé</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="Ex: drame, école, amitié"
                  value={formData.tags}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="upload-section">
            <h2>Co-réalisateurs</h2>
            <div className="co-authors-list">
              {coAuthors.map((coAuthor, index) => (
                <div key={index} className="co-author-input">
                  <input
                    type="text"
                    placeholder="Nom du co-réalisateur"
                    value={coAuthor}
                    onChange={(e) => handleCoAuthorChange(index, e.target.value)}
                    className="form-input"
                  />
                  {coAuthors.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeCoAuthor(index)}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-btn"
              onClick={addCoAuthor}
            >
              + Ajouter un co-réalisateur
            </button>
          </div>

          <div className="upload-section">
            <h2>Miniature (optionnel)</h2>
            <button
              type="button"
              className="thumbnail-btn"
              onClick={handleThumbnailClick}
            >
              {thumbnail ? `✓ ${thumbnail.name}` : '🖼️ Sélectionner une miniature'}
            </button>
            <p className="form-hint">JPG, PNG • Recommandé: 1920x1080px</p>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              style={{display: 'none'}}
            />
          </div>

          <div className="submit-section">
            <button
              type="submit"
              className="submit-btn"
              disabled={uploading || !videoFile}
            >
              {uploading ? 'Upload en cours...' : '🚀 Uploader la vidéo'}
            </button>
            <p className="submit-hint">Votre vidéo sera en attente de modération</p>
          </div>
        </form>
      </main>
    </div>
  )
}
