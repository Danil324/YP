import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

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

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const statusIcons = {
    todo: <Clock className="h-4 w-4 text-gray-500" />,
    in_progress: <AlertCircle className="h-4 w-4 text-blue-500" />,
    done: <CheckCircle className="h-4 w-4 text-green-500" />,
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }

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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {statusIcons[task.status] || <Clock className="h-4 w-4 text-gray-500" />}
            <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
              {getPriorityText(task.priority)} приоритет
            </span>
          </div>
          
          <p className="mt-2 text-gray-600 dark:text-gray-400">{task.description}</p>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Проект:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {task.project.name}
                </span>
              </div>
              
              {task.assignee && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Исполнитель:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.assignee.full_name}
                  </span>
                </div>
              )}
              
              {task.reporter && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Автор:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.reporter.full_name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Статус:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {getStatusText(task.status)}
                </span>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Срок: {task.due_date ? new Date(task.due_date).toLocaleDateString('ru-RU') : 'Не установлен'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
