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

  const handleLogin = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', authToken)
    setShowRegister(false)
    setCurrentPage('home')
  }

  const handleRegister = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', authToken)
    setShowRegister(false)
    setCurrentPage('home')
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setShowRegister(false)
    setCurrentPage('home')
  }

  const handleUpload = (uploadData) => {
    console.log('Upload data:', uploadData)
    alert('Merci ! Votre vidéo est en attente de modération. Vous serez notifié une fois acceptée.')
    setCurrentPage('home')
  }

  if (user) {
    if (currentPage === 'admin') {
      return (
        <AdminDashboard
          user={user}
          token={token}
          onLogout={handleLogout}
          onBack={() => setCurrentPage('home')}
        />
      )
    }
    if (currentPage === 'profile') {
      return (
        <Profile
          user={user}
          onBack={() => setCurrentPage('home')}
          onUploadClick={() => setCurrentPage('upload')}
          onLogout={handleLogout}
        />
      )
    }
    if (currentPage === 'upload') {
      return (
        <Upload
          user={user}
          token={token}
          onBack={() => setCurrentPage('profile')}
          onUpload={handleUpload}
        />
      )
    }
    if (currentPage === 'explore') {
      return (
        <Explore
          onNavigate={setCurrentPage}
          user={user}
          token={token}
          onProfileClick={() => setCurrentPage('profile')}
          onLogout={handleLogout}
        />
      )
    }
    if (currentPage === 'realisateurs') {
      return (
        <Realisateurs
          onNavigate={setCurrentPage}
          user={user}
          token={token}
          onProfileClick={() => setCurrentPage('profile')}
          onLogout={handleLogout}
        />
      )
    }
    return (
      <Home
        onNavigate={setCurrentPage}
        user={user}
        token={token}
        onProfileClick={() => setCurrentPage('profile')}
        onLogout={handleLogout}
        onAdminClick={user?.role === 'admin' ? () => setCurrentPage('admin') : null}
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
