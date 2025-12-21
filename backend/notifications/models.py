"""
Notifications models.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

NOTIFICATION_TYPES = [
    ('task_assigned', _('Задача назначена')),
    ('task_updated', _('Задача обновлена')),
    ('task_comment', _('Новый комментарий к задаче')),
    ('document_submitted', _('Документ отправлен на согласование')),
    ('document_approved', _('Документ согласован')),
    ('document_rejected', _('Документ отклонен')),
    ('document_comment', _('Новый комментарий к документу')),
    ('process_started', _('Процесс запущен')),
    ('process_completed', _('Процесс завершен')),
    ('mention', _('Вас упомянули')),
    ('system', _('Системное уведомление')),
]


class Notification(models.Model):
    """Notification model."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name=_('Пользователь'))
    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, verbose_name=_('Тип'))
    title = models.CharField(max_length=200, verbose_name=_('Заголовок'))
    message = models.TextField(verbose_name=_('Сообщение'))
    is_read = models.BooleanField(default=False, verbose_name=_('Прочитано'))
    link = models.URLField(blank=True, verbose_name=_('Ссылка'))
    related_object_type = models.CharField(max_length=50, blank=True, verbose_name=_('Тип связанного объекта'))
    related_object_id = models.IntegerField(null=True, blank=True, verbose_name=_('ID связанного объекта'))
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('Уведомление')
        verbose_name_plural = _('Уведомления')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.title}"

