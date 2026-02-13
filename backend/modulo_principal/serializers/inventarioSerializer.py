from ..models import Producto,Laboratorio,Lote
from rest_framework import serializers


#-------------------Productos-------------------------


class ProductoSerializer(serializers.ModelSerializer):
    laboratorio_nombre = serializers.CharField(source='laboratorio.nombre',read_only=True)
    
    class Meta:
        model = Producto
        fields = '__all__'

#---------------Lotes---------------------
class LoteSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = Lote
        fields = '__all__'

#---------------Laboratorios--------------

class LaboratorioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Laboratorio
        fields = '__all__'