export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone?: string
  avatar?: string
  department?: Department
  role?: Role
  position?: string
  bio?: string
  is_active: boolean
  created_at: string
}

export interface Department {
  id: number
  name: string
  description?: string
  parent?: Department
  created_at: string
}

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  permissions: string[]
}

export interface Project {
  id: number
  name: string
  description?: string
  manager: User
  department?: Department
  start_date?: string
  end_date?: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  color: string
  task_count?: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  name: string
  color: string
}

export interface TaskColumn {
  id: number
  name: string
  project?: number
  position: number
  is_default: boolean
  task_count?: number
}

export interface Task {
  id: number
  title: string
  description?: string
  project?: Project
  assignee?: User
  reporter: User
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
  due_date?: string
  tags: Tag[]
  column?: TaskColumn
  position: number
  depends_on?: Task
  is_recurring: boolean
  recurrence_pattern?: string
  comment_count?: number
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface DocumentType {
  id: number
  name: string
  description?: string
  template?: string
}

export interface WorkflowStep {
  id: number
  workflow: number
  name: string
  approver: User
  order: number
  is_required: boolean
}

export interface ApprovalWorkflow {
  id: number
  name: string
  description?: string
  is_active: boolean
  steps: WorkflowStep[]
  created_at: string
}

export interface Document {
  id: number
  title: string
  file: string
  document_type: DocumentType
  version: number
  parent?: Document
  created_by: User
  workflow?: ApprovalWorkflow
  current_step?: WorkflowStep
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived'
  description?: string
  tags: Tag[]
  approval_count?: number
  comment_count?: number
  created_at: string
  updated_at: string
  approved_at?: string
}

export interface Approval {
  id: number
  document: Document
  step: WorkflowStep
  approver: User
  status: 'pending' | 'approved' | 'rejected'
  comment?: string
  signed_at?: string
  created_at: string
  updated_at: string
}

export interface Process {
  id: number
  name: string
  description?: string
  definition: Record<string, any>
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  created_by: User
  nodes?: ProcessNode[]
  instance_count?: number
  created_at: string
  updated_at: string
}

export interface ProcessNode {
  id: number
  process: number
  node_id: string
  node_type: 'start' | 'task' | 'approval' | 'condition' | 'notification' | 'end'
  name: string
  position: { x: number; y: number }
  config: Record<string, any>
  connections: string[]
}

export interface ProcessInstance {
  id: number
  process: Process
  name: string
  current_node: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  data: Record<string, any>
  started_by: User
  started_at: string
  completed_at?: string
}

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  is_read: boolean
  link?: string
  related_object_type?: string
  related_object_id?: number
  created_at: string
}

