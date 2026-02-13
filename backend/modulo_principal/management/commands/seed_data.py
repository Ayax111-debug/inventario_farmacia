from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
import random
from datetime import timedelta
from django.utils import timezone
# CAMBIA ESTO POR TUS MODELOS REALES
from modulo_principal.models import Laboratorio, Producto, Lote

class Command(BaseCommand):
    help = 'Seed de alto rendimiento (Bulk Create)'

    def handle(self, *args, **kwargs):
        fake = Faker('es_CL')
        self.stdout.write(self.style.WARNING('Iniciando SEED MASIVO (Modo Turbo)...'))

        # Cantidades
        CANT_LABS = 1000       # No necesitas tantos laboratorios
        CANT_PRODS = 50000     # 50k productos
        CANT_LOTES = 150000    # 150k lotes (Total ~200k registros)

        with transaction.atomic():
            # ==========================================
            # 1. LABORATORIOS (Bulk Create)
            # ==========================================
            self.stdout.write(f'Generando {CANT_LABS} laboratorios en memoria...')
            labs_buffer = []
            for _ in range(CANT_LABS):
                labs_buffer.append(
                    Laboratorio(
                        nombre=f"Laboratorio {fake.unique.company()}",
                        direccion=fake.address(),
                        telefono=fake.phone_number()[:15]
                    )
                )
            
            # INSERT MASIVO 1
            Laboratorio.objects.bulk_create(labs_buffer, batch_size=1000)
            self.stdout.write(self.style.SUCCESS('✓ Laboratorios insertados.'))

            # TRUCO PRO: Recuperamos solo los IDs para no llenar la RAM con objetos pesados
            lab_ids = list(Laboratorio.objects.values_list('id', flat=True))

            # ==========================================
            # 2. PRODUCTOS (Bulk Create)
            # ==========================================
            self.stdout.write(f'Generando {CANT_PRODS} productos en memoria...')
            prods_buffer = []
            nombres_medicina = ['Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Clorfenamina', 
                              'Losartán', 'Metformina', 'Omeprazol', 'Salbutamol']

            for _ in range(CANT_PRODS):
                # Asignamos ID directamente para evitar queries extra
                lab_id = random.choice(lab_ids) 
                nombre_prod = f"{random.choice(nombres_medicina)} {fake.last_name()} {random.randint(100,999)}"

                prods_buffer.append(
                    Producto(
                        laboratorio_id=lab_id, # Usamos _id para asignar el entero directo
                        nombre=nombre_prod,
                        descripcion=fake.text(max_nb_chars=60),
                        cantidad_mg=random.choice([10, 50, 100, 500, 1000]),
                        cantidad_capsulas=random.choice([10, 20, 30, 60]),
                        es_bioequivalente=random.choice([True, False]),
                        codigo_serie=fake.ean13(),
                        precio_venta=random.randint(1000, 25000),
                        activo=True
                    )
                )

            # INSERT MASIVO 2
            Producto.objects.bulk_create(prods_buffer, batch_size=5000)
            self.stdout.write(self.style.SUCCESS('✓ Productos insertados.'))

            # Recuperamos IDs de productos
            prod_ids = list(Producto.objects.values_list('id', flat=True))

            # ==========================================
            # 3. LOTES (Bulk Create)
            # ==========================================
            self.stdout.write(f'Generando {CANT_LOTES} lotes en memoria...')
            lotes_buffer = []

            for _ in range(CANT_LOTES):
                prod_id = random.choice(prod_ids)
                fecha_creacion = fake.date_between(start_date='-2y', end_date='today')
                dias_vencimiento = random.randint(365, 1095)
                fecha_vencimiento = fecha_creacion + timedelta(days=dias_vencimiento)

                lotes_buffer.append(
                    Lote(
                        producto_id=prod_id,
                        codigo_lote=f"L-{fake.bothify(text='????-####').upper()}",
                        fecha_creacion=fecha_creacion,
                        fecha_vencimiento=fecha_vencimiento,
                        cantidad=random.randint(50, 5000),
                        defectuoso=random.choice([True, False, False, False]),
                        activo=True
                    )
                )

            # INSERT MASIVO 3 (Aquí es donde Docker suele sufrir si no usas batch_size)
            Lote.objects.bulk_create(lotes_buffer, batch_size=5000)
            self.stdout.write(self.style.SUCCESS('✓ Lotes insertados.'))

        self.stdout.write(self.style.SUCCESS(f'🚀 SEED FINALIZADO: ~{CANT_LABS + CANT_PRODS + CANT_LOTES} registros creados.'))