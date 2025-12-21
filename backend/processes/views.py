"""
Views for processes app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from .models import Process, ProcessInstance, ProcessNode
from .serializers import ProcessSerializer, ProcessInstanceSerializer, ProcessNodeSerializer


class ProcessViewSet(viewsets.ModelViewSet):
    queryset = Process.objects.select_related('created_by').prefetch_related('nodes').annotate(
        instance_count=Count('instances')
    ).all()
    serializer_class = ProcessSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def save_nodes(self, request, pk=None):
        """Save process nodes."""
        process = self.get_object()
        nodes_data = request.data.get('nodes', [])
        
        # Delete existing nodes
        ProcessNode.objects.filter(process=process).delete()
        
        # Create new nodes
        for node_data in nodes_data:
            ProcessNode.objects.create(process=process, **node_data)
        
        # Update process definition
        process.definition = request.data.get('definition', {})
        process.save()
        
        return Response(ProcessSerializer(process).data)


class ProcessNodeViewSet(viewsets.ModelViewSet):
    queryset = ProcessNode.objects.select_related('process').all()
    serializer_class = ProcessNodeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = []
    filterset_fields = ['process']


class ProcessInstanceViewSet(viewsets.ModelViewSet):
    queryset = ProcessInstance.objects.select_related('process', 'started_by').all()
    serializer_class = ProcessInstanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = []
    filterset_fields = ['process', 'status']
    
    def perform_create(self, serializer):
        serializer.save(started_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def move_to_node(self, request, pk=None):
        """Move process instance to next node."""
        instance = self.get_object()
        next_node = request.data.get('node_id')
        
        instance.current_node = next_node
        instance.save()
        
        return Response(ProcessInstanceSerializer(instance).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete process instance."""
        instance = self.get_object()
        from django.utils import timezone
        
        instance.status = 'completed'
        instance.completed_at = timezone.now()
        instance.save()
        
        return Response(ProcessInstanceSerializer(instance).data)

