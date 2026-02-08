import api from './api'

export const productService = {
  // Get all products
  async getProducts(skip = 0, limit = 100, category = null, availableOnly = true) {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      available_only: availableOnly.toString()
    })
    
    if (category) {
      params.append('category', category)
    }
    
    const response = await api.get(`/products/?${params}`)
    return response.data
  },

  // Get product by ID
  async getProduct(productId) {
    const response = await api.get(`/products/${productId}/`)
    return response.data
  },

  // Create product with image upload
  async createProduct(productData, imageFile = null) {
    if (imageFile) {
      const formData = new FormData()
      
      // Add all product fields
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key])
        }
      })
      
      // Add image file
      formData.append('image_file', imageFile)
      
      const response = await api.post('/products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } else {
      const response = await api.post('/products/', productData)
      return response.data
    }
  },

  // Update product with image upload
  async updateProduct(productId, productData, imageFile = null) {
    if (imageFile) {
      const formData = new FormData()
      
      // Add all product fields
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key])
        }
      })
      
      // Add image file
      formData.append('image_file', imageFile)
      
      const response = await api.put(`/products/${productId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } else {
      const response = await api.put(`/products/${productId}/`, productData)
      return response.data
    }
  },

  // Delete product
  async deleteProduct(productId) {
    const response = await api.delete(`/products/${productId}/`)
    return response.data
  }
}
