import pytest
from .factories import ProductoFactory,LaboratorioFactory,LoteFactory
from django.core.exceptions import ValidationError
from datetime import date

#------------TEST PARA LABORATORIOS-----------------
#decorador para que el test pueda acceder a la base de datos
@pytest.mark.django_db
class TestLaboratorioModel:
    def test_creacion_laboratorio(self):
         
        laboratorio = LaboratorioFactory()

        print(f'El laboratorio es {laboratorio.nombre} y su id es de {laboratorio.id}')

        assert laboratorio.id is not None
        assert isinstance(laboratorio.nombre, str)
        print(f'Laboratorio creado correctamente:{laboratorio.nombre}')

@pytest.mark.django_db
class TestUpdateLaboratorio:
    def test_update_laboratorio(self):

        laboratorio = LaboratorioFactory(nombre="OPKO")
        laboratorio.nombre = "OPKO_NUEVO"

        laboratorio.save()
        laboratorio.refresh_from_db()

        assert laboratorio.nombre == "OPKO_NUEVO"
        


#--------------TEST PARA PRODUCTOS---------------------
#happy path
@pytest.mark.django_db
class TestProductoCreate:
    def test_creacion_producto(self):

        producto = ProductoFactory()
        
        assert producto.laboratorio is not None
        assert producto.id is not None
        assert isinstance(producto.nombre, str)
        print(f"Producto creado: {producto.nombre} - ${producto.precio_venta}")

    def test_cantidad_productos(self):
        ProductoFactory.create_batch(10)
        from ..models import Producto
        
        assert Producto.objects.count() == 10

#happy path
@pytest.mark.django_db
class TestUpdateProducto:
    #Test para el caso ideal de actualizacion en el que no hay lotes asociados al producto
    def test_update_producto_sin_lote(self):

        lab = LaboratorioFactory(nombre="Laboratorio_al_que_pertenece")
        producto = ProductoFactory(laboratorio=lab,codigo_serie = 2222222222222 , nombre = "Parecetamol antiguo", cantidad_capsulas = 150, cantidad_mg = 12)
    
        producto.nombre = "Paracetamol Forte editado"
        producto.precio_venta = 7500
        producto.descripcion = "Prueba de cambio"
        producto.cantidad_mg = 200
        producto.cantidad_capsulas = 200
        producto.codigo_serie = 1111111111111
        producto.activo = 1

        producto.save()

        producto.refresh_from_db()

        assert producto.laboratorio == lab
        assert producto.laboratorio is not None
        assert producto.nombre == "Paracetamol Forte editado"
        assert producto.precio_venta == 7500
        assert producto.descripcion == "Prueba de cambio"
        assert producto.cantidad_mg == 200
        assert producto.cantidad_capsulas == 200
        assert producto.codigo_serie == '1111111111111'
        assert producto.activo == 1

    #test para reglas de negocio / denegar modificicación / producto con lotes asociados 
    def test_update_producto_denegado_con_lote(self):
 
        cantidad_original = 15
        mg_original = 200
        codigo_original = "1122233344123" 
        nombre_original = "Amoxicilina"

        producto = ProductoFactory(cantidad_capsulas = cantidad_original
            , cantidad_mg = mg_original, 
            codigo_serie = codigo_original, nombre = nombre_original )

        LoteFactory(producto=producto)
        assert producto.lotes.exists()

        producto.codigo_serie = "9991117779834"
        producto.cantidad_capsulas = 20
        producto.cantidad_mg = 120
        producto.nombre = "Paracetamol"

        with pytest.raises(ValidationError) as excinfo:
            producto.save()

        assert "Denegado" in str(excinfo.value)

        producto.refresh_from_db()
        assert producto.codigo_serie == codigo_original
        assert producto.cantidad_capsulas == cantidad_original
        assert producto.cantidad_mg == mg_original
        assert producto.nombre != "Paracetamol"





#----------------TEST PARA LOTES------------

#happy path
@pytest.mark.django_db
class TestLoteModel:
    def test_creacion_lote(self):

        lote = LoteFactory(codigo_lote="AAA-111-AAA")


        assert lote.producto is not None
        assert lote.codigo_lote == "AAA-111-AAA"
        assert lote.id is not None
        assert lote.codigo_lote is not None
        print(f"Lote creado correctamente:{lote.codigo_lote}")
    
 
@pytest.mark.django_db
#test caso ideal de actualización sin violar las reglas de negocio
class TestUpdateLote:
    def test_update_lote(self):

        lote = LoteFactory(codigo_lote="BBB-222-BBB",defectuoso=1, activo=1)

        lote.defectuoso = 0
        lote.activo = 0

        lote.save()
        lote.refresh_from_db()
        assert lote.codigo_lote == "BBB-222-BBB"
        assert lote.activo == 0
        assert lote.defectuoso == 0
    

    #test que asegura que no se pueden actualizar ciertos campos de un lote con productos asociados
    def test_update_denegado_lotes(self):
        producto = ProductoFactory(nombre="producto padre")

        codigo_original = "BBB-333-BBB"
        creacion_original = date(2025,2,5)
        vencimiento_original = date(2026,3,8)

        lote = LoteFactory(producto=producto,codigo_lote=codigo_original,fecha_creacion=creacion_original,fecha_vencimiento = vencimiento_original)

        lote.codigo_lote = "AAA-333-AAA"
        lote.fecha_creacion = date(2025,4,2)
        lote.fecha_vencimiento = date(2026,3,12)

        with pytest.raises(ValidationError) as excinfo:
            lote.save()
        
        lote.refresh_from_db()
        assert "Denegado" in str(excinfo)
        assert lote.codigo_lote == codigo_original 
        assert lote.fecha_creacion == creacion_original
        assert lote.fecha_vencimiento == vencimiento_original

