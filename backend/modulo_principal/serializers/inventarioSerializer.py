from ..models import Producto,Laboratorio,Lote
from rest_framework import serializers


#-------------------Productos-------------------------
class ProductoListadoSerializer(serializers.ModelSerializer):
    laboratorio_nombre = serializers.CharField(source='laboratorio.nombre',read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id',
            'laboratorio',
            'laboratorio_nombre',
            'nombre',
            'es_bioequivalente',
            'precio_venta',
            'activo'
        ]

class ProductoCrearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'

#---------------Lotes---------------------
class LoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lote
        fields = '__all__'

#---------------Laboratorios--------------

class LaboratorioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Laboratorio
        fields = '__all__'