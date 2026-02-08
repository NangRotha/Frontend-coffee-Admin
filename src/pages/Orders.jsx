import { useState, useEffect, useCallback } from 'react'
import { orderService } from '../services/orderService'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState(new Set())
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false)
  const [bulkStatusUpdate, setBulkStatusUpdate] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [newStatus, setNewStatus] = useState('')

  const ordersPerPage = 10

  const showSuccessMessage = (message) => {
    setSuccess(message)
    setTimeout(() => setSuccess(''), 3000)
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter, searchTerm])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const skip = (currentPage - 1) * ordersPerPage
      const data = await orderService.getOrders(skip, ordersPerPage, statusFilter || null)
      
      // Filter by search term if provided
      let filteredOrders = data
      if (searchTerm) {
        filteredOrders = data.filter(order => 
          order.id?.toString().includes(searchTerm) ||
          order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setOrders(Array.isArray(filteredOrders) ? filteredOrders : [])
      setTotalOrders(Array.isArray(data) ? data.length : 0)
    } catch (err) {
      setError('Failed to fetch orders')
      console.error('Error fetching orders:', err)
      // Use mock data as fallback
      setOrders(getMockOrders())
      setTotalOrders(4)
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, searchTerm])

  const getMockOrders = () => [
    {
      id: 12345,
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      items_count: 3,
      total_amount: 89.00,
      status: 'delivered',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T14:20:00Z'
    },
    {
      id: 12346,
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      items_count: 2,
      total_amount: 45.50,
      status: 'preparing',
      created_at: '2024-01-15T09:15:00Z',
      updated_at: '2024-01-15T11:30:00Z'
    },
    {
      id: 12347,
      customer_name: 'Bob Johnson',
      customer_email: 'bob@example.com',
      items_count: 5,
      total_amount: 120.00,
      status: 'cancelled',
      created_at: '2024-01-14T16:45:00Z',
      updated_at: '2024-01-14T18:00:00Z'
    },
    {
      id: 12348,
      customer_name: 'Alice Brown',
      customer_email: 'alice@example.com',
      items_count: 1,
      total_amount: 25.00,
      status: 'pending',
      created_at: '2024-01-16T08:20:00Z',
      updated_at: '2024-01-16T08:20:00Z'
    }
  ]

  const handleViewOrder = async (orderId) => {
    try {
      const order = await orderService.getOrder(orderId)
      setSelectedOrder(order)
      setShowOrderModal(true)
    } catch (err) {
      console.error('Error fetching order details:', err)
      // Use mock data as fallback
      const mockOrder = getMockOrders().find(o => o.id === orderId)
      setSelectedOrder(mockOrder)
      setShowOrderModal(true)
    }
  }

  const handleStatusChange = (order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setShowStatusModal(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      setLoading(true)
      setError('')
      
      const response = await orderService.updateOrder(selectedOrder.id, { status: newStatus })
      
      setShowStatusModal(false)
      setSelectedOrder(null)
      setNewStatus('')
      
      // Show success message
      setError('')
      showSuccessMessage('Order status updated successfully!')
      
      // Refresh orders list
      await fetchOrders()
      
      // Show success feedback
      console.log('Order status updated successfully:', response)
    } catch (err) {
      console.error('Error updating order status:', err)
      
      let errorMessage = 'Failed to update order status'
      if (err.response?.status === 403) {
        errorMessage = 'Permission denied. You need admin or staff role.'
      } else if (err.response?.status === 404) {
        errorMessage = 'Order not found.'
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.detail || 'Invalid status update.'
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'ready':
        return 'bg-blue-100 text-blue-800'
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Bulk update functions
  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const handleSelectAllOrders = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)))
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (selectedOrders.size === 0) {
      setError('Please select at least one order to update')
      return
    }
    if (!bulkStatusUpdate) {
      setError('Please select a status')
      return
    }
    setShowBulkUpdateModal(true)
  }

  const handleBulkStatusSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      
      const updatePromises = Array.from(selectedOrders).map(orderId =>
        orderService.updateOrder(orderId, { status: bulkStatusUpdate })
      )
      
      await Promise.all(updatePromises)
      
      setSelectedOrders(new Set())
      setShowBulkUpdateModal(false)
      setBulkStatusUpdate('')
      
      // Show success message
      console.log(`Successfully updated ${selectedOrders.size} orders`)
      showSuccessMessage(`Successfully updated ${selectedOrders.size} orders!`)
      
      // Refresh orders list
      await fetchOrders()
    } catch (err) {
      console.error('Error updating orders:', err)
      
      let errorMessage = 'Failed to update orders'
      if (err.response?.status === 403) {
        errorMessage = 'Permission denied. You need admin or staff role.'
      } else if (err.response?.status === 404) {
        errorMessage = 'One or more orders not found.'
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.detail || 'Invalid status update.'
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalOrders / ordersPerPage)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-700">Manage and track all customer orders</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
          {selectedOrders.size > 0 && (
            <>
              <button
                type="button"
                onClick={handleBulkStatusUpdate}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Update {selectedOrders.size} orders
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrders(new Set())}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Clear selection
              </button>
            </>
          )}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            New order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Order ID, customer..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      {/* Bulk selection controls */}
      {orders.length > 0 && (
        <div className="mt-4 flex items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedOrders.size === orders.length && orders.length > 0}
              onChange={handleSelectAllOrders}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Select all ({selectedOrders.size} selected)
            </label>
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        <input
                          type="checkbox"
                          checked={selectedOrders.size === orders.length && orders.length > 0}
                          onChange={handleSelectAllOrders}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Order ID</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Items</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-sm text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className={selectedOrders.has(order.id) ? 'bg-indigo-50' : ''}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <input
                              type="checkbox"
                              checked={selectedOrders.has(order.id)}
                              onChange={() => handleSelectOrder(order.id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            #{order.id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div>
                              <div className="font-medium text-gray-900">{order.customer_name}</div>
                              <div className="text-gray-500">{order.customer_email}</div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {order.items_count || 0} items
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            ${order.total_amount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(order.status)}`}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleStatusChange(order)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details - #{selectedOrder.id}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Customer Information</h4>
                  <p className="text-sm text-gray-600">Name: {selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-600">Email: {selectedOrder.customer_email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Order Information</h4>
                  <p className="text-sm text-gray-600">Items: {selectedOrder.items_count}</p>
                  <p className="text-sm text-gray-600">Total: ${selectedOrder.total_amount?.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Status: {selectedOrder.status}</p>
                  <p className="text-sm text-gray-600">Created: {formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedOrder(null)
                    setNewStatus('')
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {showBulkUpdateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update {selectedOrders.size} Orders
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                <select
                  value={bulkStatusUpdate}
                  onChange={(e) => setBulkStatusUpdate(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select status...</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBulkUpdateModal(false)
                    setBulkStatusUpdate('')
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkStatusSubmit}
                  disabled={!bulkStatusUpdate || loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Updating...' : 'Update All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
