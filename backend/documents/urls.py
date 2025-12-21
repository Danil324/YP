"""
URLs for documents app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DocumentTypeViewSet, ApprovalWorkflowViewSet, WorkflowStepViewSet,
    DocumentViewSet, ApprovalViewSet, DocumentCommentViewSet
)

router = DefaultRouter()
router.register(r'types', DocumentTypeViewSet, basename='document-type')
router.register(r'workflows', ApprovalWorkflowViewSet, basename='workflow')
router.register(r'workflow-steps', WorkflowStepViewSet, basename='workflow-step')
router.register(r'', DocumentViewSet, basename='document')
router.register(r'approvals', ApprovalViewSet, basename='approval')
router.register(r'comments', DocumentCommentViewSet, basename='document-comment')

urlpatterns = [
    path('', include(router.urls)),
]

