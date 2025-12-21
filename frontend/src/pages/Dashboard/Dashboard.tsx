import { useState, useEffect } from 'react'
import { Users, FileText, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/api/client'
import { Link } from 'react-router-dom'

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  project?: {
    name: string
  }
  created_at: string
}

interface Document {
  id: number
  title: string
  file: string
  document_type?: {
    name: string
  }
  version: number
  created_at: string
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_documents: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    total_processes: 0,
  })
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Получаем все данные для дашборда
        const [tasksRes, docsRes, usersRes, processesRes] = await Promise.allSettled([
          apiClient.get('/tasks/'),
          apiClient.get('/documents/'),
          apiClient.get('/users/'),
          apiClient.get('/processes/'),
        ])
        
        const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.data.results || [] : []
        const documents = docsRes.status === 'fulfilled' ? docsRes.value.data.results || [] : []
        const users = usersRes.status === 'fulfilled' ? usersRes.value.data.results || [] : []
        const processes = processesRes.status === 'fulfilled' ? processesRes.value.data.results || [] : []
        
        // Вычисляем статистику
        const completedTasks = tasks.filter((t: Task) => t.status === 'done').length
        const pendingTasks = tasks.filter((t: Task) => t.status === 'in_progress' || t.status === 'todo').length
        
        setStats({
          total_users: users.length,
          total_documents: documents.length,
          completed_tasks: completedTasks,
          pending_tasks: pendingTasks,
          total_processes: processes.length,
        })
        
        // Последние задачи (отсортированные по дате создания)
        const sortedTasks = [...tasks]
          .sort((a: Task, b: Task) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
        setRecentTasks(sortedTasks)
        
        // Последние документы
        const sortedDocs = [...documents]
          .sort((a: Document, b: Document) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
        setRecentDocuments(sortedDocs)
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    {
      title: 'Пользователи',
      value: stats.total_users,
      icon: Users,
      color: 'bg-blue-500',
      link: '/',
      description: 'В системе'
    },
    {
      title: 'Документы',
      value: stats.total_documents,
      icon: FileText,
      color: 'bg-green-500',
      link: '/documents',
      description: 'Загружено'
    },
    {
      title: 'Выполнено',
      value: stats.completed_tasks,
      icon: CheckCircle,
      color: 'bg-purple-500',
      link: '/tasks',
      description: 'Задач завершено'
    },
    {
      title: 'В работе',
      value: stats.pending_tasks,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/tasks',
      description: 'Требуют внимания'
    },
    {
      title: 'Процессы',
      value: stats.total_processes,
      icon: TrendingUp,
      color: 'bg-red-500',
      link: '/processes',
      description: 'Активных'
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'todo': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'done': return 'Выполнено'
      case 'in_progress': return 'В работе'
      case 'todo': return 'К выполнению'
      default: return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий'
      case 'medium': return 'Средний'
      case 'low': return 'Низкий'
      default: return priority
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Дашборд</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Добро пожаловать, {user?.first_name || user?.full_name || 'Пользователь'}! Обзор системы.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Загрузка данных...</p>
        </div>
      ) : (
        <>
          {/* Карточки статистики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Link
                key={index}
                to={stat.link}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Последние задачи */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Последние задачи
                </h3>
                <Link 
                  to="/tasks" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Все задачи →
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {task.description?.substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Проект: {task.project?.name || 'Без проекта'}</span>
                          <span>Приоритет: {getPriorityText(task.priority)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Нет задач</p>
                    <Link
                      to="/tasks"
                      className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                    >
                      Создать первую задачу
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Последние документы */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Последние документы
                </h3>
                <Link 
                  to="/documents" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Все документы →
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentDocuments.length > 0 ? (
                  recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {doc.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>Тип: {doc.document_type?.name || 'Без типа'}</span>
                            <span>Версия: v{doc.version}</span>
                            <span>
                              {new Date(doc.created_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={doc.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Открыть
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Нет документов</p>
                    <Link
                      to="/documents"
                      className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                    >
                      Загрузить первый документ
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
