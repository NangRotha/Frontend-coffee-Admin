import { useState, useEffect, useCallback } from 'react'
import { reportService } from '../services/reportService'

function Reports() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedReport, setSelectedReport] = useState('sales')
  const [dateRange, setDateRange] = useState('7d')
  const [reportData, setReportData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedReports, setSelectedReports] = useState(new Set())
  const [showBulkGenerateModal, setShowBulkGenerateModal] = useState(false)
  const [bulkDateRange, setBulkDateRange] = useState('7d')
  const [generatedReports, setGeneratedReports] = useState([])
  const [showBulkExportModal, setShowBulkExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', description: 'Revenue and sales performance' },
    { id: 'products', name: 'Product Report', description: 'Best selling products and inventory' },
    { id: 'customers', name: 'Customer Report', description: 'Customer demographics and behavior' },
    { id: 'orders', name: 'Order Report', description: 'Order patterns and trends' }
  ]

  useEffect(() => {
    if (selectedReport) {
      generateReport()
    }
  }, [selectedReport, dateRange, generateReport])

  const generateReport = useCallback(async () => {
    try {
      setLoading(true)
      setIsGenerating(true)
      const data = await reportService.generateReport(selectedReport, dateRange)
      setReportData(data)
    } catch (err) {
      console.error('Error generating report:', err)
      setError('Failed to generate report')
      // Use mock data as fallback
      setReportData(getMockReportData(selectedReport))
    } finally {
      setLoading(false)
      setIsGenerating(false)
    }
  }, [selectedReport, dateRange])

  const getMockReportData = (reportType) => {
    switch (reportType) {
      case 'sales':
        return {
          summary: {
            totalRevenue: 15420.50,
            totalOrders: 234,
            averageOrderValue: 65.90,
            growthRate: 12.5
          },
          dailyBreakdown: [
            { date: '2024-01-15', revenue: 2350.00, orders: 35 },
            { date: '2024-01-14', revenue: 1890.00, orders: 28 },
            { date: '2024-01-13', revenue: 2675.00, orders: 42 },
            { date: '2024-01-12', revenue: 3200.00, orders: 48 },
            { date: '2024-01-11', revenue: 1950.00, orders: 31 },
            { date: '2024-01-10', revenue: 1355.50, orders: 22 },
            { date: '2024-01-09', revenue: 2100.00, orders: 33 }
          ],
          topProducts: [
            { name: 'Cappuccino', revenue: 1780.00, orders: 89 },
            { name: 'Latte', revenue: 1520.00, orders: 76 },
            { name: 'Espresso', revenue: 975.00, orders: 65 }
          ]
        }
      case 'products':
        return {
          summary: {
            totalProducts: 25,
            activeProducts: 23,
            lowStockProducts: 5,
            outOfStockProducts: 2
          },
          productPerformance: [
            { name: 'Cappuccino', sold: 89, revenue: 1780.00, rating: 4.5 },
            { name: 'Latte', sold: 76, revenue: 1520.00, rating: 4.3 },
            { name: 'Espresso', sold: 65, revenue: 975.00, rating: 4.6 },
            { name: 'Americano', sold: 54, revenue: 810.00, rating: 4.2 },
            { name: 'Mocha', sold: 43, revenue: 645.00, rating: 4.7 }
          ],
          categoryBreakdown: [
            { category: 'coffee', revenue: 8900.00, percentage: 58 },
            { category: 'tea', revenue: 3200.00, percentage: 21 },
            { category: 'pastry', revenue: 2100.00, percentage: 14 },
            { category: 'sandwich', revenue: 1220.50, percentage: 7 }
          ]
        }
      case 'customers':
        return {
          summary: {
            totalCustomers: 156,
            newCustomers: 23,
            returningCustomers: 133,
            retentionRate: 85.3
          },
          demographics: [
            { type: 'Age Group', data: [
              { label: '18-25', count: 45, percentage: 28.8 },
              { label: '26-35', count: 67, percentage: 42.9 },
              { label: '36-45', count: 32, percentage: 20.5 },
              { label: '46+', count: 12, percentage: 7.7 }
            ]},
            { type: 'Gender', data: [
              { label: 'Male', count: 78, percentage: 50 },
              { label: 'Female', count: 72, percentage: 46.2 },
              { label: 'Other', count: 6, percentage: 3.8 }
            ]}
          ],
          topCustomers: [
            { name: 'John Doe', orders: 15, spent: 485.50, lastOrder: '2024-01-15' },
            { name: 'Jane Smith', orders: 12, spent: 378.00, lastOrder: '2024-01-14' },
            { name: 'Bob Johnson', orders: 10, spent: 320.00, lastOrder: '2024-01-13' }
          ]
        }
      case 'orders':
        return {
          summary: {
            totalOrders: 234,
            averagePreparationTime: 8.5,
            completionRate: 94.2,
            cancellationRate: 5.8
          },
          statusBreakdown: [
            { status: 'delivered', count: 189, percentage: 80.8 },
            { status: 'preparing', count: 23, percentage: 9.8 },
            { status: 'ready', count: 15, percentage: 6.4 },
            { status: 'cancelled', count: 7, percentage: 3.0 }
          ],
          hourlyBreakdown: [
            { hour: '8-9', orders: 15 },
            { hour: '9-10', orders: 28 },
            { hour: '10-11', orders: 35 },
            { hour: '11-12', orders: 42 },
            { hour: '12-13', orders: 38 },
            { hour: '13-14', orders: 25 },
            { hour: '14-15', orders: 31 },
            { hour: '15-16', orders: 20 }
          ]
        }
      default:
        return null
    }
  }

  const exportReport = () => {
    // Placeholder for export functionality
    alert('Export functionality coming soon!')
  }

  const printReport = () => {
    window.print()
  }

  // Bulk operations functions
  const handleSelectReport = (reportId) => {
    const newSelected = new Set(selectedReports)
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId)
    } else {
      newSelected.add(reportId)
    }
    setSelectedReports(newSelected)
  }

  const handleSelectAllReports = () => {
    if (selectedReports.size === reportTypes.length) {
      setSelectedReports(new Set())
    } else {
      setSelectedReports(new Set(reportTypes.map(r => r.id)))
    }
  }

  const handleBulkGenerate = async () => {
    if (selectedReports.size === 0) {
      setError('Please select at least one report to generate')
      return
    }
    setShowBulkGenerateModal(true)
  }

  const handleBulkGenerateSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      
      const reportPromises = Array.from(selectedReports).map(reportId =>
        reportService.generateReport(reportId, bulkDateRange)
      )
      
      const results = await Promise.all(reportPromises)
      
      const newGeneratedReports = Array.from(selectedReports).map((reportId, index) => ({
        id: reportId,
        name: reportTypes.find(r => r.id === reportId)?.name,
        data: results[index],
        generatedAt: new Date().toISOString(),
        dateRange: bulkDateRange
      }))
      
      setGeneratedReports([...generatedReports, ...newGeneratedReports])
      setSelectedReports(new Set())
      setShowBulkGenerateModal(false)
      
      showSuccessMessage(`Successfully generated ${selectedReports.size} reports!`)
    } catch (err) {
      console.error('Error generating bulk reports:', err)
      setError('Failed to generate reports')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkExport = async () => {
    if (generatedReports.length === 0) {
      setError('No reports available for export')
      return
    }
    setShowBulkExportModal(true)
  }

  const handleBulkExportSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      
      const exportPromises = generatedReports.map(report =>
        reportService.exportReport(report.id, report.data, exportFormat)
      )
      
      const results = await Promise.all(exportPromises)
      
      // Create downloadable files
      results.forEach((result, index) => {
        const report = generatedReports[index]
        const blob = new Blob([result], { 
          type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${report.name}_${report.dateRange}.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })
      
      setShowBulkExportModal(false)
      showSuccessMessage(`Successfully exported ${generatedReports.length} reports!`)
    } catch (err) {
      console.error('Error exporting reports:', err)
      setError('Failed to export reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGeneratedReport = (reportId) => {
    setGeneratedReports(generatedReports.filter(r => r.id !== reportId))
    showSuccessMessage('Report deleted successfully')
  }

  const handleClearAllGenerated = () => {
    setGeneratedReports([])
    showSuccessMessage('All generated reports cleared')
  }

  const showSuccessMessage = (message) => {
    setSuccess(message)
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading && !reportData) {
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
            type="button"
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
            type="button"
            onClick={() => setSuccess('')}
            className="ml-4 text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-700">Generate and analyze business reports</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
          {selectedReports.size > 0 && (
            <>
              <button
                type="button"
                onClick={handleBulkGenerate}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Generate {selectedReports.size} reports
              </button>
              <button
                type="button"
                onClick={() => setSelectedReports(new Set())}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Clear selection
              </button>
            </>
          )}
          {generatedReports.length > 0 && (
            <button
              type="button"
              onClick={handleBulkExport}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Export All ({generatedReports.length})
            </button>
          )}
          <button
            type="button"
            onClick={printReport}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Print
          </button>
          <button
            type="button"
            onClick={exportReport}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Export
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedReports.size === reportTypes.length && reportTypes.length > 0}
            onChange={handleSelectAllReports}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Select all ({selectedReports.size} selected)
          </label>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={() => handleSelectReport(report.id)}
            className={`p-4 border rounded-lg text-left hover:shadow-md transition-shadow relative ${
              selectedReport === report.id
                ? 'border-indigo-500 bg-indigo-50'
                : selectedReports.has(report.id)
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="absolute top-2 right-2">
              <input
                type="checkbox"
                checked={selectedReports.has(report.id)}
                onChange={() => handleSelectReport(report.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{report.description}</p>
          </button>
        ))}
      </div>

      {/* Date Range Selection */}
      <div className="mt-6 flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Date Range:</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <button
          type="button"
          onClick={generateReport}
          disabled={isGenerating}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isGenerating ? 'Generating...' : 'Refresh'}
        </button>
      </div>

      {/* Report Content */}
      {reportData && (
        <div className="mt-8 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(reportData.summary).map(([key, value]) => (
              <div key={key} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {typeof value === 'number' ? value.toFixed(2) : value}
                          {key.includes('Rate') && '%'}
                          {key.includes('Revenue') && '$'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Report Specific Content */}
          {selectedReport === 'sales' && (
            <div className="space-y-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Sales Breakdown</h3>
                  <div className="space-y-2">
                    {reportData.dailyBreakdown.map((day) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{day.date}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-900">{day.orders} orders</span>
                          <span className="text-sm font-medium text-gray-900">${day.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
                  <div className="space-y-3">
                    {reportData.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-medium text-indigo-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.orders} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'products' && (
            <div className="space-y-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Performance</h3>
                  <div className="space-y-3">
                    {reportData.productPerformance.map((product) => (
                      <div key={product.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sold} sold</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-sm text-gray-900">{product.rating}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h3>
                  <div className="space-y-3">
                    {reportData.categoryBreakdown.map((category) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">{category.category}</p>
                            <p className="text-xs text-gray-500">{category.percentage}% of total</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${category.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'customers' && (
            <div className="space-y-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Customers</h3>
                  <div className="space-y-3">
                    {reportData.topCustomers.map((customer) => (
                      <div key={customer.name} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.orders} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${customer.spent.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Last: {customer.lastOrder}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Demographics</h3>
                  <div className="space-y-6">
                    {reportData.demographics.map((demo) => (
                      <div key={demo.type}>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">{demo.type}</h4>
                        <div className="space-y-2">
                          {demo.data.map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{item.label}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-indigo-500 h-2 rounded-full" 
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900 w-12 text-right">
                                  {item.count} ({item.percentage}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'orders' && (
            <div className="space-y-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Breakdown</h3>
                  <div className="space-y-3">
                    {reportData.statusBreakdown.map((status) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status.status === 'delivered' ? 'bg-green-500' :
                            status.status === 'preparing' ? 'bg-yellow-500' :
                            status.status === 'ready' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">{status.status}</p>
                          <p className="text-xs text-gray-500">{status.percentage}% of total</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{status.count} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Order Distribution</h3>
                  <div className="space-y-2">
                    {reportData.hourlyBreakdown.map((hour) => (
                      <div key={hour.hour} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{hour.hour}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-500 h-2 rounded-full" 
                              style={{ width: `${(hour.orders / 42) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8 text-right">
                            {hour.orders}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generated Reports Section */}
      {generatedReports.length > 0 && (
        <div className="mt-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <h3 className="text-lg font-medium text-gray-900">Generated Reports</h3>
              <p className="mt-1 text-sm text-gray-500">Recently generated reports ready for export</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                onClick={handleClearAllGenerated}
                className="inline-flex items-center justify-center rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generatedReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.dateRange}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.generatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(report.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGeneratedReport(report.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulkGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Generate {selectedReports.size} Reports
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={bulkDateRange}
                  onChange={(e) => setBulkDateRange(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBulkGenerateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkGenerateSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Generating...' : 'Generate All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Export Modal */}
      {showBulkExportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Export {generatedReports.length} Reports
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="pdf">PDF (Coming Soon)</option>
                </select>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  This will export all {generatedReports.length} generated reports as {exportFormat.toUpperCase()} files.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBulkExportModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkExportSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {loading ? 'Exporting...' : 'Export All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
