import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import apiClient from '../../api/client'
import Card from '../ui/Card/Card'
import StatusBadge from '../ui/StatusBadge/StatusBadge'
import type { Task, TaskColumn } from '../../types'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface SortableTaskProps {
  task: Task
}

function SortableTask({ task }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card variant="elevated" className="mb-3 cursor-move">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{task.title}</h4>
        <div className="flex items-center space-x-2">
          <StatusBadge status={task.priority} />
          {task.assignee && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {task.assignee.full_name}
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [columns, setColumns] = useState<TaskColumn[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, columnsRes] = await Promise.all([
          apiClient.get('/tasks/'),
          apiClient.get('/tasks/columns/'),
        ])
        setTasks(tasksRes.data.results || tasksRes.data)
        setColumns(columnsRes.data.results || columnsRes.data)
      } catch (error) {
        console.error('Error fetching kanban data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeTask = tasks.find((t) => t.id.toString() === active.id)
    if (!activeTask) return

    const overColumnId = over.id
    const newColumn = columns.find((c) => c.id.toString() === overColumnId)

    if (newColumn && activeTask.column?.id !== newColumn.id) {
      try {
        await apiClient.post(`/tasks/${activeTask.id}/move/`, {
          column_id: newColumn.id,
          position: 0,
        })

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === activeTask.id ? { ...task, column: newColumn } : task
          )
        )
      } catch (error) {
        console.error('Error moving task:', error)
      }
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>
  }

  const defaultColumns = [
    { id: 'todo', name: 'К выполнению' },
    { id: 'in_progress', name: 'В работе' },
    { id: 'review', name: 'На проверке' },
    { id: 'done', name: 'Выполнено' },
  ]

  const displayColumns = columns.length > 0 ? columns : defaultColumns

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/tasks">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Kanban доска</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Перетаскивайте задачи между колонками</p>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayColumns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.column?.id === column.id || task.status === column.id
            )

            return (
              <div key={column.id} className="flex flex-col">
                <Card variant="outlined" className="p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{column.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {columnTasks.length} задач
                  </p>
                </Card>
                <SortableContext
                  items={columnTasks.map((t) => t.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 min-h-[200px]">
                    {columnTasks.map((task) => (
                      <SortableTask key={task.id} task={task} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            )
          })}
        </div>
        <DragOverlay>
          {activeId ? (
            <Card variant="elevated" className="w-64">
              <p className="font-semibold">
                {tasks.find((t) => t.id.toString() === activeId)?.title}
              </p>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

