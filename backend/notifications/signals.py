"""
Signals for notifications.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from tasks.models import Task, TaskComment
from documents.models import Document, DocumentComment, Approval


@receiver(post_save, sender=Task)
def task_notification(sender, instance, created, **kwargs):
    """Send notification when task is created or updated."""
    if created and instance.assignee:
        Notification.objects.create(
            user=instance.assignee,
            type='task_assigned',
            title=f'Новая задача: {instance.title}',
            message=f'Вам назначена задача "{instance.title}"',
            link=f'/tasks/{instance.id}',
            related_object_type='task',
            related_object_id=instance.id
        )
        send_websocket_notification(instance.assignee.id, {
            'type': 'task_assigned',
            'title': f'Новая задача: {instance.title}',
            'message': f'Вам назначена задача "{instance.title}"',
        })
    elif not created and instance.assignee:
        Notification.objects.create(
            user=instance.assignee,
            type='task_updated',
            title=f'Задача обновлена: {instance.title}',
            message=f'Задача "{instance.title}" была обновлена',
            link=f'/tasks/{instance.id}',
            related_object_type='task',
            related_object_id=instance.id
        )


@receiver(post_save, sender=TaskComment)
def task_comment_notification(sender, instance, created, **kwargs):
    """Send notification when task comment is created."""
    if created:
        # Notify task assignee and reporter
        users_to_notify = set()
        if instance.task.assignee:
            users_to_notify.add(instance.task.assignee)
        if instance.task.reporter:
            users_to_notify.add(instance.task.reporter)
        
        # Remove comment author
        users_to_notify.discard(instance.author)
        
        for user in users_to_notify:
            Notification.objects.create(
                user=user,
                type='task_comment',
                title=f'Новый комментарий к задаче: {instance.task.title}',
                message=f'{instance.author.get_full_name()} оставил комментарий',
                link=f'/tasks/{instance.task.id}',
                related_object_type='task',
                related_object_id=instance.task.id
            )
        
        # Notify mentioned users
        for mentioned_user in instance.mentions.all():
            Notification.objects.create(
                user=mentioned_user,
                type='mention',
                title=f'Вас упомянули в комментарии',
                message=f'{instance.author.get_full_name()} упомянул вас в комментарии к задаче "{instance.task.title}"',
                link=f'/tasks/{instance.task.id}',
                related_object_type='task',
                related_object_id=instance.task.id
            )


@receiver(post_save, sender=Document)
def document_notification(sender, instance, created, **kwargs):
    """Send notification when document is submitted for approval."""
    if instance.status == 'pending' and instance.current_step:
        Notification.objects.create(
            user=instance.current_step.approver,
            type='document_submitted',
            title=f'Документ на согласовании: {instance.title}',
            message=f'Документ "{instance.title}" требует вашего согласования',
            link=f'/documents/{instance.id}',
            related_object_type='document',
            related_object_id=instance.id
        )


@receiver(post_save, sender=Approval)
def approval_notification(sender, instance, created, **kwargs):
    """Send notification when document is approved/rejected."""
    if instance.status == 'approved':
        Notification.objects.create(
            user=instance.document.created_by,
            type='document_approved',
            title=f'Документ согласован: {instance.document.title}',
            message=f'{instance.approver.get_full_name()} согласовал документ "{instance.document.title}"',
            link=f'/documents/{instance.document.id}',
            related_object_type='document',
            related_object_id=instance.document.id
        )
    elif instance.status == 'rejected':
        Notification.objects.create(
            user=instance.document.created_by,
            type='document_rejected',
            title=f'Документ отклонен: {instance.document.title}',
            message=f'{instance.approver.get_full_name()} отклонил документ "{instance.document.title}"',
            link=f'/documents/{instance.document.id}',
            related_object_type='document',
            related_object_id=instance.document.id
        )


def send_websocket_notification(user_id, message):
    """Send notification via WebSocket."""
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f'notifications_{user_id}',
            {
                'type': 'notification_message',
                'message': message
            }
        )

