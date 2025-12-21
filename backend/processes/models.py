"""
Process management models.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
import json

User = get_user_model()

PROCESS_STATUSES = [
    ('draft', _('Черновик')),
    ('active', _('Активен')),
    ('paused', _('Приостановлен')),
    ('completed', _('Завершен')),
    ('cancelled', _('Отменен')),
]

NODE_TYPES = [
    ('start', _('Начало')),
    ('task', _('Задача')),
    ('approval', _('Согласование')),
    ('condition', _('Условие')),
    ('notification', _('Уведомление')),
    ('end', _('Конец')),
]


class Process(models.Model):
    """Process model."""
    name = models.CharField(max_length=200, verbose_name=_('Название'))
    description = models.TextField(blank=True, verbose_name=_('Описание'))
    definition = models.JSONField(default=dict, verbose_name=_('Определение процесса'))  # BPMN-like structure
    status = models.CharField(max_length=20, choices=PROCESS_STATUSES, default='draft', verbose_name=_('Статус'))
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_processes', verbose_name=_('Создатель'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Процесс')
        verbose_name_plural = _('Процессы')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class ProcessInstance(models.Model):
    """Process instance model."""
    process = models.ForeignKey(Process, on_delete=models.CASCADE, related_name='instances')
    name = models.CharField(max_length=200, verbose_name=_('Название'))
    current_node = models.CharField(max_length=100, blank=True, verbose_name=_('Текущий узел'))
    status = models.CharField(max_length=20, choices=PROCESS_STATUSES, default='active', verbose_name=_('Статус'))
    data = models.JSONField(default=dict, verbose_name=_('Данные экземпляра'))
    started_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='started_processes', verbose_name=_('Запустил'))
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('Экземпляр процесса')
        verbose_name_plural = _('Экземпляры процессов')
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.process.name} - {self.name}"


class ProcessNode(models.Model):
    """Process node model (for storing node definitions)."""
    process = models.ForeignKey(Process, on_delete=models.CASCADE, related_name='nodes')
    node_id = models.CharField(max_length=100, verbose_name=_('ID узла'))
    node_type = models.CharField(max_length=20, choices=NODE_TYPES, verbose_name=_('Тип узла'))
    name = models.CharField(max_length=200, verbose_name=_('Название'))
    position = models.JSONField(default=dict, verbose_name=_('Позиция'))  # {x, y}
    config = models.JSONField(default=dict, verbose_name=_('Конфигурация'))
    connections = models.JSONField(default=list, verbose_name=_('Соединения'))
    
    class Meta:
        verbose_name = _('Узел процесса')
        verbose_name_plural = _('Узлы процессов')
        unique_together = ['process', 'node_id']
    
    def __str__(self):
        return f"{self.process.name} - {self.name}"

