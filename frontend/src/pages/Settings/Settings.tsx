import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import Card from '../../components/ui/Card/Card'
import Button from '../../components/ui/Button/Button'
import { Moon, Sun, User } from 'lucide-react'

export default function Settings() {
  const { user } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Настройки</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Управление настройками аккаунта</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">Профиль</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Имя</p>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {user?.full_name || user?.username}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{user?.email}</p>
            </div>
            {user?.position && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Должность</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{user.position}</p>
              </div>
            )}
            {user?.department && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Отдел</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {user.department.name}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card variant="elevated">
          <div className="flex items-center space-x-3 mb-4">
            {theme === 'dark' ? (
              <Moon className="w-6 h-6 text-primary-600" />
            ) : (
              <Sun className="w-6 h-6 text-primary-600" />
            )}
            <h2 className="text-xl font-semibold">Внешний вид</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Тема</p>
              <Button onClick={toggleTheme} variant="secondary">
                {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

