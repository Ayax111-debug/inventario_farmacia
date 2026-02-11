import pytest
from django.core.exceptions import ValidationError, PermissionDenied
from datetime import date, timedelta
from .factories import LaboratorioFactory, ProductoFactory, LoteFactory
from django.utils import timezone
from django.db import models
# ==============================================================================
# 1. TESTS DE LABORATORIO
# ==============================================================================

@pytest.mark.django_db
class TestLaboratorio:
    
    def test_create_laboratorio_happy_path(self):
        """Valida que se pueda crear un laboratorio correctamente."""
        lab = LaboratorioFactory(nombre="Bayer")
        assert lab.id is not None
        assert str(lab) == "Bayer"

    def test_update_laboratorio_nombre_sin_productos(self):
        """Valida cambiar el nombre si NO tiene productos asociados."""
        lab = LaboratorioFactory(nombre="Pfizer")
        lab.nombre = "Pfizer Updated"
        lab.save()
        lab.refresh_from_db()
        assert lab.nombre == "Pfizer Updated"

    def test_update_laboratorio_nombre_con_productos_fails(self):
        """REGLA DE NEGOCIO: No se puede cambiar nombre si tiene productos."""
        lab = LaboratorioFactory(nombre="Moderna")
        ProductoFactory(laboratorio=lab) # Asociamos producto
        
        lab.nombre = "Moderna Changed"
        with pytest.raises(ValidationError) as exc:
            lab.save()
        
        assert 'nombre' in exc.value.message_dict
        assert "Denegado" in exc.value.message_dict['nombre'][0]


# ==============================================================================
# 2. TESTS DE PRODUCTO
# ==============================================================================

@pytest.mark.django_db
class TestProducto:

    def test_create_producto_happy_path(self):
        """Valida creación básica."""
        prod = ProductoFactory(cantidad_mg=500, activo=True)
        assert prod.id is not None
        assert prod.laboratorio is not None
        assert prod.stock_total == 0 # Nace sin lotes

    def test_update_producto_campos_permitidos(self):
        """Valida actualización de precio y descripción (campos libres)."""
        prod = ProductoFactory(precio_venta=1000)
        prod.precio_venta = 1500
        prod.descripcion = "Nueva descripción"
        prod.save()
        prod.refresh_from_db()
        assert prod.precio_venta == 1500
        assert prod.descripcion == "Nueva descripción"

    def test_update_producto_campos_protegidos_fails(self):
        """REGLA DE NEGOCIO: Inmutabilidad de campos críticos con lotes asociados."""
        prod = ProductoFactory(
            codigo_serie="123456789", 
            cantidad_mg=500, 
            cantidad_capsulas=10
        )
        LoteFactory(producto=prod) # Creamos la dependencia

        # Intentamos cambiar SKU
        prod.codigo_serie = "999999999"
        with pytest.raises(ValidationError) as exc:
            prod.save()
        assert 'codigo_serie' in exc.value.message_dict

        # Restauramos y probamos cambiar mg
        prod.refresh_from_db()
        prod.cantidad_mg = 1000
        with pytest.raises(ValidationError) as exc:
            prod.save()
        assert 'cantidad_mg' in exc.value.message_dict

    def test_producto_stock_total_property(self):
        """Valida que la propiedad stock_total sume solo lotes activos y buenos."""
        prod = ProductoFactory()
        # Lote 1: Activo y Bueno (Suma)
        LoteFactory(producto=prod, cantidad=10, activo=True, defectuoso=False)
        # Lote 2: Inactivo (No suma)
        LoteFactory(producto=prod, cantidad=5, activo=False, defectuoso=False)
        # Lote 3: Defectuoso (No suma, aunque el modelo lo desactiva, forzamos lógica)
        lote_def = LoteFactory(producto=prod, cantidad=5, defectuoso=True)
        
        assert prod.stock_total == 10
    
    @property
    def stock_total(self):
        hoy = timezone.now().date()
        
        # Filtramos: Activos + No Defectuosos + Fecha Vencimiento >= Hoy
        return self.lotes.filter(
            activo=True, 
            defectuoso=False,
            fecha_vencimiento__gte=hoy  # __gte = Greater than or equal (Mayor o igual)
        ).aggregate(total=models.Sum('cantidad'))['total'] or 0


# ==============================================================================
# 3. TESTS DE LOTE
# ==============================================================================

