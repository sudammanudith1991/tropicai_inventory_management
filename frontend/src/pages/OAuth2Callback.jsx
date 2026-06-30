import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function OAuth2Callback() {
  const navigate = useNavigate()
  const { login, setUser } = useAuth()

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (token) {
      login(token)
      api.get('/auth/me')
        .then(r => { setUser(r.data); navigate('/') })
        .catch(() => navigate('/login'))
    } else {
      navigate('/login')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      Signing you in...
    </div>
  )
}
