import api from './api'
import { productService } from './productService'

export const inventoryService = {
  // Get inventory items (simplified for Inventory component)
  async getInventory() {
    try {
      const response = await api.get('/admin/inventory/')
      return response.data
    } catch {
      // Fallback: use products with inventory info
      console.warn('Inventory endpoint not found, using products data')
      const products = await productService.getProducts(0, 1000)
      
      return products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        stock: product.stock_quantity || 0,
        unit: this.getUnitForCategory(product.category),
        min_stock: product.reorder_level || 10,
        last_updated: product.updated_at
      }))
    }
  },

  // Get inventory items (detailed version)
  async getInventoryItems(skip = 0, limit = 100) {
    try {
      const response = await api.get(`/admin/inventory/?skip=${skip}&limit=${limit}`)
      return response.data
    } catch {
      // Fallback: use products with inventory info
      console.warn('Inventory endpoint not found, using products data')
      const products = await productService.getProducts(skip, limit)
      
      return products.map(product => ({
        id: product.id,
        product_name: product.name,
        sku: product.sku || `SKU-${product.id}`,
        current_stock: product.stock_quantity || 0,
        reorder_level: product.reorder_level || 10,
        unit_cost: product.cost_price || 0,
        unit_price: product.price,
        supplier: product.supplier || 'Unknown',
        last_updated: product.updated_at,
        status: this.getStockStatus(product.stock_quantity || 0, product.reorder_level || 10),
        product_id: product.id
      }))
    }
  },

  // Get low stock items
  async getLowStockItems() {
    try {
      const response = await api.get('/admin/inventory/low-stock/')
      return response.data
    } catch {
      // Fallback: calculate from products
      console.warn('Low stock endpoint not found, calculating from products')
      const products = await productService.getProducts(0, 1000)
      
      return products
        .filter(product => 
          product.stock_quantity !== undefined && 
          product.stock_quantity < (product.reorder_level || 10)
        )
        .map(product => ({
          id: product.id,
          product_name: product.name,
          current_stock: product.stock_quantity,
          reorder_level: product.reorder_level || 10,
          status: 'low_stock'
        }))
    }
  },

  // Update stock (simplified for Inventory component)
  async updateStock(itemId, stockData) {
    try {
      const response = await api.put(`/admin/inventory/${itemId}/`, stockData)
      return response.data
    } catch {
      // Fallback: update product stock
      console.warn('Inventory update endpoint not found, updating product stock')
      return await productService.updateProduct(itemId, {
        stock_quantity: stockData.stock
      })
    }
  },

  // Update inventory
  async updateInventoryItem(itemId, inventoryData) {
    try {
      const response = await api.put(`/admin/inventory/${itemId}/`, inventoryData)
      return response.data
    } catch {
      // Fallback: update product stock
      console.warn('Inventory update endpoint not found, updating product stock')
      return await productService.updateProduct(itemId, {
        stock_quantity: inventoryData.current_stock,
        reorder_level: inventoryData.reorder_level
      })
    }
  },

  // Add stock movement
  async addStockMovement(movementData) {
    try {
      const response = await api.post('/admin/inventory/movements/', movementData)
      return response.data
    } catch {
      console.warn('Stock movement endpoint not found')
      throw new Error('Stock movement tracking not available')
    }
  },

  // Get stock movements
  async getStockMovements(productId = null, skip = 0, limit = 50) {
    try {
      const url = productId 
        ? `/admin/inventory/movements/?product_id=${productId}&skip=${skip}&limit=${limit}`
        : `/admin/inventory/movements/?skip=${skip}&limit=${limit}`
      const response = await api.get(url)
      return response.data
    } catch {
      console.warn('Stock movements endpoint not found')
      return []
    }
  },

  // Helper method to determine stock status
  getStockStatus(currentStock, reorderLevel) {
    if (currentStock === 0) return 'out_of_stock'
    if (currentStock <= reorderLevel) return 'low_stock'
    return 'in_stock'
  },

  // Helper method to get unit for category
  getUnitForCategory(category) {
    const units = {
      coffee: 'kg',
      tea: 'kg',
      dairy: 'liters',
      ingredients: 'kg',
      supplies: 'pieces'
    }
    return units[category] || 'pieces'
  },

  // Get inventory value
  async getInventoryValue() {
    try {
      const response = await api.get('/admin/inventory/value/')
      return response.data
    } catch {
      // Fallback: calculate from products
      console.warn('Inventory value endpoint not found, calculating from products')
      const products = await productService.getProducts(0, 1000)
      
      const totalValue = products.reduce((sum, product) => {
        const stock = product.stock_quantity || 0
        const cost = product.cost_price || product.price || 0
        return sum + (stock * cost)
      }, 0)
      
      return {
        totalInventoryValue: totalValue,
        totalItems: products.reduce((sum, product) => sum + (product.stock_quantity || 0), 0),
        totalProducts: products.length
      }
    }
  }
}
