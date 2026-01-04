from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone


class Laboratorio(models.Model):
    nombre = models.CharField(max_length=150, unique=True, verbose_name="Nombre del Laboratorio")
    direccion = models.CharField(max_length=255, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Laboratorio"
        verbose_name_plural = "Laboratorios"
        ordering = ['nombre']



class Producto(models.Model):
   
    laboratorio = models.ForeignKey(
        Laboratorio, 
        on_delete=models.PROTECT, 
        related_name="productos"
    )
    
    nombre = models.CharField(max_length=200, db_index=True)
    descripcion = models.TextField(blank=True, verbose_name="Componente Activo / Descripción")
    cantidad_mg = models.PositiveIntegerField(verbose_name="Miligramos (mg)", help_text="Ej: 500 para 500mg")
    cantidad_capsulas = models.PositiveIntegerField(verbose_name="Unidades por Caja", help_text="Ej: 10, 20, 30 comprimidos")
    es_bioequivalente = models.BooleanField(default=False, verbose_name="Es Bioequivalente")
    codigo_serie = models.CharField(max_length=100, unique=True, verbose_name="Código de Barras / SKU")
    precio_venta = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)

    @property
    def stock_total(self):
        return self.lotes.filter(
            activo=True, 
            defectuoso=False,
            cantidad__gt=0
        ).aggregate(total=models.Sum('cantidad'))['total'] or 0

    def __str__(self):
        return f"{self.nombre} {self.cantidad_mg}mg - {self.laboratorio.nombre}"

    class Meta:
        verbose_name = "Producto"
        ordering = ['nombre']



class Lote(models.Model):
    producto = models.ForeignKey(
        Producto, 
        on_delete=models.CASCADE, 
        related_name="lotes" 
    )
    
    codigo_lote = models.CharField(max_length=50, verbose_name="Serie / Lote Fabricante")
    fecha_creacion = models.DateField(auto_now_add=True)
    fecha_vencimiento = models.DateField(db_index=True) 
    
    cantidad = models.PositiveIntegerField(
        validators=[MinValueValidator(0)], 
        verbose_name="Stock Disponible"
    )
    
    defectuoso = models.BooleanField(default=False, help_text="Marcar si el lote tiene alerta sanitaria")
    activo = models.BooleanField(default=True, help_text="Desactiva el lote manualmente si es necesario")

    def __str__(self):
        return f"Lote {self.codigo_lote} - Vence: {self.fecha_vencimiento}"

    
    def save(self, *args, **kwargs):
       
        if self.defectuoso:
            self.activo = False
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ('producto', 'codigo_lote')
        ordering = ['fecha_vencimiento']