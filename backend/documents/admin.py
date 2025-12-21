"""
Admin configuration for documents app.
"""
from django.contrib import admin
from .models import DocumentType, ApprovalWorkflow, WorkflowStep, Document, Approval, DocumentComment


@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(ApprovalWorkflow)
class ApprovalWorkflowAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']


@admin.register(WorkflowStep)
class WorkflowStepAdmin(admin.ModelAdmin):
    list_display = ['name', 'workflow', 'approver', 'order', 'is_required']
    list_filter = ['workflow', 'is_required']
    ordering = ['workflow', 'order']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'document_type', 'created_by', 'status', 'version', 'created_at']
    list_filter = ['status', 'document_type', 'created_at']
    search_fields = ['title', 'description']
    filter_horizontal = ['tags']


@admin.register(Approval)
class ApprovalAdmin(admin.ModelAdmin):
    list_display = ['document', 'step', 'approver', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['document__title', 'comment']


@admin.register(DocumentComment)
class DocumentCommentAdmin(admin.ModelAdmin):
    list_display = ['document', 'author', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content']

