const API_URL = 'http://localhost:5000/api'

export const api = {
  // Auth
  register: async (email, name, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    })
    return res.json()
  },

  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return res.json()
  },

  // Videos
  getAllVideos: async () => {
    const res = await fetch(`${API_URL}/videos`)
    return res.json()
  },

  getVideoById: async (id) => {
    const res = await fetch(`${API_URL}/videos/${id}`)
    return res.json()
  },

  createVideo: async (token, videoData) => {
    const res = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(videoData)
    })
    return res.json()
  },

  // Comments
  getVideoComments: async (videoId) => {
    const res = await fetch(`${API_URL}/videos/${videoId}/comments`)
    return res.json()
  },

  createComment: async (token, videoId, content) => {
    const res = await fetch(`${API_URL}/videos/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    })
    return res.json()
  },

  deleteComment: async (token, commentId) => {
    const res = await fetch(`${API_URL}/videos/comment/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  },

  // Likes
  getVideoLikes: async (videoId) => {
    const res = await fetch(`${API_URL}/videos/${videoId}/likes`)
    return res.json()
  },

  toggleLike: async (token, videoId) => {
    const res = await fetch(`${API_URL}/videos/${videoId}/likes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  },

  // User Profile
  getUserProfile: async (userId) => {
    const res = await fetch(`${API_URL}/users/${userId}`)
    return res.json()
  },

  getUserVideos: async (userId) => {
    const res = await fetch(`${API_URL}/users/${userId}/videos`)
    return res.json()
  },

  updateUserProfile: async (token, userId, profileData) => {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    })
    return res.json()
  }
}
