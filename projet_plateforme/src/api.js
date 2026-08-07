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
  }
}
