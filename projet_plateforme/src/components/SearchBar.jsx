import { useState, useEffect, useRef } from 'react'
import { api } from '../api'
import '../styles/SearchBar.css'

export default function SearchBar({ onSelectVideo }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [allVideos, setAllVideos] = useState(null)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = async () => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
    if (allVideos === null) {
      setLoading(true)
      try {
        const data = await api.getAllVideos()
        setAllVideos(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Erreur recherche vidéos:', err)
        setAllVideos([])
      } finally {
        setLoading(false)
      }
    }
  }

  const handleClose = () => {
    setOpen(false)
    setQuery('')
  }

  const getCreatorName = (creator) => {
    return typeof creator === 'string' ? creator : creator?.name || 'Inconnu'
  }

  const formatDuration = (seconds) => {
    if (typeof seconds !== 'number') return seconds
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const query_ = query.trim().toLowerCase()
  const results = query_ && allVideos
    ? allVideos.filter(v =>
        v.title.toLowerCase().includes(query_) ||
        (v.category || '').toLowerCase().includes(query_) ||
        getCreatorName(v.creator).toLowerCase().includes(query_)
      ).slice(0, 8)
    : []

  const handleSelect = (video) => {
    onSelectVideo(video)
    handleClose()
  }

  return (
    <div className="search-bar-container" ref={containerRef}>
      {open ? (
        <div className="search-bar-expanded">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un film..."
            className="search-input"
          />
          <button className="search-close-btn" onClick={handleClose}>✕</button>

          {query_ && (
            <div className="search-results">
              {loading ? (
                <div className="search-message">Chargement...</div>
              ) : results.length === 0 ? (
                <div className="search-message">Aucun résultat pour "{query.trim()}"</div>
              ) : (
                results.map(video => (
                  <div key={video.id} className="search-result-item" onClick={() => handleSelect(video)}>
                    <div className="search-result-thumb">
                      <img src={video.thumbnail || '/thumbnails/default.jpg'} alt={video.title} />
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-title">{video.title}</div>
                      <div className="search-result-meta">
                        {video.category} • {formatDuration(video.duration)} • {getCreatorName(video.creator)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <button className="search-toggle-btn" onClick={handleOpen} title="Rechercher un film">
          🔍
        </button>
      )}
    </div>
  )
}
