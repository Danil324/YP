"""
User models for corporate portal.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class Department(models.Model):
    """Department model."""
    name = models.CharField(max_length=200, verbose_name=_('Название'))
    description = models.TextField(blank=True, verbose_name=_('Описание'))
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('Отдел')
        verbose_name_plural = _('Отделы')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Role(models.Model):
    """Role model for permissions."""
    name = models.CharField(max_length=100, unique=True, verbose_name=_('Название'))
    code = models.CharField(max_length=50, unique=True, verbose_name=_('Код'))
    description = models.TextField(blank=True, verbose_name=_('Описание'))
    permissions = models.JSONField(default=list, verbose_name=_('Разрешения'))
    
    class Meta:
        verbose_name = _('Роль')
        verbose_name_plural = _('Роли')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class User(AbstractUser):
    """Custom user model."""
    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(max_length=20, blank=True, verbose_name=_('Телефон'))
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, verbose_name=_('Аватар'))
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    position = models.CharField(max_length=200, blank=True, verbose_name=_('Должность'))
    bio = models.TextField(blank=True, verbose_name=_('О себе'))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = _('Пользователь')
        verbose_name_plural = _('Пользователи')
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username

