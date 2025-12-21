"""
Views for documents app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from .models import DocumentType, ApprovalWorkflow, WorkflowStep, Document, Approval, DocumentComment
from .serializers import (
    DocumentTypeSerializer, ApprovalWorkflowSerializer, WorkflowStepSerializer,
    DocumentSerializer, ApprovalSerializer, DocumentCommentSerializer
)


class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = []


class ApprovalWorkflowViewSet(viewsets.ModelViewSet):
    queryset = ApprovalWorkflow.objects.prefetch_related('steps__approver').filter(is_active=True)
    serializer_class = ApprovalWorkflowSerializer
    permission_classes = [IsAuthenticated]


class WorkflowStepViewSet(viewsets.ModelViewSet):
    queryset = WorkflowStep.objects.select_related('workflow', 'approver').all()
    serializer_class = WorkflowStepSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['workflow']


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.select_related(
        'document_type', 'created_by', 'workflow', 'current_step', 'parent'
    ).prefetch_related('tags').annotate(
        approval_count=Count('approvals'),
        comment_count=Count('comments')
    ).all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'document_type', 'workflow', 'created_by']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, pk=None):
        """Submit document for approval."""
        document = self.get_object()
        if document.status != 'draft':
            return Response({'error': 'Document is not in draft status'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not document.workflow:
            return Response({'error': 'No workflow assigned'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get first step
        first_step = document.workflow.steps.order_by('order').first()
        if first_step:
            document.current_step = first_step
            document.status = 'pending'
            document.save()
            
            # Create approval record
            Approval.objects.create(
                document=document,
                step=first_step,
                approver=first_step.approver
            )
        
        return Response(DocumentSerializer(document).data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve document at current step."""
        document = self.get_object()
        comment = request.data.get('comment', '')
        
        if not document.current_step:
            return Response({'error': 'No current step'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update or create approval
        approval, created = Approval.objects.get_or_create(
            document=document,
            step=document.current_step,
            approver=request.user,
            defaults={'status': 'approved', 'comment': comment}
        )
        
        if not created:
            approval.status = 'approved'
            approval.comment = comment
            approval.save()
        
        # Move to next step or complete
        next_step = document.workflow.steps.filter(order__gt=document.current_step.order).order_by('order').first()
        if next_step:
            document.current_step = next_step
            Approval.objects.create(
                document=document,
                step=next_step,
                approver=next_step.approver
            )
        else:
            document.status = 'approved'
            document.current_step = None
            from django.utils import timezone
            document.approved_at = timezone.now()
        
        document.save()
        return Response(DocumentSerializer(document).data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject document."""
        document = self.get_object()
        comment = request.data.get('comment', '')
        
        if not document.current_step:
            return Response({'error': 'No current step'}, status=status.HTTP_400_BAD_REQUEST)
        
        approval, created = Approval.objects.get_or_create(
            document=document,
            step=document.current_step,
            approver=request.user,
            defaults={'status': 'rejected', 'comment': comment}
        )
        
        if not created:
            approval.status = 'rejected'
            approval.comment = comment
            approval.save()
        
        document.status = 'rejected'
        document.current_step = None
        document.save()
        
        return Response(DocumentSerializer(document).data)


class ApprovalViewSet(viewsets.ModelViewSet):
    queryset = Approval.objects.select_related('document', 'step', 'approver').all()
    serializer_class = ApprovalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document', 'step', 'approver', 'status']


class DocumentCommentViewSet(viewsets.ModelViewSet):
    queryset = DocumentComment.objects.select_related('author', 'document').prefetch_related('mentions').all()
    serializer_class = DocumentCommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document']
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

