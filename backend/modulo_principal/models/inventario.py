from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone

#--------------------------------------LABORATORIO-------------------------------
class Laboratorio(models.Model):
    nombre = models.CharField(max_length=150, unique=True, verbose_name="Nombre del Laboratorio")
    direccion = models.CharField(max_length=255, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.nombre
    
    def __init__(self,*args, **kwargs):
        super().__init__(*args,**kwargs)

        self.__original_nombre = self.nombre
    
    def __clean__(self):

        if self.pk:
            errors = {}
            producto_asociados = self.productos.exists()

            if producto_asociados:

                if self.nombre != self.__original_nombre:
                    errors['Laboratorio'] = "Denegado: No puedes cambiar el nombre de un laboratorio con productos asociados"

            if errors:
                raise ValidationError(errors)

    def __save__(self,*args,**kwargs):
        self.full_clean()
        super.save(*args,**kwargs)
    

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
    cantidad_mg = models.PositiveIntegerField(verbose_name="Miligramos (mg)", help_text="Ej: 500 para 500mg")
    cantidad_capsulas = models.PositiveIntegerField(verbose_name="Unidades por Caja", help_text="Ej: 10, 20, 30 comprimidos")
    es_bioequivalente = models.BooleanField(default=False, verbose_name="Es Bioequivalente")
    codigo_serie = models.CharField(max_length=13, unique=True, verbose_name="Código de Barras / SKU")
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
    
    def __init__(self,*args, **kwargs):
        super().__init__(*args, **kwargs)

        self.__original_codigo_serie = self.codigo_serie
        self.__original_cantidad_mg = self.cantidad_mg
        self.__original_cantidad_capsulas = self.cantidad_capsulas
        

    def clean(self):
        if self.pk:
            errors = {}
            tiene_lotes = self.lotes.exists()
           

            if tiene_lotes:
                
                if self.codigo_serie != self.__original_codigo_serie:
                    errors['Producto'] = "Denegado no puedes cambiar el código de serie de un producto con lotes asociados"
                
                if self.cantidad_capsulas != self.__original_cantidad_capsulas:
                    errors['Producto'] = "Denegado no puedes cambiar la cantidad de capsulas de un producto con lotes asociados"
                
                if self.cantidad_mg != self.__original_cantidad_mg:
                    errors['Producto'] = "Denegado no puedes cambiar la cantidad de mg de un producto con lotes asociados"

            if errors:
                raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()

        super().save(*args, **kwargs)


    class Meta:
        verbose_name = "Producto"
        ordering = ['nombre']


#----------------------------------------------------LOTE------------------------------------------
class Lote(models.Model):
    producto = models.ForeignKey(
        Producto, 
        on_delete=models.PROTECT, 
        related_name="lotes" 
    )
    
    codigo_lote = models.CharField(max_length=50, verbose_name="Serie / Lote Fabricante")
    fecha_creacion = models.DateField()
    fecha_vencimiento = models.DateField(db_index=True) 
    # reglas de negocio de cantidad deben ser integradas una vez se desarrolle el modulo de punto de venta
    cantidad = models.PositiveIntegerField(
        validators=[MinValueValidator(0)], 
        verbose_name="Stock Disponible"
    )
    
    defectuoso = models.BooleanField(default=False, help_text="Marcar si el lote tiene alerta sanitaria")
    activo = models.BooleanField(default=True, help_text="Desactiva el lote manualmente si es necesario")

    def __init__(self,*args, **kwargs):
        super().__init__(*args, **kwargs)

        self.__original_producto_id = self.producto_id
        self.__original_codigo_lote = self.codigo_lote
        self.__original_fecha_vencimiento = self.fecha_vencimiento
        self.__original_fecha_creacion = self.fecha_creacion


    def __str__(self):
        return f"Lote {self.codigo_lote} - Vence: {self.fecha_vencimiento}"


    def clean(self):
        super().clean()
        
        if self.pk:
            errors = {}
            

            if self.producto_id != self.__original_producto_id:
                errors['producto'] = "Denegado: No puedes cambiar el producto de un lote asociado"

            if self.codigo_lote != self.__original_codigo_lote:
                errors['lote'] = "Denegado: No puedes cambiar el codigo de un lote con productos asociados"
            
            if self.fecha_creacion != self.__original_fecha_creacion:
                errors['lote'] = "Denegado: No puedes cambiar la fecha de creación de un lote con productos asociados"
            
            if self.fecha_vencimiento != self.__original_fecha_vencimiento:
                errors['lote'] = "Denegado: No puedes cambiar la fecha de vencimiento de un lote con productos asociados"

            if errors:
                raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()

        if self.defectuoso:
            self.activo = False
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ('producto', 'codigo_lote')
        ordering = ['fecha_vencimiento']