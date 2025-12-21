"""
Views for tasks app.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from .models import Project, Task, Tag, TaskColumn, TaskComment
from .serializers import (
    ProjectSerializer, TaskSerializer, TagSerializer,
    TaskColumnSerializer, TaskCommentSerializer
)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related('manager', 'department').annotate(
        task_count=Count('tasks')
    ).all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'department', 'manager']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related(
        'project', 'assignee', 'reporter', 'column', 'depends_on'
    ).prefetch_related('tags').annotate(
        comment_count=Count('comments')
    ).all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'project', 'assignee', 'reporter', 'column']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority', 'position']
    ordering = ['position', '-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filter by user's tasks if requested
        if self.request.query_params.get('my_tasks') == 'true':
            queryset = queryset.filter(assignee=user)
        
        # Filter by project
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
    
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """Move task to different column/position."""
        task = self.get_object()
        column_id = request.data.get('column_id')
        position = request.data.get('position', 0)
        
        if column_id:
            try:
                column = TaskColumn.objects.get(id=column_id)
                task.column = column
            except TaskColumn.DoesNotExist:
                return Response({'error': 'Column not found'}, status=status.HTTP_404_NOT_FOUND)
        
        task.position = position
        task.save()
        
        return Response(TaskSerializer(task).data)
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change task status."""
        task = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Task.TASK_STATUSES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        task.status = new_status
        if new_status == 'done' and not task.completed_at:
            from django.utils import timezone
            task.completed_at = timezone.now()
        task.save()
        
        return Response(TaskSerializer(task).data)


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class TaskColumnViewSet(viewsets.ModelViewSet):
    queryset = TaskColumn.objects.annotate(task_count=Count('tasks')).all()
    serializer_class = TaskColumnSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project']


class TaskCommentViewSet(viewsets.ModelViewSet):
    queryset = TaskComment.objects.select_related('author', 'task').prefetch_related('mentions').all()
    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task']
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