@pytest.mark.django_db
class TestLote:

    def test_create_lote_happy_path(self):
        # Forzamos defectuoso=False para asegurar que la regla de negocio 
        # no nos desactive el lote automáticamente.
        lote = LoteFactory(cantidad=100, defectuoso=False) 
        
        assert lote.id is not None
        assert lote.activo is True

    def test_update_lote_campos_protegidos_fails(self):
        """REGLA DE NEGOCIO: No cambiar fechas ni código si ya existe."""
        fecha_orig = date(2025, 1, 1)
        lote = LoteFactory(fecha_creacion=fecha_orig)
        
        lote.fecha_creacion = date(2026, 1, 1)
        with pytest.raises(ValidationError) as exc:
            lote.save()
        assert 'fecha_creacion' in exc.value.message_dict

    def test_lote_auto_desactivacion_por_stock_cero(self):
        """REGLA DE NEGOCIO: Si cantidad baja a 0, activo pasa a False."""
        lote = LoteFactory(cantidad=10, activo=True)
        
        lote.cantidad = 0
        lote.save()
        lote.refresh_from_db()
        
        assert lote.activo is False

    def test_lote_auto_desactivacion_por_defectuoso(self):
        """REGLA DE NEGOCIO: Si es defectuoso, activo pasa a False."""
        lote = LoteFactory(cantidad=10, activo=True, defectuoso=False)
        
        lote.defectuoso = True
        lote.save()
        lote.refresh_from_db()
        
        assert lote.activo is False

    def test_delete_lote_con_stock_fails(self):
        """SEGURIDAD: No borrar lote con stock (integridad financiera)."""
        lote = LoteFactory(cantidad=5)
        with pytest.raises(PermissionDenied) as exc:
            lote.delete()
        assert "PROTECCIÓN DE STOCK" in str(exc.value)

    def test_delete_lote_sin_stock_success(self):
        """UX: Permitir borrar lote vacío (error de digitación)."""
        lote = LoteFactory(cantidad=0)
        lote_id = lote.id
        lote.delete()
        
        # Verificar que ya no existe en BD
        from ..models import Lote
        assert not Lote.objects.filter(id=lote_id).exists()


# ==============================================================================
# 4. TESTS DE INTEGRACIÓN (CASCADA) - EL QUE PEDISTE ESPECÍFICAMENTE
# ==============================================================================

@pytest.mark.django_db
class TestIntegracionCascada:

    def test_desactivacion_cascada_producto_lotes(self):
        """
        ESCENARIO COMPLEJO: Integridad de Stock y Estados.
        """
        # Importamos fechas para asegurar vigencia
        from django.utils import timezone
        from datetime import timedelta
        
        # Fecha futura segura (para que no estén vencidos)
        futuro = timezone.now().date() + timedelta(days=365)

        # 1. Crear producto (Activo)
        prod = ProductoFactory(activo=True)

        # 2. Crear lotes EXPLÍCITAMENTE VÁLIDOS
        # Lote A: 10 unidades, Sano, Vigente
        lote_a = LoteFactory(
            producto=prod, 
            cantidad=10, 
            codigo_lote="LOTE-A",
            activo=True,
            defectuoso=False,
            fecha_vencimiento=futuro 
        )
        
        # Lote B: 20 unidades, Sano, Vigente
        lote_b = LoteFactory(
            producto=prod, 
            cantidad=20, 
            codigo_lote="LOTE-B",
            activo=True,
            defectuoso=False,
            fecha_vencimiento=futuro
        )

        prod.refresh_from_db()
        
        # AHORA SÍ: 10 + 20 = 30
        assert prod.activo is True
        assert prod.stock_total == 30 

        # 3. Lote A baja a 0 -> Se desactiva Lote A.
        lote_a.cantidad = 0
        lote_a.save() # Dispara triggers
        
        lote_a.refresh_from_db()
        prod.refresh_from_db()
        
        assert lote_a.activo is False       # Lote desactivado por regla de negocio
        assert prod.activo is True          # Producto sigue activo (le queda Lote B)
        assert prod.stock_total == 20       # 0 + 20 = 20

        # 4. Lote B baja a 0 -> Se desactiva Lote B.
        lote_b.cantidad = 0
        lote_b.save()

        lote_b.refresh_from_db()
        prod.refresh_from_db()

        assert lote_b.activo is False       # Lote desactivado
        assert prod.stock_total == 0        # 0 + 0 = 0
        assert prod.activo is False         # ¡ÉXITO! Producto desactivado automáticamente

        # 5. Revivir stock
        lote_a.cantidad = 50
        # Forzamos activación manual porque tu save() actual solo desactiva, no reactiva automáticamente el lote
        # (eso requeriría otra lógica en el save, pero para el test lo hacemos manual)
        lote_a.activo = True 
        lote_a.save() 

        prod.refresh_from_db()
        assert prod.activo is True