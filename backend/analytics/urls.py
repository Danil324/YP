"""
URLs for analytics app.
"""
from django.urls import path
from .views import dashboard_stats, task_analytics, document_analytics

urlpatterns = [
    path('dashboard/', dashboard_stats, name='dashboard-stats'),
    path('tasks/', task_analytics, name='task-analytics'),
    path('documents/', document_analytics, name='document-analytics'),
]

