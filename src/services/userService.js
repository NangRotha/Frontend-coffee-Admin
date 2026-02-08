import api from './api'

export const userService = {
  // Get all users
  async getUsers(skip = 0, limit = 100) {
    const response = await api.get(`/users/?skip=${skip}&limit=${limit}`)
    return response.data
  },

  // Get user by ID
  async getUser(userId) {
    const response = await api.get(`/users/${userId}/`)
    return response.data
  },

  // Create user
  async createUser(userData) {
    const response = await api.post('/auth/register/', userData)
    return response.data
  },

  // Update user
  async updateUser(userId, userData) {
    const response = await api.put(`/users/${userId}/`, userData)
    return response.data
  },

  // Delete user
  async deleteUser(userId) {
    const response = await api.delete(`/users/${userId}/`)
    return response.data
  }
}
