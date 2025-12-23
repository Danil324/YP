# Corporate Portal

Корпоративный портал для управления задачами, документами, процессами и аналитикой.

## Технологии

### Backend
- Django REST Framework
- Django Channels (WebSocket)
- PostgreSQL (рекомендуется)
- JWT аутентификация

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router

## Структура проекта

```
├── backend/          # Django приложение
├── frontend/         # React приложение
└── docker-compose.yml
```

## Установка и запуск

### Backend

1. Перейдите в директорию backend:
```bash
cd backend
```

2. Создайте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # для macOS/Linux
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Создайте файл `.env` в директории `backend/`:
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

5. Выполните миграции:
```bash
python manage.py migrate
```

6. Создайте суперпользователя:
```bash
python manage.py createsuperuser
```

7. Запустите сервер:
```bash
python manage.py runserver
```

### Frontend

1. Перейдите в директорию frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите dev сервер:
```bash
npm run dev
```

### Docker

Для запуска через Docker Compose:

```bash
docker-compose up -d
```

## Функциональность

- ✅ Управление задачами (Kanban доска)
- ✅ Управление документами
- ✅ Управление процессами
- ✅ Аналитика и отчеты
- ✅ Уведомления в реальном времени (WebSocket)
- ✅ Аутентификация и авторизация
