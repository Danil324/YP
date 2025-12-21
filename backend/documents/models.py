"""
Document workflow models.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

DOCUMENT_STATUSES = [
    ('draft', _('Черновик')),
    ('pending', _('На согласовании')),
    ('approved', _('Согласован')),
    ('rejected', _('Отклонен')),
    ('archived', _('Архивирован')),
]


class DocumentType(models.Model):
    """Document type model."""
    name = models.CharField(max_length=200, verbose_name=_('Название'))
    description = models.TextField(blank=True, verbose_name=_('Описание'))
    template = models.FileField(upload_to='templates/', null=True, blank=True, verbose_name=_('Шаблон'))
    
    class Meta:
        verbose_name = _('Тип документа')
        verbose_name_plural = _('Типы документов')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ApprovalWorkflow(models.Model):
    """Approval workflow model."""
    name = models.CharField(max_length=200, verbose_name=_('Название'))
    description = models.TextField(blank=True, verbose_name=_('Описание'))
    is_active = models.BooleanField(default=True, verbose_name=_('Активен'))
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('Маршрут согласования')
        verbose_name_plural = _('Маршруты согласования')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class WorkflowStep(models.Model):
    """Workflow step model."""
    workflow = models.ForeignKey(ApprovalWorkflow, on_delete=models.CASCADE, related_name='steps')
    name = models.CharField(max_length=200, verbose_name=_('Название'))
    approver = models.ForeignKey(User, on_delete=models.PROTECT, related_name='approval_steps', verbose_name=_('Согласующий'))
    order = models.PositiveIntegerField(verbose_name=_('Порядок'))
    is_required = models.BooleanField(default=True, verbose_name=_('Обязательный'))
    
    class Meta:
        verbose_name = _('Этап согласования')
        verbose_name_plural = _('Этапы согласования')
        ordering = ['workflow', 'order']
        unique_together = ['workflow', 'order']
    
    def __str__(self):
        return f"{self.workflow.name} - {self.name}"


class Document(models.Model):
    """Document model."""
    title = models.CharField(max_length=500, verbose_name=_('Название'))
    file = models.FileField(upload_to='documents/%Y/%m/%d/', verbose_name=_('Файл'))
    document_type = models.ForeignKey(DocumentType, on_delete=models.PROTECT, related_name='documents', verbose_name=_('Тип документа'))
    version = models.PositiveIntegerField(default=1, verbose_name=_('Версия'))
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='versions', verbose_name=_('Родительский документ'))
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_documents', verbose_name=_('Создатель'))
    workflow = models.ForeignKey(ApprovalWorkflow, on_delete=models.PROTECT, related_name='documents', null=True, blank=True)
    current_step = models.ForeignKey(WorkflowStep, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_documents')
    status = models.CharField(max_length=20, choices=DOCUMENT_STATUSES, default='draft', verbose_name=_('Статус'))
    description = models.TextField(blank=True, verbose_name=_('Описание'))
    tags = models.ManyToManyField('tasks.Tag', blank=True, related_name='documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('Документ')
        verbose_name_plural = _('Документы')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Approval(models.Model):
    """Document approval model."""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='approvals')
    step = models.ForeignKey(WorkflowStep, on_delete=models.PROTECT, related_name='approvals')
    approver = models.ForeignKey(User, on_delete=models.PROTECT, related_name='approvals')
    status = models.CharField(max_length=20, choices=[
        ('pending', _('Ожидает')),
        ('approved', _('Согласовано')),
        ('rejected', _('Отклонено')),
    ], default='pending')
    comment = models.TextField(blank=True, verbose_name=_('Комментарий'))
    signed_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Дата подписания'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Согласование')
        verbose_name_plural = _('Согласования')
        ordering = ['step__order', '-created_at']
        unique_together = ['document', 'step', 'approver']
    
    def __str__(self):
        return f"{self.document.title} - {self.step.name} - {self.approver}"


class DocumentComment(models.Model):
    """Document comment model."""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='document_comments')
    content = models.TextField(verbose_name=_('Содержание'))
    mentions = models.ManyToManyField(User, blank=True, related_name='mentioned_in_document_comments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Комментарий к документу')
        verbose_name_plural = _('Комментарии к документам')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.author} on {self.document}"

