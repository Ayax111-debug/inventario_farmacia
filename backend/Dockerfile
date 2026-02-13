FROM python:3.12-slim

# Evita que Python genere archivos .pyc y buffer de salida (logs instantáneos)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Directorio de trabajo DENTRO del contenedor
WORKDIR /app

# Instalamos dependencias del sistema necesarias para Postgres (psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiamos primero los requerimientos (para aprovechar el caché de Docker)
COPY requirements.txt .

# Instalamos las librerías de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código
COPY . .

# Comando por defecto (aunque docker-compose lo puede sobreescribir)
# OJO: 0.0.0.0 es vital para que Docker exponga el puerto hacia afuera
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]