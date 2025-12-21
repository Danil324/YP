import { useState, useEffect } from 'react'
import { Plus, Filter, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/api/client'
import Button from '@/components/ui/Button/Button'
import TaskCard from '@/components/tasks/TaskCard'

interface Project {
  id: number
  name: string
  description: string
  manager: {
    id: number
    full_name: string
  }
}

interface Task {
  id: number
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string
  reporter?: {
    id: number
    full_name: string
  }
  assignee?: {
    id: number
    full_name: string
  }
  project: {
    id: number
    name: string
  }
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Получаем реальные данные из API
        const [tasksResponse, projectsResponse] = await Promise.all([
          apiClient.get('/tasks/'),
          apiClient.get('/tasks/projects/'),
        ])
        
        console.log('Tasks data:', tasksResponse.data)
        console.log('Projects data:', projectsResponse.data)
        
        // API возвращает paginated response {count, next, previous, results}
        setTasks(tasksResponse.data.results || [])
        setProjects(projectsResponse.data.results || [])
      } catch (error) {
        console.error('Error fetching tasks:', error)
        // В случае ошибки используем демо-данные
        setTasks([])
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProject ? task.project.id === selectedProject : true
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesProject && matchesStatus && matchesSearch
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Задачи</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Управление задачами и проектами
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Новая задача
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Фильтры</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Проект
                </label>
                <select
                  className="w-full input-field"
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Все проекты</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Статус
                </label>
                <select
                  className="w-full input-field"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Все статусы</option>
                  <option value="todo">К выполнению</option>
                  <option value="in_progress">В работе</option>
                  <option value="done">Выполнено</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск задач..."
                  className="w-full pl-10 input-field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Загрузка задач...</p>
                </div>
              ) : filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <Filter className="h-full w-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {tasks.length === 0 ? 'Нет созданных задач' : 'Задачи не найдены'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {tasks.length === 0 
                      ? 'Создайте первую задачу или добавьте через Django Admin' 
                      : 'Попробуйте изменить параметры фильтрации'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
