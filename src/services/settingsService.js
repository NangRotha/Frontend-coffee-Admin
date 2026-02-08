import api from './api'

export const settingsService = {
  // Get shop settings
  async getSettings() {
    const response = await api.get('/admin/settings/')
    return response.data
  },

  // Update shop settings
  async updateSettings(settingsData) {
    const response = await api.put('/admin/settings/', settingsData)
    return response.data
  },

  // Get business hours
  async getBusinessHours() {
    const response = await api.get('/admin/business-hours/')
    return response.data
  },

  // Update business hours
  async updateBusinessHours(hoursData) {
    const response = await api.put('/admin/business-hours/', hoursData)
    return response.data
  }
}
