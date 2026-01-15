# Usamos Node versión ligera
FROM node:22-alpine

# Directorio de trabajo
WORKDIR /app

# Copiamos package.json y package-lock.json primero
COPY package.json package-lock.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de Vite (por defecto 5173)
EXPOSE 5173

# Comando de arranque. 
# IMPORTANTE: '-- --host' le dice a Vite que acepte conexiones externas (Docker)
CMD ["npm", "run", "dev", "--", "--host"]