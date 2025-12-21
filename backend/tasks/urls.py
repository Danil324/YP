"""
URLs for tasks app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, TagViewSet, TaskColumnViewSet, TaskCommentViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'', TaskViewSet, basename='task')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'columns', TaskColumnViewSet, basename='column')
router.register(r'comments', TaskCommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]

