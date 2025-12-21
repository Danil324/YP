"""
URLs for processes app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProcessViewSet, ProcessInstanceViewSet, ProcessNodeViewSet

router = DefaultRouter()
router.register(r'', ProcessViewSet, basename='process')
router.register(r'instances', ProcessInstanceViewSet, basename='process-instance')
router.register(r'nodes', ProcessNodeViewSet, basename='process-node')

urlpatterns = [
    path('', include(router.urls)),
]

