# 🏪 Sistema de Inventario + Punto de Venta

Sistema de gestión empresarial completo desarrollado desde cero con **Django REST Framework** y **React + TypeScript**. Cubre el ciclo completo de un negocio: control de inventario con trazabilidad Kardex, punto de venta con sesiones de caja, y dashboards analíticos en tiempo real.

> Proyecto construido con arquitectura en capas real (Models → Services → Serializers → Views), separación total de responsabilidades y buenas prácticas de producción.

---

## ✨ Funcionalidades principales

### 📦 Inventario
- CRUD completo de productos y categorías con búsqueda, filtros y paginación
- Control de stock crítico con alertas automáticas
- Código de barras / SKU único por producto

### 📋 Kardex (trazabilidad de stock)
- **Motor de movimientos atómico**: el stock solo puede modificarse a través de `modificar_stock()`, garantizando integridad total con `@transaction.atomic`
- Registro inmutable de cada movimiento: tipo, cantidad, stock anterior, stock nuevo, usuario y fecha
- Tipos soportados: carga inicial, entrada por compra, salida por venta, devolución, ajustes manuales
- API con filtros por producto, tipo de movimiento y rango de fechas

### 🛒 Punto de Venta (POS)
- Sesiones de caja con apertura/cierre y monto inicial
- Registro de ventas con múltiples métodos de pago (efectivo, débito, crédito, transferencia)
- Anulación de ventas con devolución automática de stock
- Historial completo de ventas por sesión

### 📊 Dashboard Analítico
- Ingresos totales, cantidad de boletas y ticket promedio de la sesión activa
- Top 5 productos más vendidos con ingresos generados
- Gráfico de ventas por hora con zona horaria correcta (`America/Santiago`)
- Vista histórica: cualquier sesión de caja pasada puede consultarse

---

## 🛠️ Stack tecnológico

### Backend
| Tecnología | Uso |
|---|---|
| Django 5 + DRF | API REST principal |
| JWT (SimpleJWT) | Autenticación stateless |
| PostgreSQL 15 | Base de datos principal |
| django-filter | Filtros avanzados en endpoints |
| pytest + factory-boy | Testing con factories |
| Docker + docker-compose | Contenedorización completa |
| GitHub Actions | CI automático en cada push |

### Frontend
| Tecnología | Uso |
|---|---|
| React 19 + TypeScript | UI principal |
| Vite 7 | Build tool |
| Tailwind CSS 4 + shadcn/ui | Sistema de diseño |
| Zustand | State management (carrito, productos) |
| Recharts | Gráficos del dashboard |
| Axios | Cliente HTTP con interceptores JWT |
| React Router v7 | Navegación SPA |

---

## 🏗️ Arquitectura

El backend sigue una arquitectura en capas estricta:

```
Views (HTTP) → Services (lógica de negocio) → Models (datos)
                    ↕
              Serializers (validación y transformación)
```

Cada módulo tiene su propio directorio de servicios, evitando lógica de negocio en las vistas:

```
backend/
├── modulo_principal/        # Inventario y Kardex
│   ├── models/
│   │   ├── inventario.py    # Producto, Categoria + motor de Kardex
│   │   └── kardex.py        # MovimientoKardex (inmutable)
│   ├── services/
│   │   ├── inventarioservices/
│   │   └── kardexservices/
│   ├── serializers/
│   └── views/
└── punto_venta/             # POS y Dashboard
    ├── models.py            # SesionCaja, Venta, DetalleVenta
    └── views/
        ├── cajaViews.py
        ├── ventasViews.py
        └── dashboardViews.py

frontend/src/
├── components/
│   ├── atoms/               # Botones, inputs
│   ├── molecules/           # StatCard, etc.
│   └── organisms/           # Dashboard, Kardex, POS, Tablas
├── hooks/                   # Custom hooks por dominio
├── services/                # Clientes HTTP por entidad
├── store/                   # Zustand stores
├── pages/                   # Vistas principales
└── domain/models/           # Tipos TypeScript
```

---

## 🚀 Levantar el proyecto localmente

### Pre-requisitos
- Docker y docker-compose instalados

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/inventario-punto-venta.git
cd inventario-punto-venta
```

### 2. Crear archivo de variables de entorno
```bash
# backend/.env
SECRET_KEY=tu-secret-key-aqui
DEBUG=True
POSTGRES_DB=farma_db
POSTGRES_USER=ayax
POSTGRES_PASSWORD=tu-password
DB_HOST=db
DB_PORT=5432
```

### 3. Levantar con Docker
```bash
docker-compose up --build
```

### 4. Cargar datos de prueba (opcional)
```bash
docker exec farmacia_backend python manage.py seed_data
# o para simular un año completo de ventas:
docker exec farmacia_backend python manage.py simular_decada
```

### 5. Acceder
| Servicio | URL |
|---|---|
| Frontend React | http://localhost:5173 |
| API Django | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

---

## 📡 Endpoints principales

```
POST   /api/token/              # Login → access + refresh JWT
POST   /api/token/refresh/      # Renovar token

GET    /api/productos/          # Listar con búsqueda y paginación
POST   /api/productos/          # Crear producto
GET    /api/kardex/             # Historial de movimientos (filtrable)

GET    /api/caja/               # Estado de sesión actual
POST   /api/caja/abrir/         # Abrir sesión de caja
POST   /api/caja/cerrar/        # Cerrar sesión
POST   /api/ventas/             # Registrar venta
POST   /api/ventas/{id}/anular/ # Anular venta (devuelve stock)

GET    /api/dashboard/dia/      # Métricas de la sesión activa
GET    /api/dashboard/dia/?sesion_id=<uuid>  # Ver sesión histórica
```

---

## 🧪 Tests

```bash
# Desde el contenedor del backend
docker exec farmacia_backend pytest
```

Los tests usan `factory-boy` para generar datos realistas sin fixtures estáticos.

---

## 💡 Decisiones de diseño destacadas

**Motor de Kardex atómico**: El stock solo puede modificarse a través del método `Producto.modificar_stock()`, que usa `@transaction.atomic`. Esto garantiza que nunca exista un movimiento en Kardex sin su cambio de stock correspondiente, ni viceversa.

**Sesiones de Caja**: Cada venta pertenece a una `SesionCaja`, lo que permite dashboards históricos precisos por sesión, no solo por día.

**Lazy Import en models**: Para evitar imports circulares entre `inventario.py` y `kardex.py`, el import de `MovimientoKardex` se realiza dentro del método, no a nivel de módulo.

**Comandos de simulación**: `simular_decada` genera un año completo de ventas ficticias, útil para probar los gráficos del dashboard con datos realistas.
