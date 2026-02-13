import uuid
from django.db import models
from django.conf import settings # Para referenciar al usuario
from modulo_principal.models import Producto, Lote # Importamos tus modelos existentes

class Venta(models.Model):
    # Opciones de pago (Extendible a futuro)
    METODOS_PAGO = [
        ('EFECTIVO', 'Efectivo'),
        ('DEBITO', 'Tarjeta Débito'),
        ('CREDITO', 'Tarjeta Crédito'),
        ('TRANSFERENCIA', 'Transferencia'),
    ]

    # Usamos UUID para que el ID de la boleta no sea adivinable (seguridad)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Usuario que realizó la venta (Auditoría)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='ventas_realizadas'
    )
    
    fecha = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # Total calculado de la venta (se guardará al finalizar la transacción)
    total = models.PositiveIntegerField(default=0)
    
    metodo_pago = models.CharField(max_length=20, choices=METODOS_PAGO, default='EFECTIVO')
    
    # Soft Delete: Si se anula una venta, no la borramos, la marcamos.
    anulada = models.BooleanField(default=False)

    def __str__(self):
        return f"Venta {str(self.id)[:8]} - ${self.total}"

    class Meta:
        verbose_name = "Venta"
        verbose_name_plural = "Ventas"
        ordering = ['-fecha']


class DetalleVenta(models.Model):
    venta = models.ForeignKey(
        Venta, 
        on_delete=models.CASCADE, 
        related_name='detalles'
    )
    
    # Referencia al Producto (Para estadísticas de "Qué se vende más")
    producto = models.ForeignKey(
        Producto, 
        on_delete=models.PROTECT,
        related_name='ventas_historicas'
    )
    
    # Referencia al Lote (CRÍTICO: Para saber de dónde descontar stock y FEFO)
    lote = models.ForeignKey(
        Lote,
        on_delete=models.PROTECT,
        related_name='salidas_venta'
    )
    
    cantidad = models.PositiveIntegerField()
    
    # PRECIO CONGELADO: El precio al momento de la venta.
    # Si el producto sube de precio mañana, este registro NO debe cambiar.
    precio_unitario = models.PositiveIntegerField(verbose_name="Precio al momento de venta")
    
    subtotal = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.cantidad}x {self.producto.nombre}"
