from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError, PermissionDenied
from django.db import transaction

#--------------------------------------LABORATORIO-------------------------------
class Laboratorio(models.Model):
    nombre = models.CharField(max_length=150, unique=True, verbose_name="Nombre del Laboratorio")
    direccion = models.CharField(max_length=255, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.nombre
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_nombre = self.nombre 
    
    def clean(self):
        if self.pk:
            # Validación: No cambiar nombre si hay productos vinculados
            if self.productos.exists() and self.nombre != self._original_nombre:
                raise ValidationError({'nombre': "Denegado: No puedes cambiar el nombre de un laboratorio con productos asociados"})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Laboratorio"
        verbose_name_plural = "Laboratorios"
        ordering = ['nombre']


#--------------------------------------PRODUCTO--------------------------------------
class Producto(models.Model):
    laboratorio = models.ForeignKey(
        Laboratorio, 
        on_delete=models.PROTECT, 
        related_name="productos"
    )
    
    nombre = models.CharField(max_length=200, db_index=True)
    descripcion = models.TextField(blank=True, verbose_name="Componente Activo / Descripción")
    cantidad_mg = models.PositiveIntegerField(verbose_name="Miligramos (mg)")
    cantidad_capsulas = models.PositiveIntegerField(verbose_name="Unidades por Caja")
    es_bioequivalente = models.BooleanField(default=False, verbose_name="Es Bioequivalente")
    codigo_serie = models.CharField(max_length=13, unique=True, verbose_name="Código de Barras / SKU")
    precio_venta = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)

    @property
    def stock_total(self):
        # Solo sumamos lotes activos y no defectuosos
        return self.lotes.filter(
            activo=True, 
            defectuoso=False
        ).aggregate(total=models.Sum('cantidad'))['total'] or 0
    
    def __str__(self):
        return f"{self.nombre} {self.cantidad_mg}mg"
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_codigo_serie = self.codigo_serie
        self._original_cantidad_mg = self.cantidad_mg
        self._original_cantidad_capsulas = self.cantidad_capsulas
        
    def clean(self):
        if self.pk and self.lotes.exists():
            errors = {}
            if self.codigo_serie != self._original_codigo_serie:
                errors['codigo_serie'] = "Denegado: Producto con lotes asociados."
            if self.cantidad_capsulas != self._original_cantidad_capsulas:
                errors['cantidad_capsulas'] = "Denegado: Producto con lotes asociados."
            if self.cantidad_mg != self._original_cantidad_mg:
                errors['cantidad_mg'] = "Denegado: Producto con lotes asociados."
            
            if errors:
                raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def actualizar_estado_basado_en_stock(self):
        """
        Regla de Negocio: Si el producto se queda sin stock real en todos sus lotes,
        se desactiva automáticamente. Si recupera stock, se activa.
        """
        tiene_stock = self.lotes.filter(activo=True, cantidad__gt=0).exists()
        
        stock_changed = False
        if not tiene_stock and self.activo:
            self.activo = False
            stock_changed = True
        elif tiene_stock and not self.activo:
            self.activo = True
            stock_changed = True
        
        if stock_changed:
            # Guardamos solo el campo activo para evitar recursión infinita o validaciones pesadas
            self.save(update_fields=['activo'])

    class Meta:
        verbose_name = "Producto"
        ordering = ['nombre']


#----------------------------------------------------LOTE------------------------------------------
class LoteManager(models.Manager):
    def delete(self):
        raise PermissionDenied("Borrado masivo deshabilitado por integridad de datos.")

class Lote(models.Model):
    # Producto OBLIGATORIO (null=False por defecto)
    producto = models.ForeignKey(
        Producto, 
        on_delete=models.PROTECT, 
        related_name="lotes" 
    )
    
    codigo_lote = models.CharField(max_length=50, verbose_name="Serie / Lote Fabricante")
    fecha_creacion = models.DateField()
    fecha_vencimiento = models.DateField(db_index=True) 
    cantidad = models.PositiveIntegerField(
        validators=[MinValueValidator(0)], 
        verbose_name="Stock Disponible"
    )
    
    defectuoso = models.BooleanField(default=False, help_text="Lote con alerta sanitaria")
    activo = models.BooleanField(default=True, help_text="Estado del lote")

    objects = LoteManager()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_producto_id = self.producto_id
        self._original_codigo_lote = self.codigo_lote
        self._original_fecha_creacion = self.fecha_creacion
        self._original_fecha_vencimiento = self.fecha_vencimiento

    def __str__(self):
        return f"Lote {self.codigo_lote}"

    def clean(self):
        if self.pk:
            errors = {}
            # Validaciones de inmutabilidad
            if self.producto_id != self._original_producto_id:
                errors['producto_id'] = "Denegado: No puedes cambiar el producto."
            if self.codigo_lote != self._original_codigo_lote:
                errors['codigo_lote'] = "Denegado: No puedes cambiar el código de lote."
            if self.fecha_creacion != self._original_fecha_creacion:
                errors['fecha_creacion'] = "Denegado: No puedes cambiar la fecha de creación."
            if self.fecha_vencimiento != self._original_fecha_vencimiento:
                errors['fecha_vencimiento'] = "Denegado: No puedes cambiar la fecha de vencimiento."
       

            if errors:
                raise ValidationError(errors)

    def save(self, *args, **kwargs):
        # 1. Ejecutar validaciones estándar
        self.full_clean()

        # 2. REGLA DE NEGOCIO: Auto-desactivación
        # Si no hay stock O está defectuoso -> Se desactiva
        if self.cantidad == 0 or self.defectuoso:
            self.activo = False
        
        # 3. Guardar el Lote primero
        super().save(*args, **kwargs)

        # 4. REGLA DE NEGOCIO (Trigger): Actualizar al padre (Producto)
        # Usamos atomicidad por si algo falla, no quede inconsistente
        try:
            self.producto.actualizar_estado_basado_en_stock()
        except Exception as e:
            # Loggear error pero no detener el guardado del lote si no es crítico
            print(f"Error actualizando estado del producto: {e}")

    def delete(self, *args, **kwargs):
        """
        Solo permite borrar si es un error de digitación (Stock 0).
        Si tiene stock, obliga a usar desactivación.
        """
        # Si tiene stock, es sagrado.
        if self.cantidad > 0:
             raise PermissionDenied(
                f"PROTECCIÓN DE STOCK: El lote {self.codigo_lote} tiene {self.cantidad} unidades. "
                "No se puede eliminar. Ajusta el stock a 0 o desactívalo."
            )
        
        # Si la cantidad es 0, asumimos que es un registro basura o vacío y permitimos borrar.
        super().delete(*args, **kwargs)

    class Meta:
        unique_together = ('producto', 'codigo_lote')
        ordering = ['fecha_vencimiento']