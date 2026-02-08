import api from './api'
import { orderService } from './orderService'
import { userService } from './userService'
import { productService } from './productService'

export const analyticsService = {
  // Get comprehensive analytics data
  async getAnalytics(timeRange = '7d') {
    try {
      const response = await api.get(`/admin/analytics/?time_range=${timeRange}`)
      return response.data
    } catch {
      // Fallback: calculate from existing services
      console.warn('Analytics endpoint not found, calculating from existing data')
      
      const [salesData, , productData, orderData] = await Promise.all([
        this.getSalesAnalytics(timeRange),
        this.getCustomerAnalytics(),
        this.getProductAnalytics(),
        this.getOrderAnalytics(timeRange)
      ])
      
      return {
        totalRevenue: salesData.totalRevenue || 0,
        totalOrders: orderData.totalOrders || 0,
        averageOrderValue: salesData.averageOrderValue || 0,
        topProducts: productData.topSellingProducts || [],
        recentOrders: [], // Would need more detailed order data
        salesByCategory: [], // Would need product category analysis
        dailySales: salesData.dailySales || []
      }
    }
  },

  // Get sales analytics
  async getSalesAnalytics(period = '30d') {
    try {
      const response = await api.get(`/admin/analytics/sales/?period=${period}`)
      return response.data
    } catch {
      // Fallback: calculate from orders
      console.warn('Sales analytics endpoint not found, calculating from orders')
      const orders = await orderService.getOrders(0, 1000)
      
      // Simple sales calculation
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const totalOrders = orders.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      
      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        period,
        dailySales: [] // Would need more complex logic for real implementation
      }
    }
  },

  // Get customer analytics
  async getCustomerAnalytics() {
    try {
      const response = await api.get('/admin/analytics/customers/')
      return response.data
    } catch {
      // Fallback: calculate from users
      console.warn('Customer analytics endpoint not found, calculating from users')
      const users = await userService.getUsers(0, 1000)
      
      const totalCustomers = users.filter(user => user.role === 'customer').length
      const newCustomersThisMonth = users.filter(user => {
        const createdAt = new Date(user.created_at)
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        return createdAt > oneMonthAgo
      }).length
      
      return {
        totalCustomers,
        newCustomersThisMonth,
        customerGrowthRate: 0 // Would need historical data
      }
    }
  },

  // Get product analytics
  async getProductAnalytics() {
    try {
      const response = await api.get('/admin/analytics/products/')
      return response.data
    } catch {
      // Fallback: basic product stats
      console.warn('Product analytics endpoint not found, using basic stats')
      const products = await productService.getProducts(0, 1000)
      
      const totalProducts = products.length
      const activeProducts = products.filter(product => product.is_active).length
      const lowStockProducts = products.filter(product => 
        product.stock_quantity && product.stock_quantity < 10
      ).length
      
      return {
        totalProducts,
        activeProducts,
        lowStockProducts,
        topSellingProducts: [] // Would need order data
      }
    }
  },

  // Get order analytics
  async getOrderAnalytics(period = '30d') {
    try {
      const response = await api.get(`/admin/analytics/orders/?period=${period}`)
      return response.data
    } catch {
      // Fallback: calculate from orders
      console.warn('Order analytics endpoint not found, calculating from orders')
      const orders = await orderService.getOrders(0, 1000)
      
      const totalOrders = orders.length
      const pendingOrders = orders.filter(order => order.status === 'pending').length
      const completedOrders = orders.filter(order => order.status === 'completed').length
      const cancelledOrders = orders.filter(order => order.status === 'cancelled').length
      
      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        orderStatusDistribution: {
          pending: pendingOrders,
          completed: completedOrders,
          cancelled: cancelledOrders
        }
      }
    }
  }
}
