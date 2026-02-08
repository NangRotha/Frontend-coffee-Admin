import api from './api'

export const authService = {
  // Login user
  async login(credentials) {
    console.log('authService.login called with:', credentials.email)
    
    // OAuth2PasswordRequestForm expects 'username' field, not 'email'
    const params = new URLSearchParams()
    params.append('username', credentials.email)
    params.append('password', credentials.password)
    
    console.log('Making login request...')
    
    try {
      const response = await api.post('/auth/login', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      console.log('Login response received:', response.status)
      const { access_token, user } = response.data
      
      // Store token and user info
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
      
      console.log('Login successful, user stored')
      return { access_token, user }
    } catch (error) {
      console.error('Login error in authService:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      throw error
    }
  },

  // Register user
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Logout user
  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/users/me')
      return response.data
    } catch (error) {
      console.error('Failed to get current user:', error)
      // If token is invalid, logout
      if (error.response?.status === 401) {
        this.logout()
      }
      throw error
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('access_token')
    return !!token
  },

  // Get stored user
  getStoredUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}
