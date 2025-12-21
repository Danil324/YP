"""
Serializers for processes app.
"""
from rest_framework import serializers
from .models import Process, ProcessInstance, ProcessNode
from users.serializers import UserSerializer


class ProcessNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessNode
        fields = ['id', 'process', 'node_id', 'node_type', 'name', 'position', 'config', 'connections']


class ProcessSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    nodes = ProcessNodeSerializer(many=True, read_only=True)
    instance_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Process
        fields = [
            'id', 'name', 'description', 'definition', 'status', 'created_by',
            'nodes', 'instance_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class ProcessInstanceSerializer(serializers.ModelSerializer):
    process = ProcessSerializer(read_only=True)
    started_by = UserSerializer(read_only=True)
    process_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ProcessInstance
        fields = [
            'id', 'process', 'process_id', 'name', 'current_node', 'status',
            'data', 'started_by', 'started_at', 'completed_at'
        ]
        read_only_fields = ['started_by', 'started_at', 'completed_at']

