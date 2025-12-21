import { useState, useEffect } from 'react'
import { Play, Pause, CheckCircle, Clock, AlertCircle, Settings } from 'lucide-react'
import apiClient from '@/api/client'
import Button from '@/components/ui/Button/Button'

interface Process {
  id: number
  name: string
  description: string
  status: 'draft' | 'active' | 'inactive' | 'archived'
  created_by: {
    id: number
    full_name: string
  }
  created_at: string
  updated_at: string
  nodes: any[]
}

export default function Processes() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        setLoading(true)
        // Получаем реальные данные из API
        const response = await apiClient.get('/processes/')
        
        console.log('Processes data:', response.data)
        setProcesses(response.data.results || [])
      } catch (error) {
        console.error('Error fetching processes:', error)
        // В случае ошибки используем демо-данные
        setProcesses([])
      } finally {
        setLoading(false)
      }
    }

    fetchProcesses()
  }, [])

  const getStatusIcon = (status: Process['status']) => {
    switch (status) {
      case 'active':
        return <Play className="h-5 w-5 text-green-500" />
      case 'inactive':
        return <Pause className="h-5 w-5 text-yellow-500" />
      case 'draft':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'archived':
        return <CheckCircle className="h-5 w-5 text-gray-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusText = (status: Process['status']) => {
    switch (status) {
      case 'active':
        return 'Активен'
      case 'inactive':
        return 'Неактивен'
      case 'draft':
        return 'Черновик'
      case 'archived':
        return 'Архивирован'
      default:
        return status
    }
  }

  const getStatusColor = (status: Process['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'draft':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Процессы</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Управление бизнес-процессами
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Новый процесс
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Загрузка процессов...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processes.length > 0 ? (
            processes.map((process) => (
              <div
                key={process.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(process.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {process.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(process.status)}`}>
                        {getStatusText(process.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {process.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Автор:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {process.created_by.full_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Создан:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(process.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Узлов:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {process.nodes.length}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {process.status === 'draft' && (
                    <Button size="sm" className="flex-1">
                      <Play className="h-3 w-3 mr-1" />
                      Активировать
                    </Button>
                  )}
                  {process.status === 'active' && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Pause className="h-3 w-3 mr-1" />
                      Приостановить
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="flex-1">
                    Настроить
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <Settings className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Процессы не найдены
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Создайте первый бизнес-процесс для автоматизации работы
              </p>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Создать процесс
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
