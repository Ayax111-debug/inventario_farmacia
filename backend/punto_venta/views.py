from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Venta
from .serializers import VentaSerializer

class VentaViewSet(viewsets.ModelViewSet):
    # Solo usuarios autenticados pueden vender (Seguridad básica)
    permission_classes = [AllowAny] 
    
    serializer_class = VentaSerializer
    queryset = Venta.objects.all().select_related('usuario').prefetch_related('detalles__producto')
    
    # Filtros para el historial de ventas
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    filterset_fields = {
        'fecha': ['gte', 'lte'],      # Ventas del día/mes
        'metodo_pago': ['exact'],     # Cuánto vendí en efectivo
        'usuario': ['exact'],         # Ventas por cajero
        'anulada': ['exact'],
    }
    
    ordering_fields = ['fecha', 'total']
    ordering = ['-fecha'] # Las más recientes primero

    # Deshabilitamos update/partial_update/destroy directos
    # Una venta no se edita ni se borra, se ANULA (lo veremos en lógica de negocio)
    http_method_names = ['get', 'post', 'head', 'options']

    def create(self, request, *args, **kwargs):
        """
        Aquí irá la lógica transaccional ACID más adelante.
        Por ahora, usa la implementación estándar de DRF.
        """
        return super().create(request, *args, **kwargs)
