import { useState, useEffect } from 'react'
import { Menu, Bell, Sun, Moon, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import apiClient from '@/api/client'
import Button from '@/components/ui/Button/Button'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Temporarily disabled until notifications endpoint is implemented
    // const fetchUnreadCount = async () => {
    //   try {
    //     const response = await apiClient.get('/notifications/unread_count/')
    //     setUnreadCount(response.data.count)
    //   } catch (error) {
    //     console.error('Error fetching unread count:', error)
    //   }
    // }
    // fetchUnreadCount()
    // const interval = setInterval(fetchUnreadCount, 80000)
    // return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-md lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            Корпоративный портал
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.email || 'Пользователь'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role || 'Сотрудник'}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Выйти
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Войти
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
