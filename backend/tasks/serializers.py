"""
Serializers for tasks app.
"""
from rest_framework import serializers
from .models import Project, Task, Tag, TaskColumn, TaskComment
from users.serializers import UserSerializer


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color']


class ProjectSerializer(serializers.ModelSerializer):
    manager = UserSerializer(read_only=True)
    manager_id = serializers.IntegerField(write_only=True)
    task_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'manager', 'manager_id', 'department',
            'start_date', 'end_date', 'status', 'color', 'task_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TaskColumnSerializer(serializers.ModelSerializer):
    task_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = TaskColumn
        fields = ['id', 'name', 'project', 'position', 'is_default', 'task_count']


class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    reporter = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    column = TaskColumnSerializer(read_only=True)
    assignee_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    reporter_id = serializers.IntegerField(write_only=True, required=False)
    project_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    tag_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    column_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    comment_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'project_id', 'assignee', 'assignee_id',
            'reporter', 'reporter_id', 'priority', 'status', 'due_date', 'tags', 'tag_ids',
            'column', 'column_id', 'position', 'depends_on', 'is_recurring', 'recurrence_pattern',
            'comment_count', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'completed_at']


class TaskCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    mentions = UserSerializer(many=True, read_only=True)
    mention_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'author', 'content', 'mentions', 'mention_ids', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        mention_ids = validated_data.pop('mention_ids', [])
        comment = TaskComment.objects.create(**validated_data, author=self.context['request'].user)
        if mention_ids:
            comment.mentions.set(mention_ids)
        return comment

