from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, ProductoViewSet,LaboratorioViewSet,LoteViewSet


router = DefaultRouter()

#api de usuarios
router.register(r'usuarios',UsuarioViewSet, basename = 'usuario')

#api de inventario
router.register(r'productos',ProductoViewSet,basename = 'producto')
router.register(r'laboratorios',LaboratorioViewSet, basename = 'laboratorio')
router.register(r'lotes',LoteViewSet,basename='lote')

urlpatterns = [
    path('', include(router.urls)),
]
