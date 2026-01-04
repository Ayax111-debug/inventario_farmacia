from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models import Producto, Laboratorio, Lote
from ..serializers import (
    ProductoListadoSerializer, 
    ProductoCrearSerializer,
    LaboratorioSerializer,
    LoteSerializer
)

# ---------------------------------------------------------
# 1. LABORATORIOS (El más simple)
# ---------------------------------------------------------
class LaboratorioViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]#quitar en produccion
    authentication_classes = []#quitar en produccion

    queryset = Laboratorio.objects.all()
    serializer_class = LaboratorioSerializer
   
    
 
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']


# ---------------------------------------------------------
# 2. PRODUCTOS (El cerebro de la operación)
# ---------------------------------------------------------
class ProductoViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]#quitar en produccion
    authentication_classes = []#quitar en produccion

    queryset = Producto.objects.select_related('laboratorio').all()
    
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    
    search_fields = ['nombre', 'codigo_serie', 'laboratorio__nombre']
    
    filterset_fields = ['laboratorio', 'activo', 'es_bioequivalente']
    
    ordering_fields = ['nombre', 'precio_venta', 'cantidad_mg']

    def get_serializer_class(self):
        
        if self.action == 'list':
            return ProductoListadoSerializer
        
        return ProductoCrearSerializer


# ---------------------------------------------------------
# 3. LOTES (Gestión de fechas)
# ---------------------------------------------------------

class LoteViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]#quitar en produccion
    authentication_classes = []#quitar en produccion
    
    queryset = Lote.objects.select_related('producto').all()
    serializer_class = LoteSerializer
    

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    
    filterset_fields = ['producto', 'defectuoso', 'activo']

    ordering_fields = ['fecha_vencimiento', 'fecha_creacion']