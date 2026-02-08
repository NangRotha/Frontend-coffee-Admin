import { useState, useEffect } from 'react'
import { settingsService } from '../services/settingsService'

function Settings() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    shop_name: '',
    email: '',
    description: ''
  })
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    order_notifications: true,
    stock_notifications: true,
    customer_notifications: false
  })
  
  // Business hours state
  const [businessHours, setBusinessHours] = useState({
    opening_time: '08:00',
    closing_time: '20:00'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      // Try to fetch settings from backend
      const settings = await settingsService.getSettings()
      
      // Update state with fetched data
      setGeneralSettings({
        shop_name: settings.shop_name || 'Coffee Shop Admin',
        email: settings.email || 'admin@coffeeshop.com',
        description: settings.description || 'Welcome to our coffee shop administration panel.'
      })
      
      setNotificationSettings({
        order_notifications: settings.order_notifications !== false,
        stock_notifications: settings.stock_notifications !== false,
        customer_notifications: settings.customer_notifications === true
      })
      
      if (settings.business_hours) {
        setBusinessHours(settings.business_hours)
      }
    } catch {
      console.warn('Settings endpoint not available, using defaults')
      // Use default values if endpoint doesn't exist
    } finally {
      setLoading(false)
    }
  }

  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleBusinessHoursChange = (e) => {
    const { name, value } = e.target
    setBusinessHours(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Combine all settings
      const allSettings = {
        ...generalSettings,
        ...notificationSettings,
        business_hours: businessHours
      }

      // Try to save to backend
      await settingsService.updateSettings(allSettings)
      setSuccess('Settings saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to save settings. Please try again.')
      console.error('Error saving settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    fetchSettings()
    setError('')
    setSuccess('')
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

      <div className="border-b border-gray-200 pb-5 sm:pb-0">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">Manage your coffee shop settings and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="mt-6 divide-y divide-gray-200">
        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
            <p className="mt-1 text-sm text-gray-500">Configure your coffee shop basic information.</p>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="shop_name" className="block text-sm font-medium text-gray-700">
                  Shop Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="shop_name"
                    id="shop_name"
                    value={generalSettings.shop_name}
                    onChange={handleGeneralSettingsChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={generalSettings.email}
                    onChange={handleGeneralSettingsChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={generalSettings.description}
                    onChange={handleGeneralSettingsChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="pt-6">
            <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
            <p className="mt-1 text-sm text-gray-500">Configure how you receive notifications.</p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="order_notifications"
                    name="order_notifications"
                    type="checkbox"
                    checked={notificationSettings.order_notifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="order_notifications" className="font-medium text-gray-700">
                    Order Notifications
                  </label>
                  <p className="text-gray-500">Receive notifications when new orders are placed.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="stock_notifications"
                    name="stock_notifications"
                    type="checkbox"
                    checked={notificationSettings.stock_notifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="stock_notifications" className="font-medium text-gray-700">
                    Low Stock Alerts
                  </label>
                  <p className="text-gray-500">Get notified when products are running low on stock.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="customer_notifications"
                    name="customer_notifications"
                    type="checkbox"
                    checked={notificationSettings.customer_notifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="customer_notifications" className="font-medium text-gray-700">
                    Customer Updates
                  </label>
                  <p className="text-gray-500">Receive updates about new customer registrations.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="pt-6">
            <h2 className="text-lg font-medium text-gray-900">Business Hours</h2>
            <p className="mt-1 text-sm text-gray-500">Set your coffee shop operating hours.</p>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="opening_time" className="block text-sm font-medium text-gray-700">
                  Opening Time
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    name="opening_time"
                    id="opening_time"
                    value={businessHours.opening_time}
                    onChange={handleBusinessHoursChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="closing_time" className="block text-sm font-medium text-gray-700">
                  Closing Time
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    name="closing_time"
                    id="closing_time"
                    value={businessHours.closing_time}
                    onChange={handleBusinessHoursChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="mt-6 py-3 flex justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
    </div>
  )
}

export default Settings
