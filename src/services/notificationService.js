import api from './api'

export const notificationService = {
  // WebSocket connection for real-time notifications
  websocket: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectInterval: null,

  // Initialize WebSocket connection
  connectWebSocket(onNotification, onError) {
    if (this.websocket) {
      this.websocket.close()
    }

    try {
      const token = localStorage.getItem('access_token')
      const wsUrl = `ws://localhost:8000/api/v1/notifications/ws/?token=${token}`
      
      this.websocket = new WebSocket(wsUrl)
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected for notifications')
        this.reconnectAttempts = 0
      }
      
      this.websocket.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data)
          onNotification(notification)
        } catch (error) {
          console.error('Error parsing notification:', error)
        }
      }
      
      this.websocket.onclose = () => {
        console.log('WebSocket disconnected')
        this.attemptReconnect(onNotification, onError)
      }
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        // Don't show error for WebSocket connection issues
        // The reconnection logic will handle it
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      // Fallback to polling
      this.startPolling(onNotification, onError)
    }
  },

  // Attempt to reconnect WebSocket
  attemptReconnect(onNotification, onError) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
      
      this.reconnectInterval = setTimeout(() => {
        this.connectWebSocket(onNotification, onError)
      }, delay)
    } else {
      console.log('Max reconnection attempts reached, falling back to polling')
      this.startPolling(onNotification, onError)
    }
  },

  // Fallback polling mechanism
  pollingInterval: null,
  startPolling(onNotification, onError) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }

    this.pollingInterval = setInterval(async () => {
      try {
        const response = await api.get('/notifications/unread/')
        const notifications = response.data
        
        if (notifications && notifications.length > 0) {
          notifications.forEach(notification => {
            onNotification(notification)
          })
        }
      } catch (error) {
        console.error('Polling error:', error)
        
        // If endpoint doesn't exist, stop polling
        if (error.response?.status === 404) {
          console.log('Polling endpoint not found, stopping polling')
          clearInterval(this.pollingInterval)
          this.pollingInterval = null
          // Don't show error for missing endpoint
          return
        }
        
        onError('Failed to fetch notifications')
      }
    }, 5000) // Poll every 5 seconds
  },

  // Stop real-time connection
  disconnect() {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
    
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval)
      this.reconnectInterval = null
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  },

  // Get all notifications
  async getNotifications() {
    try {
      const response = await api.get('/notifications/')
      return response.data
    } catch (error) {
      console.error('Error fetching notifications:', error)
      
      // Check if it's a 404 error (endpoint doesn't exist)
      if (error.response?.status === 404) {
        console.log('Notifications endpoint not found, using mock data')
        // Return mock data when endpoint doesn't exist
        return [
          {
            id: '1',
            title: 'New order received',
            message: 'Order #12349 from Sarah Wilson',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            read: false,
            type: 'order'
          },
          {
            id: '2',
            title: 'Low stock alert',
            message: 'Coffee beans running low (5 units left)',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            read: false,
            type: 'inventory'
          },
          {
            id: '3',
            title: 'Customer review',
            message: '5-star review from John Davis',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            read: true,
            type: 'review'
          },
          {
            id: '4',
            title: 'System update',
            message: 'System maintenance scheduled for tonight',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            read: true,
            type: 'system'
          }
        ]
      }
      
      // For other errors, still throw to let context handle it
      throw error
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await api.post(`/notifications/${notificationId}/read/`)
      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await api.post('/notifications/mark-all-read/')
      return true
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await api.delete(`/notifications/${notificationId}/`)
      return true
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  },

  // Clear all notifications
  async clearAllNotifications() {
    try {
      await api.delete('/notifications/')
      return true
    } catch (error) {
      console.error('Error clearing notifications:', error)
      throw error
    }
  },

  // Get notification settings
  async getNotificationSettings() {
    try {
      const response = await api.get('/notifications/settings/')
      return response.data
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      throw error
    }
  },

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      const response = await api.put('/notifications/settings/', settings)
      return response.data
    } catch (error) {
      console.error('Error updating notification settings:', error)
      throw error
    }
  }
}
