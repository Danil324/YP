"""
Serializers for documents app.
"""
from rest_framework import serializers
from .models import DocumentType, ApprovalWorkflow, WorkflowStep, Document, Approval, DocumentComment
from users.serializers import UserSerializer
from tasks.serializers import TagSerializer


class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = ['id', 'name', 'description', 'template']


class WorkflowStepSerializer(serializers.ModelSerializer):
    approver = UserSerializer(read_only=True)
    approver_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = WorkflowStep
        fields = ['id', 'workflow', 'name', 'approver', 'approver_id', 'order', 'is_required']


class ApprovalWorkflowSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = ApprovalWorkflow
        fields = ['id', 'name', 'description', 'is_active', 'steps', 'created_at']


class DocumentSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    document_type = DocumentTypeSerializer(read_only=True)
    workflow = ApprovalWorkflowSerializer(read_only=True)
    current_step = WorkflowStepSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    document_type_id = serializers.IntegerField(write_only=True)
    workflow_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    tag_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    approval_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'file', 'document_type', 'document_type_id', 'version', 'parent',
            'created_by', 'workflow', 'workflow_id', 'current_step', 'status', 'description',
            'tags', 'tag_ids', 'approval_count', 'comment_count', 'created_at', 'updated_at', 'approved_at'
        ]
        read_only_fields = ['created_by', 'version', 'created_at', 'updated_at', 'approved_at']


class ApprovalSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)
    step = WorkflowStepSerializer(read_only=True)
    approver = UserSerializer(read_only=True)
    document_id = serializers.IntegerField(write_only=True)
    step_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Approval
        fields = [
            'id', 'document', 'document_id', 'step', 'step_id', 'approver', 'status',
            'comment', 'signed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['approver', 'signed_at', 'created_at', 'updated_at']


class DocumentCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    mentions = UserSerializer(many=True, read_only=True)
    mention_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    
    class Meta:
        model = DocumentComment
        fields = ['id', 'document', 'author', 'content', 'mentions', 'mention_ids', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        mention_ids = validated_data.pop('mention_ids', [])
        comment = DocumentComment.objects.create(**validated_data, author=self.context['request'].user)
        if mention_ids:
            comment.mentions.set(mention_ids)
        return comment

