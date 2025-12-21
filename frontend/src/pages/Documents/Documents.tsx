import { useState, useEffect } from 'react'
import { FileText, Download, Eye, Trash2, Upload, Folder } from 'lucide-react'
import apiClient from '@/api/client'
import Button from '@/components/ui/Button/Button'

interface DocumentType {
  id: number
  name: string
  description: string
}

interface Document {
  id: number
  title: string
  description: string
  file: string
  document_type: DocumentType
  created_by: {
    id: number
    full_name: string
  }
  created_at: string
  status: string
  version: number
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Получаем реальные данные из API
        const [docsResponse, typesResponse] = await Promise.all([
          apiClient.get('/documents/'),
          apiClient.get('/documents/types/'),
        ])
        
        console.log('Documents data:', docsResponse.data)
        console.log('Document types:', typesResponse.data)
        
        setDocuments(docsResponse.data.results || [])
        setDocumentTypes(typesResponse.data.results || [])
      } catch (error) {
        console.error('Error fetching documents:', error)
        // В случае ошибки используем демо-данные
        setDocuments([])
        setDocumentTypes([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return 'PDF'
      case 'doc': case 'docx': return 'DOC'
      case 'xls': case 'xlsx': return 'XLS'
      case 'txt': return 'TXT'
      default: return 'ФАЙЛ'
    }
  }

  const getFileIcon = (filename: string) => {
    const type = getFileType(filename)
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'DOC':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'XLS':
        return <FileText className="h-5 w-5 text-green-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик'
      case 'pending_review': return 'На проверке'
      case 'approved': return 'Утвержден'
      case 'rejected': return 'Отклонен'
      default: return status
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesType = selectedType === null || doc.document_type.id === selectedType
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.created_by.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const categories = [
    { id: null, name: 'Все документы', count: documents.length },
    ...documentTypes.map(type => ({
      id: type.id,
      name: type.name,
      count: documents.filter(d => d.document_type.id === type.id).length
    }))
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Документы</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Управление корпоративными документами
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Загрузить документ
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Категории</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id || 'all'}
                  onClick={() => setSelectedType(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedType === category.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Folder className="h-4 w-4 mr-2" />
                    <span>{category.name}</span>
                  </div>
                  <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <input
                  type="text"
                  placeholder="Поиск документов..."
                  className="flex-1 input-field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select className="input-field sm:w-auto">
                  <option>Сначала новые</option>
                  <option>Сначала старые</option>
                  <option>По названию (А-Я)</option>
                  <option>По статусу</option>
                </select>
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Загрузка документов...</p>
                </div>
              ) : filteredDocuments.length > 0 ? (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => {
                    const filename = doc.file.split('/').pop() || 'document'
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          {getFileIcon(filename)}
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {doc.title}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {getFileType(filename)} • v{doc.version}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Тип: {doc.document_type.name}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Автор: {doc.created_by.full_name}
                              </span>
                              <span className={`text-sm px-2 py-1 rounded-full ${
                                doc.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                doc.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {getStatusText(doc.status)}
                              </span>
                            </div>
                            {doc.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a 
                            href={doc.file} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </a>
                          <a 
                            href={doc.file} 
                            download
                          >
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <FileText className="h-full w-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {documents.length === 0 ? 'Нет загруженных документов' : 'Документы не найдены'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {documents.length === 0 
                      ? 'Загрузите первый документ или добавьте через Django Admin' 
                      : 'Попробуйте изменить параметры поиска'}
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
