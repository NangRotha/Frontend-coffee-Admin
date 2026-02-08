import { useAuth } from '../utils/auth'
import { useNavigate } from 'react-router-dom'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleQuickLogin = async () => {
    try {
      const result = await login({
        email: 'admin@coffee.com',
        password: 'admin123'
      })
      console.log('Login successful:', result)
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Coffee Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your coffee shop
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button
            type="button"
            onClick={handleQuickLogin}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Quick Login as Admin
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Auto-login with admin credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
