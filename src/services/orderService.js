import api from './api'

export const orderService = {
  // Get all orders
  async getOrders(skip = 0, limit = 100, status = null) {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    })
    
    if (status) {
      params.append('status', status)
    }
    
    const response = await api.get(`/orders/?${params}`)
    return response.data
  },

  // Get order by ID
  async getOrder(orderId) {
    const response = await api.get(`/orders/${orderId}/`)
    return response.data
  },

  // Create order
  async createOrder(orderData) {
    const response = await api.post('/orders/', orderData)
    return response.data
  },

  // Update order
  async updateOrder(orderId, orderData) {
    const response = await api.put(`/orders/${orderId}/`, orderData)
    return response.data
  },

  // Delete order
  async deleteOrder(orderId) {
    const response = await api.delete(`/orders/${orderId}/`)
    return response.data
  }
}
