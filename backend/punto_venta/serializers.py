from rest_framework import serializers
from .models import Venta, DetalleVenta
from modulo_principal.serializers import ProductoSerializer # Reutilizamos para mostrar info bonita

class DetalleVentaSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para mostrar info del producto en el recibo/historial
    nombre_producto = serializers.CharField(source='producto.nombre', read_only=True)
    codigo_serie = serializers.CharField(source='producto.codigo_serie', read_only=True)

    class Meta:
        model = DetalleVenta
        fields = [
            'id', 
            'producto', 
            'lote', 
            'cantidad', 
            'precio_unitario', 
            'subtotal', 
            'nombre_producto',
            'codigo_serie'
        ]

class VentaSerializer(serializers.ModelSerializer):
    # Nested Serializer: Incluimos los detalles dentro de la venta
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    
    # Campo extra para mostrar el nombre del vendedor
    vendedor_nombre = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Venta
        fields = [
            'id', 
            'fecha', 
            'total', 
            'metodo_pago', 
            'usuario', 
            'vendedor_nombre', 
            'anulada', 
            'detalles'
        ]
        read_only_fields = ['id', 'fecha', 'total', 'usuario'] 
        # El total y usuario se calcularán/asignarán en el backend, no se confía en el frontend.