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

  verifyEmail: async (email, code) => {
    const res = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Verification failed')
    return data
  },

  resendCode: async (email) => {
    const res = await fetch(`${API_URL}/auth/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to resend')
    return data
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

  editComment: async (token, commentId, content) => {
    const res = await fetch(`${API_URL}/videos/comment/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    })
    return res.json()
  },

  editVideo: async (token, videoId, videoData) => {
    const res = await fetch(`${API_URL}/admin/videos/${videoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(videoData)
    })
    return res.json()
  },

  deleteComment: async (token, commentId) => {
    const res = await fetch(`${API_URL}/videos/comment/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Erreur suppression commentaire')
    }
    return res.json()
  },

  getCommentReplies: async (commentId) => {
    const res = await fetch(`${API_URL}/videos/comment/${commentId}/replies`)
    return res.json()
  },

  replyToComment: async (token, commentId, content) => {
    const res = await fetch(`${API_URL}/videos/comment/${commentId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
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
  },

  // Admin
  getAdminStats: async (token) => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  },

  getAdminVideos: async (token, status = null) => {
    const url = status 
      ? `${API_URL}/admin/videos?status=${status}`
      : `${API_URL}/admin/videos`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  },

  approveVideo: async (token, videoId) => {
    const res = await fetch(`${API_URL}/admin/videos/${videoId}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  },

  rejectVideo: async (token, videoId, reason) => {
    const res = await fetch(`${API_URL}/admin/videos/${videoId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    })
    return res.json()
  },

  getAdminComments: async (token, status = null) => {
    const url = status
      ? `${API_URL}/admin/comments?status=${status}`
      : `${API_URL}/admin/comments`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  },

  approveComment: async (token, commentId) => {
    const res = await fetch(`${API_URL}/admin/comments/${commentId}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  },

  rejectComment: async (token, commentId) => {
    const res = await fetch(`${API_URL}/admin/comments/${commentId}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  },

  deleteVideo: async (token, videoId) => {
    const res = await fetch(`${API_URL}/admin/videos/${videoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  },

  deleteCommentAdmin: async (token, commentId) => {
    const res = await fetch(`${API_URL}/admin/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  },

  getAdminUsers: async (token) => {
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  },

  deleteUser: async (token, userId) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return res.json()
  }
}
