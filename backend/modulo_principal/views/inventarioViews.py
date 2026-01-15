from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models import Producto, Laboratorio, Lote
from ..serializers import (
    ProductoSerializer,
    LaboratorioSerializer,
    LoteSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q

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
    serializer_class = ProductoSerializer


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

#------------vista de busqueda Global----------

class GlobalSearchView(APIView):
    """
    Busca simultáneamente en Productos, Lotes y Laboratorios.
    Optimizado para velocidad (retorna solo lo necesario).
    """
    permission_classes = [AllowAny] 
    authentication_classes = []

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 3:
            return Response([]) 

       
        productos = Producto.objects.filter(
            Q(nombre__icontains=query) | Q(id__icontains=query) | Q(codigo_serie__icontains=query) | Q(laboratorio__nombre__icontains=query)
        ).select_related('laboratorio')[:5]

       
        lotes = Lote.objects.filter(
            codigo_lote__icontains=query
        ).select_related('producto')[:5]

      
        laboratorios = Laboratorio.objects.filter(
            nombre__icontains=query
        )[:5]

     
        data = {
            'productos': [{
                'id': p.id,
                'titulo': p.nombre,
                'subtitulo': f"{p.id} - {p.cantidad_mg}mg - {p.laboratorio.nombre}",
                'extra': p.codigo_serie
            } for p in productos],
            
            'lotes': [{
                'id': l.id,
                'titulo': f"Lote: {l.codigo_lote}",
                'subtitulo': f"Vence: {l.fecha_vencimiento}",
                'extra': l.producto.nombre
            } for l in lotes],
            
            'laboratorios': [{
                'id': l.id,
                'titulo': l.nombre,
                'subtitulo': l.telefono or "Sin teléfono",
                'extra': ''
            } for l in laboratorios]
        }

        return Response(data)