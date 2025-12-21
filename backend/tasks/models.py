"""
Task management models.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from ckeditor.fields import RichTextField

User = get_user_model()

PROJECT_STATUSES = [
    ('planning', _('Планирование')),
    ('active', _('Активный')),
    ('on_hold', _('Приостановлен')),
    ('completed', _('Завершен')),
    ('cancelled', _('Отменен')),
]

TASK_STATUSES = [
    ('todo', _('К выполнению')),
    ('in_progress', _('В работе')),
    ('review', _('На проверке')),
    ('done', _('Выполнено')),
    ('cancelled', _('Отменено')),
]

TASK_PRIORITIES = [
    ('low', _('Низкий')),
    ('medium', _('Средний')),
    ('high', _('Высокий')),
    ('urgent', _('Срочный')),
]


class Project(models.Model):
    """Project model."""
    name = models.CharField(max_length=200, verbose_name=_('Название'))
    description = models.TextField(blank=True, verbose_name=_('Описание'))
    manager = models.ForeignKey(User, on_delete=models.PROTECT, related_name='managed_projects', verbose_name=_('Менеджер'))
    department = models.ForeignKey('users.Department', on_delete=models.PROTECT, null=True, blank=True, related_name='projects')
    start_date = models.DateField(null=True, blank=True, verbose_name=_('Дата начала'))
    end_date = models.DateField(null=True, blank=True, verbose_name=_('Дата окончания'))
    status = models.CharField(max_length=20, choices=PROJECT_STATUSES, default='planning', verbose_name=_('Статус'))
    color = models.CharField(max_length=7, default='#3B82F6', verbose_name=_('Цвет'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Проект')
        verbose_name_plural = _('Проекты')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class Tag(models.Model):
    """Tag model for tasks."""
    name = models.CharField(max_length=50, unique=True, verbose_name=_('Название'))
    color = models.CharField(max_length=7, default='#6B7280', verbose_name=_('Цвет'))
    
    class Meta:
        verbose_name = _('Тег')
        verbose_name_plural = _('Теги')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class TaskColumn(models.Model):
    """Kanban column model."""
    name = models.CharField(max_length=100, verbose_name=_('Название'))
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='columns', null=True, blank=True)
    position = models.PositiveIntegerField(default=0, verbose_name=_('Позиция'))
    is_default = models.BooleanField(default=False, verbose_name=_('По умолчанию'))
    
    class Meta:
        verbose_name = _('Колонка задач')
        verbose_name_plural = _('Колонки задач')
        ordering = ['position']
    
    def __str__(self):
        return self.name


class Task(models.Model):
    """Task model."""
    title = models.CharField(max_length=300, verbose_name=_('Название'))
    description = RichTextField(blank=True, verbose_name=_('Описание'))
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks', verbose_name=_('Исполнитель'))
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_tasks', verbose_name=_('Автор'))
    priority = models.CharField(max_length=20, choices=TASK_PRIORITIES, default='medium', verbose_name=_('Приоритет'))
    status = models.CharField(max_length=20, choices=TASK_STATUSES, default='todo', verbose_name=_('Статус'))
    due_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Срок выполнения'))
    tags = models.ManyToManyField(Tag, blank=True, related_name='tasks')
    column = models.ForeignKey(TaskColumn, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    position = models.PositiveIntegerField(default=0, verbose_name=_('Позиция'))
    depends_on = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='dependents', verbose_name=_('Зависит от'))
    is_recurring = models.BooleanField(default=False, verbose_name=_('Повторяющаяся'))
    recurrence_pattern = models.CharField(max_length=50, blank=True, verbose_name=_('Паттерн повторения'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('Задача')
        verbose_name_plural = _('Задачи')
        ordering = ['position', '-created_at']
    
    def __str__(self):
        return self.title


class TaskComment(models.Model):
    """Task comment model."""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_comments')
    content = models.TextField(verbose_name=_('Содержание'))
    mentions = models.ManyToManyField(User, blank=True, related_name='mentioned_in_comments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Комментарий')
        verbose_name_plural = _('Комментарии')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.author} on {self.task}"

