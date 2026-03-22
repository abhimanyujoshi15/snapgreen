import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  // On app load, fetch user if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await API.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          setUser(res.data)
        } catch (err) {
          // Token invalid or expired
          logout()
        }
      }
      setLoading(false)
    }
    fetchUser()
  }, [token])

  const login = (tokenData, userData) => {
    localStorage.setItem('token', tokenData)
    setToken(tokenData)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext)