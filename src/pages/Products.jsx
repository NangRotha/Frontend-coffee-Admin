import { useState, useEffect } from 'react'
import { productService } from '../services/productService'
import { getImageUrl } from '../services/api'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false)
  const [bulkUpdateData, setBulkUpdateData] = useState({
    is_available: null,
    category: '',
    stock_adjustment: 0
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'coffee',
    stock: 0,
    is_available: true,
    image_url: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getProducts()
      setProducts(data)
    } catch (err) {
      let errorMessage = 'Failed to fetch products'
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.'
        // Clear invalid token and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else if (err.response?.status === 403) {
        errorMessage = 'Permission denied. You need admin or staff role.'
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.'
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      setError(errorMessage)
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData, imageFile)
      } else {
        await productService.createProduct(formData, imageFile)
      }
      setShowModal(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'coffee',
        stock: 0,
        is_available: true,
        image_url: ''
      })
      setImageFile(null)
      setImagePreview('')
      fetchProducts()
    } catch (err) {
      setError('Failed to save product')
      console.error('Error saving product:', err)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      is_available: product.is_available,
      image_url: product.image_url || ''
    })
    setImagePreview(product.image_url || '')
    setImageFile(null)
    setShowModal(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId)
        fetchProducts()
      } catch (err) {
        setError('Failed to delete product')
        console.error('Error deleting product:', err)
      }
    }
  }

  const openModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'coffee',
      stock: 0,
      is_available: true,
      image_url: ''
    })
    setImageFile(null)
    setImagePreview('')
    setShowModal(true)
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'red' }
    if (stock < 10) return { text: 'Low Stock', color: 'yellow' }
    return { text: 'In Stock', color: 'green' }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }
      
      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData({...formData, image_url: ''})
  }

  // Bulk update functions
  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)))
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedProducts.size === 0) {
      setError('Please select at least one product to update')
      return
    }
    setShowBulkUpdateModal(true)
  }

  const handleBulkUpdateSubmit = async () => {
    try {
      setLoading(true)
      const updatePromises = Array.from(selectedProducts).map(productId => {
        const updateData = {}
        if (bulkUpdateData.is_available !== null) {
          updateData.is_available = bulkUpdateData.is_available
        }
        if (bulkUpdateData.category) {
          updateData.category = bulkUpdateData.category
        }
        if (bulkUpdateData.stock_adjustment !== 0) {
          const product = products.find(p => p.id === productId)
          updateData.stock = Math.max(0, product.stock + bulkUpdateData.stock_adjustment)
        }
        
        return productService.updateProduct(productId, updateData)
      })
      
      await Promise.all(updatePromises)
      
      setSelectedProducts(new Set())
      setShowBulkUpdateModal(false)
      setBulkUpdateData({
        is_available: null,
        category: '',
        stock_adjustment: 0
      })
      fetchProducts()
    } catch (err) {
      setError('Failed to update products')
      console.error('Error updating products:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="sm:flex sm:items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all products in your coffee shop including their name, price, category and stock status.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
          {selectedProducts.size > 0 && (
            <>
              <button
                type="button"
                onClick={handleBulkUpdate}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Update {selectedProducts.size} selected
              </button>
              <button
                type="button"
                onClick={() => setSelectedProducts(new Set())}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Clear selection
              </button>
            </>
          )}
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add product
          </button>
        </div>
      </div>

      {/* Bulk selection controls */}
      {products.length > 0 && (
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedProducts.size === products.length && products.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Select all ({selectedProducts.size} selected)
            </label>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const stockStatus = getStockStatus(product.stock)
          return (
            <div key={product.id} className={`bg-white overflow-hidden shadow rounded-lg relative ${selectedProducts.has(product.id) ? 'ring-2 ring-indigo-500' : ''}`}>
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="aspect-w-1 aspect-h-1 w-full h-48 bg-gray-200">
                {product.image_url ? (
                  <img 
                    src={getImageUrl(product.image_url)} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                <div className="mt-2">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    product.category === 'coffee' 
                      ? 'bg-brown-100 text-brown-800'
                      : product.category === 'food'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {product.category}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-${stockStatus.color}-100 text-${stockStatus.color}-800`}>
                    {stockStatus.text}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-sm text-gray-500">
                  <span>Stock: {product.stock}</span>
                  <span>{product.is_available ? 'Available' : 'Unavailable'}</span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Price
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        step="0.01"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="coffee">Coffee</option>
                        <option value="tea">Tea</option>
                        <option value="smoothie">Smoothie</option>
                        <option value="pastry">Pastry</option>
                        <option value="sandwich">Sandwich</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        name="stock"
                        id="stock"
                        min="0"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                        Product Image
                      </label>
                      <div className="mt-1">
                        {imagePreview || formData.image_url ? (
                          <div className="relative">
                            <img 
                              src={imagePreview || getImageUrl(formData.image_url)} 
                              alt="Product preview" 
                              className="h-32 w-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 w-32 border-2 border-gray-300 border-dashed rounded-lg">
                            <div className="text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <label htmlFor="image" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                  Click to upload
                                </span>
                                <input
                                  id="image"
                                  name="image"
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_available"
                        id="is_available"
                        checked={formData.is_available}
                        onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                        Available
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Update {selectedProducts.size} Selected Products
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose what to update for all selected products
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Availability Status
                    </label>
                    <select
                      value={bulkUpdateData.is_available === null ? '' : bulkUpdateData.is_available}
                      onChange={(e) => setBulkUpdateData({...bulkUpdateData, is_available: e.target.value === '' ? null : e.target.value === 'true'})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">No change</option>
                      <option value="true">Set as Available</option>
                      <option value="false">Set as Unavailable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={bulkUpdateData.category}
                      onChange={(e) => setBulkUpdateData({...bulkUpdateData, category: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">No change</option>
                      <option value="coffee">Coffee</option>
                      <option value="tea">Tea</option>
                      <option value="smoothie">Smoothie</option>
                      <option value="pastry">Pastry</option>
                      <option value="sandwich">Sandwich</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stock Adjustment
                    </label>
                    <input
                      type="number"
                      value={bulkUpdateData.stock_adjustment}
                      onChange={(e) => setBulkUpdateData({...bulkUpdateData, stock_adjustment: parseInt(e.target.value) || 0})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter amount to add (positive) or subtract (negative)"
                    />
                    <p className="mt-1 text-xs text-gray-500">Positive to add stock, negative to remove stock</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleBulkUpdateSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Update Products
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkUpdateModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
