"""
Analytics views.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q, Avg, Sum
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from tasks.models import Task, Project
from documents.models import Document
from processes.models import ProcessInstance

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics."""
    user = request.user
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Task statistics
    total_tasks = Task.objects.count()
    my_tasks = Task.objects.filter(assignee=user).count()
    completed_tasks = Task.objects.filter(status='done').count()
    overdue_tasks = Task.objects.filter(due_date__lt=now, status__in=['todo', 'in_progress']).count()
    
    # Project statistics
    total_projects = Project.objects.count()
    active_projects = Project.objects.filter(status='active').count()
    
    # Document statistics
    total_documents = Document.objects.count()
    pending_documents = Document.objects.filter(status='pending').count()
    approved_documents = Document.objects.filter(status='approved').count()
    
    # Process statistics
    active_processes = ProcessInstance.objects.filter(status='active').count()
    completed_processes = ProcessInstance.objects.filter(status='completed').count()
    
    # Recent activity
    recent_tasks = Task.objects.filter(updated_at__gte=week_ago).count()
    recent_documents = Document.objects.filter(updated_at__gte=week_ago).count()
    
    return Response({
        'tasks': {
            'total': total_tasks,
            'my_tasks': my_tasks,
            'completed': completed_tasks,
            'overdue': overdue_tasks,
        },
        'projects': {
            'total': total_projects,
            'active': active_projects,
        },
        'documents': {
            'total': total_documents,
            'pending': pending_documents,
            'approved': approved_documents,
        },
        'processes': {
            'active': active_processes,
            'completed': completed_processes,
        },
        'activity': {
            'recent_tasks': recent_tasks,
            'recent_documents': recent_documents,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_analytics(request):
    """Get task analytics."""
    user = request.user
    now = timezone.now()
    month_ago = now - timedelta(days=30)
    
    # Tasks by status
    tasks_by_status = Task.objects.values('status').annotate(count=Count('id'))
    
    # Tasks by priority
    tasks_by_priority = Task.objects.values('priority').annotate(count=Count('id'))
    
    # Tasks completion rate
    total_tasks = Task.objects.count()
    completed_tasks = Task.objects.filter(status='done').count()
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Average completion time
    completed_tasks_with_date = Task.objects.filter(
        status='done',
        completed_at__isnull=False,
        created_at__isnull=False
    )
    avg_completion_time = None
    if completed_tasks_with_date.exists():
        # Calculate average days to complete
        completion_times = []
        for task in completed_tasks_with_date:
            if task.completed_at and task.created_at:
                delta = task.completed_at - task.created_at
                completion_times.append(delta.days)
        if completion_times:
            avg_completion_time = sum(completion_times) / len(completion_times)
    
    # Tasks by assignee
    tasks_by_assignee = Task.objects.filter(assignee__isnull=False).values(
        'assignee__first_name', 'assignee__last_name'
    ).annotate(count=Count('id')).order_by('-count')[:10]
    
    return Response({
        'by_status': list(tasks_by_status),
        'by_priority': list(tasks_by_priority),
        'completion_rate': round(completion_rate, 2),
        'avg_completion_time_days': round(avg_completion_time, 2) if avg_completion_time else None,
        'by_assignee': list(tasks_by_assignee),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def document_analytics(request):
    """Get document analytics."""
    # Documents by status
    documents_by_status = Document.objects.values('status').annotate(count=Count('id'))
    
    # Documents by type
    documents_by_type = Document.objects.values('document_type__name').annotate(count=Count('id'))
    
    # Approval time statistics
    approved_documents = Document.objects.filter(status='approved', approved_at__isnull=False)
    avg_approval_time = None
    if approved_documents.exists():
        approval_times = []
        for doc in approved_documents:
            if doc.approved_at and doc.created_at:
                delta = doc.approved_at - doc.created_at
                approval_times.append(delta.days)
        if approval_times:
            avg_approval_time = sum(approval_times) / len(approval_times)
    
    return Response({
        'by_status': list(documents_by_status),
        'by_type': list(documents_by_type),
        'avg_approval_time_days': round(avg_approval_time, 2) if avg_approval_time else None,
    })

