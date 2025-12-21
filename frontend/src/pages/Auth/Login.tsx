import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button/Button'
import { LogIn } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setTokens, setUser, isAuthenticated } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
    // Set theme on mount
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [isAuthenticated, navigate, theme])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Sending:", { email: email.toLowerCase().trim(), password });
      
      const response = await apiClient.post('/token/', {
        email: email.toLowerCase().trim(),
        password,
      })

      const { access, refresh } = response.data
      setTokens(access, refresh)

      // Get user info
      const userResponse = await apiClient.get('/api/users/me/')
      setUser(userResponse.data)

      toast.success('Успешный вход!')
      navigate('/')
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || 'Ошибка входа')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <LogIn className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Вход в систему
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Введите свои учетные данные
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email адрес
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field rounded-t-md"
                placeholder="Email адрес"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field rounded-b-md"
                placeholder="Пароль"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
