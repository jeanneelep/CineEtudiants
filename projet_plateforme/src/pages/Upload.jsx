import { useState, useRef } from 'react'
import { api } from '../api'
import '../styles/Upload.css'

const GENRES = [
  'Drame', 'Comédie', 'Animation', 'Documentaire', 'Poétique',
  'Expérimental', 'Horreur', 'Thriller', 'Romance', 'Action',
  'Science-fiction', 'Fantasy', 'Aventure', 'Historique', 'Autre'
]

export default function Upload({ user, token, onBack, onUpload }) {
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
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
      } else {
        alert('Format invalide. MP4 ou MOV max 3GB')
      }
    }
  }

  const isValidVideoFile = (file) => {
    const validTypes = ['video/mp4', 'video/quicktime']
    const validExt = ['.mp4', '.mov']
    const isType = validTypes.includes(file.type)
    const isExt = validExt.some(ext => file.name.toLowerCase().endsWith(ext))
    const isSize = file.size <= 3 * 1024 * 1024 * 1024
    return (isType || isExt) && isSize
  }

  const handleVideoClick = () => videoInputRef.current?.click()
  const handleVideoInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file && isValidVideoFile(file)) {
      setVideoFile(file)
    } else if (file) {
      alert('Fichier trop gros ou mauvais format')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!videoFile) {
      alert('Sélectionnez une vidéo')
      return
    }
    if (!formData.title.trim()) {
      alert('Entrez un titre')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const durationSec = parseInt(formData.duration) * 60 || 300
      const videoData = {
        title: formData.title,
        description: formData.description,
        category: formData.genre,
        duration: durationSec,
        url: videoFile.name,
        thumbnail: thumbnail?.name || null
      }

      setUploadProgress(50)
      const result = await api.createVideo(token, videoData)

      if (result.error) {
        alert('Erreur: ' + result.error)
        setUploading(false)
      } else {
        setUploadProgress(100)
        setTimeout(() => {
          onUpload(result)
          setUploading(false)
          setUploadProgress(0)
        }, 500)
      }
    } catch (err) {
      alert('Erreur: ' + err.message)
      setUploading(false)
    }
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
              <p>MP4 ou MOV</p>
            </div>
            <div className="guide-card">
              <div className="guide-icon">⏱️</div>
              <h3>Durée</h3>
              <p>3 min à 30 min</p>
            </div>
            <div className="guide-card">
              <div className="guide-icon">💾</div>
              <h3>Taille</h3>
              <p>Max 3 GB</p>
            </div>
          </div>
          <div className="guide-tips">
            <h4>✓ Conseils pour réussir</h4>
            <ul>
              <li>Donnez un titre accrocheur</li>
              <li>Écrivez une description détaillée</li>
              <li>Choisissez une bonne miniature</li>
              <li>Vérifiez la catégorie</li>
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
                  <span className="upload-hint">MP4, MOV • Jusqu'à 3 GB</span>
                </div>
              )}
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,.mp4,video/quicktime,.mov"
              onChange={handleVideoInputChange}
              style={{display: 'none'}}
            />

            {uploading && (
              <div className="progress-section">
                <p className="progress-label">Upload en cours...</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${uploadProgress}%`}}></div>
                </div>
                <p className="progress-percent">{Math.round(uploadProgress)}%</p>
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
                  className="form-input"
                  min="1"
                  max="120"
                />
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
