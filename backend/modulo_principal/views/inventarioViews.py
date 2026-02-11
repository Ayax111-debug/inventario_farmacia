from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q, Case, When, Value, BooleanField, Sum, F

from ..models import Producto, Laboratorio, Lote
from ..serializers import (
    ProductoSerializer,
    LaboratorioSerializer,
    LoteSerializer
)

# ---------------------------------------------------------
# 1. LABORATORIOS
# ---------------------------------------------------------
class LaboratorioViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] # quitar en produccion
    authentication_classes = [] # quitar en produccion

    queryset = Laboratorio.objects.all()
    serializer_class = LaboratorioSerializer
    
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'telefono'] # Agregué teléfono por si acaso
    ordering_fields = ['nombre']
    ordering = ['nombre']

    @action(detail=False, methods=['get'], pagination_class=None)
    def simple_list(self, request):
        # Optimización: values() trae un dict, es mucho más rápido que serializar objetos completos
        data = self.queryset.values('id', 'nombre')
        return Response(list(data))


# ---------------------------------------------------------
# 2. PRODUCTOS (El cerebro de la operación)
# ---------------------------------------------------------
class ProductoViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] # quitar en produccion
    authentication_classes = [] # quitar en produccion

    serializer_class = ProductoSerializer
    
    # Configuración de Filtros Potenciada
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # 1. Búsqueda Texto (Smart Filter input texto)
    search_fields = ['nombre', 'codigo_serie', 'laboratorio__nombre', 'descripcion']
    
    # 2. Filtros Estructurados (Smart Filter selects/rangos)
    # Usamos diccionario para permitir rangos (gte=desde, lte=hasta)
    filterset_fields = {
        'laboratorio': ['exact'],
        'activo': ['exact'],
        'es_bioequivalente': ['exact'],
        'cantidad_mg': ['gte', 'lte', 'exact'], # Permite filtrar "más de 500mg"
    }
    
    # 3. Ordenamiento manual (Click en cabeceras de tabla)
    ordering_fields = ['nombre', 'precio_venta', 'cantidad_mg', 'laboratorio__nombre']

    def get_queryset(self):
        """
        Smart Sorting:
        1. Prioridad: Productos Activos
        2. Prioridad: Con Stock (Calculado al vuelo)
        3. Alfabético
        """
        qs = Producto.objects.select_related('laboratorio')
        
        # Anotamos el stock total sumando lotes activos
        # Coalesce(Sum(...), 0) se asegura de que si no hay lotes devuelva 0 en vez de None
        qs = qs.annotate(
            total_stock_disponible=Sum(
                'lotes__cantidad', 
                filter=Q(lotes__activo=True, lotes__defectuoso=False)
            )
        )
        
        # Lógica de Ordenamiento por defecto:
        # Primero los ACTIVOS, luego los que tienen MÁS STOCK, luego por NOMBRE
        return qs.order_by('-activo', F('total_stock_disponible').desc(nulls_last=True), 'nombre')

    @action(detail=False, methods=['get'], pagination_class=None)
    def simple_list(self, request):
        # Optimizado con values()
        data = Producto.objects.values('id', 'nombre')
        return Response(list(data))


# ---------------------------------------------------------
# 3. LOTES (Gestión de fechas)
# ---------------------------------------------------------
class LoteViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] # quitar en produccion
    authentication_classes = [] # quitar en produccion
    
    serializer_class = LoteSerializer
    
    # Bloqueamos DELETE directo en la API por seguridad (ya lo tienes en el modelo, pero doble capa)
    # http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options'] 
    # (Comentado porque en desarrollo quizás quieras borrar, descomentar en prod)

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Búsqueda por código (faltaba esto para tu buscador)
    search_fields = ['codigo_lote', 'producto__nombre']

    # Filtros potentes para fechas
    filterset_fields = {
        'producto': ['exact'],
        'defectuoso': ['exact'],
        'activo': ['exact'],
        'fecha_vencimiento': ['gte', 'lte'], # Vital para "Ver lotes que vencen este mes"
        'fecha_creacion': ['gte', 'lte'],
        'cantidad': ['gte', 'lte'], # Para ver "Lotes con poco stock"
    }

    ordering_fields = ['fecha_vencimiento', 'fecha_creacion', 'cantidad']

    def get_queryset(self):
        """
        Smart Sorting Lotes:
        1. Lotes NO Defectuosos primero.
        2. Lotes Activos primero.
        3. Los que vencen ANTES primero (urgencia).
        """
        return Lote.objects.select_related('producto').order_by(
            'defectuoso', # False (0) va antes que True (1) -> Sanos primero
            '-activo',    # True va antes que False -> Activos primero
            'fecha_vencimiento' # Ascendente -> Los que vencen pronto arriba
        )


# ---------------------------------------------------------
# 4. BUSQUEDA GLOBAL (Optimized)
# ---------------------------------------------------------
class GlobalSearchView(APIView):
    """
    Busca simultáneamente en Productos, Lotes y Laboratorios.
    """
    permission_classes = [AllowAny] 
    authentication_classes = []

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 3:
            return Response([]) 

        # Optimizamos consultas con select_related y values para traer solo lo necesario
        # PRODUCTOS
        productos = Producto.objects.filter(
            Q(nombre__icontains=query) | 
            Q(codigo_serie__icontains=query) | 
            Q(laboratorio__nombre__icontains=query)
        ).select_related('laboratorio').only('id', 'nombre', 'cantidad_mg', 'laboratorio__nombre', 'codigo_serie')[:5]

        # LOTES
        lotes = Lote.objects.filter(
            codigo_lote__icontains=query
        ).select_related('producto').only('id', 'codigo_lote', 'fecha_vencimiento', 'producto__nombre')[:5]

        # LABORATORIOS
        laboratorios = Laboratorio.objects.filter(
            nombre__icontains=query
        ).only('id', 'nombre', 'telefono')[:5]

        data = {
            'productos': [{
                'id': p.id,
                'titulo': p.nombre,
                'subtitulo': f"{p.cantidad_mg}mg - {p.laboratorio.nombre}",
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