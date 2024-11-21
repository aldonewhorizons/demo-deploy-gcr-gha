# Usa la imagen oficial de Node.js
FROM node:18-slim

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia el package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el código de la aplicación
COPY . .

# Expone el puerto que Cloud Run usará
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
