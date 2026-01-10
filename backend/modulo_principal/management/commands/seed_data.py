from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
import random
from datetime import timedelta
from django.utils import timezone

# IMPORTA TUS MODELOS AQUÍ (Ajusta la ruta según tu proyecto)
from ...models import Laboratorio, Producto, Lote
# Si tus modelos están en 'gestion.models', sería: from gestion.models import ...

class Command(BaseCommand):
    help = 'Puebla la base de datos con datos de prueba aleatorios (Seeding)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Iniciando proceso de Seeding...'))
        
        fake = Faker('es_CL') # Usamos localización de Chile para RUTs, nombres, etc.

        # Usamos atomic para que si algo falla, no se guarde NADA (Todo o Nada)
        try:
            with transaction.atomic():
                
                # ==========================================
                # 1. CREAR LABORATORIOS (50)
                # ==========================================
                self.stdout.write('Creando Laboratorios...')
                labs_creados = []
                for _ in range(50):
                    lab = Laboratorio.objects.create(
                        nombre=f"Laboratorio {fake.company()}",
                        direccion=fake.address(),
                        telefono=fake.phone_number()[:15], # Cortamos por si es muy largo
                    )
                    labs_creados.append(lab)
                
                self.stdout.write(self.style.SUCCESS(f'✓ {len(labs_creados)} Laboratorios creados.'))

                # ==========================================
                # 2. CREAR PRODUCTOS (50)
                # ==========================================
                self.stdout.write('Creando Productos...')
                productos_creados = []
                nombres_medicina = ['Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Clorfenamina', 'Losartán', 'Metformina', 'Omeprazol', 'Salbutamol']
                
                for _ in range(50):
                    # Elegimos un laboratorio al azar (FK)
                    lab_random = random.choice(labs_creados)
                    
                    nombre_prod = f"{random.choice(nombres_medicina)} {fake.last_name()} Forte"
                    
                    prod = Producto.objects.create(
                        laboratorio=lab_random, # Relación FK
                        nombre=nombre_prod,
                        descripcion=fake.text(max_nb_chars=100),
                        cantidad_mg=random.choice([10, 50, 100, 500, 1000]),
                        cantidad_capsulas=random.choice([10, 20, 30, 60]),
                        es_bioequivalente=random.choice([True, False]),
                        codigo_serie=fake.ean13(), # Genera un código de barras real
                        precio_venta=random.randint(1000, 25000),
                        activo=True
                    )
                    productos_creados.append(prod)

                self.stdout.write(self.style.SUCCESS(f'✓ {len(productos_creados)} Productos creados.'))

                # ==========================================
                # 3. CREAR LOTES (50)
                # ==========================================
                self.stdout.write('Creando Lotes...')
                lotes_creados = []
                
                for _ in range(50):
                    # Elegimos un producto al azar (FK)
                    prod_random = random.choice(productos_creados)
                    
                    # Lógica de Fechas Coherente
                    fecha_creacion = fake.date_between(start_date='-2y', end_date='today')
                    # El vencimiento debe ser FUTURO respecto a la creación (ej. entre 1 y 3 años después)
                    dias_vencimiento = random.randint(365, 1095) 
                    fecha_vencimiento = fecha_creacion + timedelta(days=dias_vencimiento)

                    lote = Lote.objects.create(
                        producto=prod_random, # Relación FK
                        codigo_lote=f"L-{fake.bothify(text='????-####').upper()}", # Ej: L-ABSD-1234
                        fecha_creacion=fecha_creacion,
                        fecha_vencimiento=fecha_vencimiento,
                        cantidad=random.randint(50, 5000),
                        defectuoso=random.choice([True, False, False, False]), # 25% prob de ser defectuoso
                        activo=True
                    )
                    lotes_creados.append(lote)

                self.stdout.write(self.style.SUCCESS(f'✓ {len(lotes_creados)} Lotes creados.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error durante el seeding: {str(e)}'))
            # Gracias a transaction.atomic, aquí se deshace todo automáticamente
            return

        self.stdout.write(self.style.SUCCESS('--------------------------------------'))
        self.stdout.write(self.style.SUCCESS('¡SEEDING COMPLETADO EXITOSAMENTE! 🚀'))
        self.stdout.write(self.style.SUCCESS('--------------------------------------'))