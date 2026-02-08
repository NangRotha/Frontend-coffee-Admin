import { useState, useEffect } from 'react'
import { inventoryService } from '../services/inventoryService'

function Inventory() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [inventory, setInventory] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const data = await inventoryService.getInventory()
      setInventory(data)
      setLowStockItems(data.filter(item => item.stock <= 10))
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setError('Failed to load inventory data')
      // Use mock data as fallback
      setInventory(getMockInventory())
      setLowStockItems(getMockInventory().filter(item => item.stock <= 10))
    } finally {
      setLoading(false)
    }
  }

  const getMockInventory = () => [
    { id: 1, name: 'Espresso Beans', category: 'coffee', stock: 45, unit: 'kg', min_stock: 20, last_updated: '2024-01-15T10:30:00Z' },
    { id: 2, name: 'Milk', category: 'dairy', stock: 8, unit: 'liters', min_stock: 15, last_updated: '2024-01-15T09:15:00Z' },
    { id: 3, name: 'Sugar', category: 'ingredients', stock: 25, unit: 'kg', min_stock: 10, last_updated: '2024-01-14T16:45:00Z' },
    { id: 4, name: 'Cups (Small)', category: 'supplies', stock: 150, unit: 'pieces', min_stock: 100, last_updated: '2024-01-15T08:20:00Z' },
    { id: 5, name: 'Cups (Large)', category: 'supplies', stock: 120, unit: 'pieces', min_stock: 100, last_updated: '2024-01-15T08:20:00Z' },
    { id: 6, name: 'Lids', category: 'supplies', stock: 5, unit: 'pieces', min_stock: 100, last_updated: '2024-01-15T08:20:00Z' },
    { id: 7, name: 'Napkins', category: 'supplies', stock: 500, unit: 'pieces', min_stock: 200, last_updated: '2024-01-14T12:30:00Z' },
    { id: 8, name: 'Chocolate Syrup', category: 'ingredients', stock: 3, unit: 'liters', min_stock: 5, last_updated: '2024-01-15T11:45:00Z' }
  ]

  const handleStockUpdate = async (itemId, newStock) => {
    try {
      await inventoryService.updateStock(itemId, { stock: newStock })
      setSuccess('Stock updated successfully')
      setTimeout(() => setSuccess(''), 3000)
      fetchInventory()
    } catch {
      setError('Failed to update stock')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'red' }
    if (stock <= minStock) return { text: 'Low Stock', color: 'yellow' }
    return { text: 'In Stock', color: 'green' }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

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

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
          <button
            onClick={() => setSuccess('')}
            className="ml-4 text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-sm text-gray-700">Monitor and manage your coffee shop inventory levels</p>
        </div>
      </div>

      {/* Alert for low stock items */}
      {lowStockItems.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58.931c.75.126 1.281.805 1.281 1.549v9.346c0 .744-.526 1.423-1.281 1.549l-5.58.931c-.765.136-1.721.136-2.486 0L8.257 13.9c-.756-.126-1.281-.805-1.281-1.549V4.648c0-.744.525-1.423 1.281-1.549zm1.281 1.475l4.696-.781V13.81l-4.696.781V4.574zm-5.486 1.475V13.81l4.696-.781V4.574l-4.696.781z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{lowStockItems.length} items need to be restocked soon:</p>
                <ul className="mt-1 list-disc list-disc-inside">
                  {lowStockItems.slice(0, 3).map(item => (
                    <li key={item.id}>{item.name} ({item.stock} {item.unit})</li>
                  ))}
                  {lowStockItems.length > 3 && <li>...and {lowStockItems.length - 3} more</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inventory items..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Categories</option>
            <option value="coffee">Coffee</option>
            <option value="dairy">Dairy</option>
            <option value="ingredients">Ingredients</option>
            <option value="supplies">Supplies</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Item Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Current Stock</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Min Stock</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-sm text-gray-500">
                        No inventory items found
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const stockStatus = getStockStatus(item.stock, item.min_stock)
                      return (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {item.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className="capitalize">{item.category}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <input
                                type="number"
                                value={item.stock}
                                onChange={(e) => {
                                  const newStock = parseInt(e.target.value) || 0
                                  if (newStock >= 0) {
                                    handleStockUpdate(item.id, newStock)
                                  }
                                }}
                                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                min="0"
                              />
                              <span className="ml-2 text-xs text-gray-500">{item.unit}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.min_stock} {item.unit}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-${stockStatus.color}-100 text-${stockStatus.color}-800`}>
                              {stockStatus.text}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(item.last_updated).toLocaleDateString()}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleStockUpdate(item.id, item.stock + 10)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleStockUpdate(item.id, item.stock + 50)}
                              className="text-green-600 hover:text-green-900"
                            >
                              +50
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                  <dd className="text-lg font-medium text-gray-900">{inventory.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13 7.5V4a2 2 0 00-2-2h-2a2 2 0 00-2 2v3.5l-1.732 2.833C7.5 11.333 8.462 13 10 13h4.938z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                  <dd className="text-lg font-medium text-gray-900">{lowStockItems.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                  <dd className="text-lg font-medium text-gray-900">{inventory.filter(item => item.stock === 0).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Well Stocked</dt>
                  <dd className="text-lg font-medium text-gray-900">{inventory.filter(item => item.stock > 10).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inventory
