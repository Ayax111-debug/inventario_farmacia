import factory
from faker import Factory as FakerFactory
from ..models import Producto,Laboratorio,Lote

faker = FakerFactory.create()

class LaboratorioFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Laboratorio

    nombre = factory.LazyAttribute(lambda x: faker.word())



class ProductoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Producto

    laboratorio = factory.SubFactory(LaboratorioFactory)
    nombre = factory.LazyAttribute(lambda x: faker.word())
    precio_venta = factory.LazyAttribute(lambda x: faker.random_int(min=1000, max=10000))
    descripcion = factory.LazyAttribute(lambda x: faker.sentence())
    cantidad_mg = factory.LazyAttribute(lambda x:faker.random_int(min=50,max=400,step=1))
    cantidad_capsulas = factory.LazyAttribute(lambda x: faker.random_int(min=10,max=30,step=1))
    codigo_serie = factory.Sequence(lambda n: f"789{n:010d}")
    activo = factory.LazyAttribute(lambda x: faker.pybool())
  

class LoteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Lote
    
    producto = factory.SubFactory(ProductoFactory)
    codigo_lote = factory.LazyAttribute(lambda x: faker.bothify('###-??-###-??') )
    fecha_creacion = factory.LazyAttribute(lambda x: faker.date_object())
    fecha_vencimiento = factory.LazyAttribute(lambda x: faker.date_object())
    cantidad = factory.LazyAttribute(lambda x: faker.random_int(min=0, max=450, step=1))
    defectuoso = factory.LazyAttribute(lambda x: faker.pybool())
    activo = factory.LazyAttribute(lambda x: faker.pybool())