import { createContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export { AuthContext }
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getStoredUser()
          setUser(currentUser)
          
          // Optionally verify token with backend
          try {
            const verifiedUser = await authService.getCurrentUser()
            setUser(verifiedUser)
          } catch (error) {
            console.error('Token verification failed:', error)
            authService.logout()
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    const { access_token, user } = await authService.login(credentials)
    setUser(user)
    return { access_token, user }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

