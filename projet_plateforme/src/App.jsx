import { useState, useEffect } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Realisateurs from './pages/Realisateurs'
import Profile from './pages/Profile'
import Upload from './pages/Upload'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [showRegister, setShowRegister] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')
  const [pageHistory, setPageHistory] = useState([])
  const [pendingVideo, setPendingVideo] = useState(null)
  const [pendingCreatorLetter, setPendingCreatorLetter] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)
      } catch (e) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  const navigateTo = (page) => {
    setPageHistory(prev => [...prev, currentPage])
    setCurrentPage(page)
  }

  const goBack = () => {
    setPageHistory(prev => {
      if (prev.length === 0) {
        setCurrentPage('home')
        return prev
      }
      const newHistory = [...prev]
      const previousPage = newHistory.pop()
      setCurrentPage(previousPage)
      return newHistory
    })
  }

  const handleLogin = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', authToken)
    setShowRegister(false)
    setPageHistory([])
    setCurrentPage('home')
  }

  const handleRegister = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', authToken)
    setShowRegister(false)
    setPageHistory([])
    setCurrentPage('home')
  }

  const handleUserUpdate = (updatedFields) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedFields }
      localStorage.setItem('user', JSON.stringify(merged))
      return merged
    })
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setShowRegister(false)
    setPageHistory([])
    setCurrentPage('home')
  }

  const handleOpenVideoFromSearch = (video) => {
    setPendingVideo(video)
    navigateTo('home')
  }

  const handleOpenCreatorFromSearch = (creator) => {
    setPendingCreatorLetter(creator.name.charAt(0).toUpperCase())
    navigateTo('realisateurs')
  }

  const handleUpload = (uploadData) => {
    console.log('Upload data:', uploadData)
    alert('Merci ! Votre vidéo est en attente de modération. Vous serez notifié une fois acceptée.')
    navigateTo('home')
  }

  if (user) {
    if (currentPage === 'admin') {
      return (
        <AdminDashboard
          user={user}
          token={token}
          onLogout={handleLogout}
          onBack={goBack}
        />
      )
    }
    if (currentPage === 'profile') {
      return (
        <Profile
          user={user}
          token={token}
          onBack={goBack}
          onUploadClick={() => navigateTo('upload')}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      )
    }
    if (currentPage === 'upload') {
      return (
        <Upload
          user={user}
          token={token}
          onBack={goBack}
          onUpload={handleUpload}
        />
      )
    }
    if (currentPage === 'explore') {
      return (
        <Explore
          onNavigate={navigateTo}
          user={user}
          token={token}
          onProfileClick={() => navigateTo('profile')}
          onLogout={handleLogout}
          pendingVideo={pendingVideo}
          onPendingVideoConsumed={() => setPendingVideo(null)}
          onOpenCreator={handleOpenCreatorFromSearch}
        />
      )
    }
    if (currentPage === 'realisateurs') {
      return (
        <Realisateurs
          onNavigate={navigateTo}
          user={user}
          token={token}
          onProfileClick={() => navigateTo('profile')}
          onLogout={handleLogout}
          onOpenVideo={handleOpenVideoFromSearch}
          pendingCreatorLetter={pendingCreatorLetter}
          onPendingCreatorLetterConsumed={() => setPendingCreatorLetter(null)}
        />
      )
    }
    return (
      <Home
        onNavigate={navigateTo}
        user={user}
        token={token}
        onProfileClick={() => navigateTo('profile')}
        onLogout={handleLogout}
        onAdminClick={user?.role === 'admin' ? () => navigateTo('admin') : null}
        pendingVideo={pendingVideo}
        onPendingVideoConsumed={() => setPendingVideo(null)}
        onOpenCreator={handleOpenCreatorFromSearch}
      />
    )
  }

  if (showRegister) {
    return (
      <Register
        onRegister={handleRegister}
        onSwitchLogin={() => setShowRegister(false)}
      />
    )
  }

  return (
    <Login
      onLogin={handleLogin}
      onSwitchRegister={() => setShowRegister(true)}
    />
  )
}

export default App
