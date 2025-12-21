import { useState, useEffect } from 'react'
import { BarChart3, PieChart, TrendingUp, Users, FileText, CheckCircle, Clock } from 'lucide-react'
import apiClient from '@/api/client'

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [taskAnalytics, setTaskAnalytics] = useState<any>(null)
  const [documentAnalytics, setDocumentAnalytics] = useState<any>(null)
  const [hasAnalyticsAPI, setHasAnalyticsAPI] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Получаем основные данные
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
        
        // Вычисляем статистику для дашборда
        const completedTasks = tasks.filter((t: any) => t.status === 'done').length
        const pendingTasks = tasks.filter((t: any) => t.status === 'in_progress' || t.status === 'todo').length
        
        setDashboardStats({
          total_users: users.length,
          total_documents: documents.length,
          completed_tasks: completedTasks,
          pending_tasks: pendingTasks,
          total_processes: processes.length,
        })
        
        // Вычисляем аналитику задач
        const tasksByStatus = tasks.reduce((acc: any, task: any) => {
          acc[task.status] = (acc[task.status] || 0) + 1
          return acc
        }, { todo: 0, in_progress: 0, done: 0 })
        
        const tasksByPriority = tasks.reduce((acc: any, task: any) => {
          acc[task.priority] = (acc[task.priority] || 0) + 1
          return acc
        }, { low: 0, medium: 0, high: 0 })
        
        setTaskAnalytics({
          by_status: tasksByStatus,
          by_priority: tasksByPriority,
          total: tasks.length,
        })
        
        // Вычисляем аналитику документов
        const documentsByMonth = Array(12).fill(0)
        documents.forEach((doc: any) => {
          try {
            const month = new Date(doc.created_at).getMonth()
            documentsByMonth[month]++
          } catch (e) {
            // Игнорируем ошибки парсинга даты
          }
        })
        
        const documentsByType = documents.reduce((acc: any, doc: any) => {
          const typeName = doc.document_type?.name || 'Без типа'
          acc[typeName] = (acc[typeName] || 0) + 1
          return acc
        }, {})
        
        setDocumentAnalytics({
          by_type: documentsByType,
          by_month: documentsByMonth,
          total: documents.length,
        })
        
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = dashboardStats ? [
    {
      title: 'Пользователи',
      value: dashboardStats.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
      description: 'Зарегистрировано в системе'
    },
    {
      title: 'Документы',
      value: dashboardStats.total_documents || 0,
      icon: FileText,
      color: 'bg-green-500',
      description: 'Всего документов'
    },
    {
      title: 'Выполнено задач',
      value: dashboardStats.completed_tasks || 0,
      icon: CheckCircle,
      color: 'bg-purple-500',
      description: 'Завершенные задачи'
    },
    {
      title: 'Задачи в работе',
      value: dashboardStats.pending_tasks || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      description: 'Требуют внимания'
    },
  ] : []

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'К выполнению'
      case 'in_progress': return 'В работе'
      case 'done': return 'Выполнено'
      default: return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Низкий'
      case 'medium': return 'Средний'
      case 'high': return 'Высокий'
      default: return priority
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Аналитика</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Статистика системы на основе реальных данных
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Загрузка аналитики...</p>
        </div>
      ) : (
        <>
          {/* Общая статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
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
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Статистика задач */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <BarChart3 className="h-6 w-6 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Статистика задач
                </h3>
                {taskAnalytics?.total !== undefined && (
                  <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                    Всего: {taskAnalytics.total}
                  </span>
                )}
              </div>

              {taskAnalytics && taskAnalytics.total > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                      По статусам
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(taskAnalytics.by_status || {}).map(([status, count]: [string, any]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {getStatusText(status)}
                          </span>
                          <div className="flex items-center">
                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  status === 'todo' ? 'bg-yellow-500' :
                                  status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: taskAnalytics.total ? `${(count / taskAnalytics.total) * 100}%` : '0%' 
                                }}
                              />
                            </div>
                            <span className="ml-3 font-medium text-gray-900 dark:text-white">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                      По приоритетам
                    </h4>
                    <div className="flex items-center justify-between">
                      {Object.entries(taskAnalytics.by_priority || {}).map(([priority, count]: [string, any]) => (
                        <div key={priority} className="text-center">
                          <div className={`text-lg font-bold ${
                            priority === 'high' ? 'text-red-600 dark:text-red-400' :
                            priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {count}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {getPriorityText(priority)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Нет данных по задачам для анализа
                </p>
              )}
            </div>

            {/* Статистика документов */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <PieChart className="h-6 w-6 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Документы
                </h3>
                {documentAnalytics?.total !== undefined && (
                  <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                    Всего: {documentAnalytics.total}
                  </span>
                )}
              </div>

              {documentAnalytics && documentAnalytics.total > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                      По типам
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(documentAnalytics.by_type || {}).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {type}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {count} {count === 1 ? 'файл' : count < 5 ? 'файла' : 'файлов'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Загрузка по месяцам
                    </h4>
                    <div className="flex items-end h-32 space-x-1">
                      {documentAnalytics.by_month?.map((count: number, index: number) => {
                        const maxCount = Math.max(...documentAnalytics.by_month)
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-purple-500 rounded-t-lg transition-all duration-300"
                              style={{ 
                                height: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%' 
                              }}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'][index]}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Нет данных по документам для анализа
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
