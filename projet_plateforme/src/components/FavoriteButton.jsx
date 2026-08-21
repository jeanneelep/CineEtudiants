import { useState } from 'react'
import { api } from '../api'

export default function FavoriteButton({ videoId, user, token, isFavorite: initialFavorite, count: initialCount, onUpdate }) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite || false)
  const [count, setCount] = useState(initialCount || 0)
  const [loading, setLoading] = useState(false)

  const handleToggleFavorite = async (e) => {
    e.stopPropagation()

    if (!user || !token) {
      alert('Veuillez vous connecter pour ajouter aux favoris')
      return
    }

    setLoading(true)
    try {
      const result = await api.toggleFavorite(token, videoId)
      const newIsFavorite = result.favorited || !isFavorite
      setIsFavorite(newIsFavorite)

      if (newIsFavorite) {
        setCount(count + 1)
      } else {
        setCount(Math.max(0, count - 1))
      }

      if (onUpdate) {
        onUpdate(newIsFavorite, newIsFavorite ? count + 1 : count - 1)
      }
    } catch (err) {
      console.error('Erreur toggle favoris:', err)
      alert('Erreur lors de la mise à jour des favoris')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
      onClick={handleToggleFavorite}
      disabled={loading}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isFavorite ? '⭐' : '☆'}
    </button>
  )
}
