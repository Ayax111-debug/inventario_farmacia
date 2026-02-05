import pytest
from .factories import ProductoFactory,LaboratorioFactory,LoteFactory
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
    #Test para el caso perfecto de actualizacion 
    def test_update_producto(self):

        lab = LaboratorioFactory(nombre="Laboratorio_al_que_pertenece")
        producto = ProductoFactory(laboratorio=lab, nombre = "Parecetamol antiguo")
    
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
class TestUpdateLote:
    def test_update_lote(self):

        lote = LoteFactory(codigo_lote="BBB-222-BBB")

        nueva_fecha = date(2026,2, 5)

        lote.codigo_lote = "ZZZ-111-ZZZ"
        lote.fecha_creacion = nueva_fecha

        lote.save()
        lote.refresh_from_db()
        assert lote.codigo_lote is not "BBB-222-BBB"
        assert lote.codigo_lote == "ZZZ-111-ZZZ"
        assert lote.fecha_creacion == nueva_fecha