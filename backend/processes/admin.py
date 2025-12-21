"""
Admin configuration for processes app.
"""
from django.contrib import admin
from .models import Process, ProcessInstance, ProcessNode


@admin.register(Process)
class ProcessAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'description']


@admin.register(ProcessInstance)
class ProcessInstanceAdmin(admin.ModelAdmin):
    list_display = ['name', 'process', 'status', 'started_by', 'started_at', 'completed_at']
    list_filter = ['status', 'started_at']
    search_fields = ['name']


@admin.register(ProcessNode)
class ProcessNodeAdmin(admin.ModelAdmin):
    list_display = ['name', 'process', 'node_type', 'node_id']
    list_filter = ['node_type', 'process']
    search_fields = ['name', 'node_id']

