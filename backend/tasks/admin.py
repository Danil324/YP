"""
Admin configuration for tasks app.
"""
from django.contrib import admin
from .models import Project, Task, Tag, TaskColumn, TaskComment


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'manager', 'department', 'status', 'start_date', 'end_date']
    list_filter = ['status', 'department', 'created_at']
    search_fields = ['name', 'description']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color']
    search_fields = ['name']


@admin.register(TaskColumn)
class TaskColumnAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'position', 'is_default']
    list_filter = ['project', 'is_default']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'assignee', 'reporter', 'priority', 'status', 'due_date']
    list_filter = ['status', 'priority', 'project', 'created_at']
    search_fields = ['title', 'description']
    filter_horizontal = ['tags']


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content']

