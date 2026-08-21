import { useState, useEffect, useRef } from 'react'
import { api } from '../api'
import '../styles/SearchBar.css'

export default function SearchBar({ onSelectVideo, onSelectCreator }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [allVideos, setAllVideos] = useState(null)
  const [allCreators, setAllCreators] = useState(null)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const getVideoUrl = (url) => {
    if (url.startsWith('http')) return url
    return `http://localhost:5000${url}`
  }

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
    if (allVideos === null || allCreators === null) {
      setLoading(true)
      try {
        const [videos, creators] = await Promise.all([
          api.getAllVideos(),
          api.getCreators()
        ])
        setAllVideos(Array.isArray(videos) ? videos : [])
        setAllCreators(Array.isArray(creators) ? creators : [])
      } catch (err) {
        console.error('Erreur recherche:', err)
        setAllVideos([])
        setAllCreators([])
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

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null
    if (avatarPath.startsWith('http')) return avatarPath
    return `http://localhost:5000${avatarPath}`
  }

  const formatDuration = (seconds) => {
    if (typeof seconds !== 'number') return seconds
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const query_ = query.trim().toLowerCase()

  const videoResults = query_ && allVideos
    ? allVideos.filter(v =>
        v.title.toLowerCase().includes(query_) ||
        (v.category || '').toLowerCase().includes(query_) ||
        getCreatorName(v.creator).toLowerCase().includes(query_)
      ).slice(0, 6)
    : []

  const creatorResults = query_ && allCreators
    ? allCreators.filter(c => c.name.toLowerCase().includes(query_)).slice(0, 5)
    : []

  const hasResults = videoResults.length > 0 || creatorResults.length > 0

  const handleSelectVideo = (video) => {
    onSelectVideo(video)
    handleClose()
  }

  const handleSelectCreator = (creator) => {
    onSelectCreator?.(creator)
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
            placeholder="Rechercher un film ou un réalisateur..."
            className="search-input"
          />
          <button className="search-close-btn" onClick={handleClose}>✕</button>

          {query_ && (
            <div className="search-results">
              {loading ? (
                <div className="search-message">Chargement...</div>
              ) : !hasResults ? (
                <div className="search-message">Aucun résultat pour "{query.trim()}"</div>
              ) : (
                <>
                  {videoResults.length > 0 && (
                    <>
                      <div className="search-section-label">Films</div>
                      {videoResults.map(video => (
                        <div key={video.id} className="search-result-item" onClick={() => handleSelectVideo(video)}>
                          <div className="search-result-thumb">
                            <img src={video.thumbnail ? getVideoUrl(video.thumbnail) : '/thumbnails/default.jpg'} alt={video.title} />
                          </div>
                          <div className="search-result-info">
                            <div className="search-result-title">{video.title}</div>
                            <div className="search-result-meta">
                              {video.category} • {formatDuration(video.duration)} • {getCreatorName(video.creator)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {creatorResults.length > 0 && (
                    <>
                      <div className="search-section-label">Réalisateurs</div>
                      {creatorResults.map(creator => (
                        <div key={creator.id} className="search-result-item" onClick={() => handleSelectCreator(creator)}>
                          <div className="search-result-avatar">
                            {getAvatarUrl(creator.avatar) ? (
                              <img src={getAvatarUrl(creator.avatar)} alt={creator.name} />
                            ) : (
                              creator.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="search-result-info">
                            <div className="search-result-title">{creator.name}</div>
                            <div className="search-result-meta">{creator.videoCount} film{creator.videoCount > 1 ? 's' : ''} • {creator.likesReceived} likes</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <button className="search-toggle-btn" onClick={handleOpen} title="Rechercher un film ou un réalisateur">
          🔍
        </button>
      )}
    </div>
  )
}
