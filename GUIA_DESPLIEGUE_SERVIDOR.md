# Guía de Despliegue - Portal de Pagos Médicos
## Servidor Ubuntu 22.04.5 LTS

### 1. Preparación del Sistema

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar herramientas básicas
sudo apt install curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release -y
```

### 2. Instalar Node.js 20.x

```bash
# Agregar repositorio de Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js y npm
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 3. Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Iniciar y habilitar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar estado
sudo systemctl status postgresql
```

### 4. Configurar Base de Datos

```bash
# Conectar como usuario postgres
sudo -u postgres psql

# Crear usuario y base de datos (ejecutar dentro de psql)
CREATE USER pagomedicos WITH PASSWORD 'MedicalPass2025!';
CREATE DATABASE medical_payments OWNER pagomedicos;
GRANT ALL PRIVILEGES ON DATABASE medical_payments TO pagomedicos;
ALTER USER pagomedicos CREATEDB;
\q
```

### 5. Instalar PM2 (Gestor de Procesos)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalación
pm2 --version
```

### 6. Configurar Firewall (Opcional pero Recomendado)

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow ssh

# Permitir puerto de la aplicación (5000)
sudo ufw allow 5000

# Permitir HTTP y HTTPS si planeas usar nginx
sudo ufw allow 80
sudo ufw allow 443

# Verificar reglas
sudo ufw status
```

### 7. Clonar y Configurar la Aplicación

```bash
# Ir al directorio de aplicaciones
cd /var/www

# Clonar el repositorio (reemplaza con tu URL real)
sudo git clone https://github.com/tu-usuario/medical-payments-portal.git
cd medical-payments-portal

# Cambiar propietario
sudo chown -R $USER:$USER /var/www/medical-payments-portal

# Instalar dependencias
npm install
```

### 8. Configurar Variables de Entorno

```bash
# Crear archivo de entorno
nano .env
```

Contenido del archivo `.env`:
```env
NODE_ENV=production
DATABASE_URL=postgresql://pagomedicos:MedicalPass2025!@localhost:5432/medical_payments
PGHOST=localhost
PGPORT=5432
PGUSER=pagomedicos
PGPASSWORD=MedicalPass2025!
PGDATABASE=medical_payments

# OpenAI para el asistente (si tienes API key)
OPENAI_API_KEY=tu_openai_api_key_aqui

# Puerto de la aplicación
PORT=5000

# Configuración de sesiones
SESSION_SECRET=tu_session_secret_muy_seguro_aqui
```

### 9. Configurar Base de Datos

```bash
# Ejecutar migraciones de Drizzle
npm run db:push

# Verificar que las tablas se crearon
sudo -u postgres psql -d medical_payments -c "\dt"
```

### 10. Construir la Aplicación

```bash
# Construir el frontend
npm run build

# Verificar que no hay errores
npm run build --verbose
```

### 11. Iniciar con PM2

```bash
# Iniciar la aplicación
pm2 start npm --name "medical-payments" -- run dev

# O si tienes un script de producción:
pm2 start npm --name "medical-payments" -- start

# Configurar PM2 para auto-inicio
pm2 startup
# Ejecutar el comando que te muestre PM2

# Guardar configuración actual
pm2 save

# Verificar estado
pm2 status
pm2 logs medical-payments
```

### 12. Configurar Nginx (Opcional - Proxy Reverso)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/medical-payments
```

Contenido de la configuración de Nginx:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;  # Cambia por tu dominio

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/medical-payments /etc/nginx/sites-enabled/

# Deshabilitar sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 13. Comandos de Administración

```bash
# Ver logs de la aplicación
pm2 logs medical-payments

# Reiniciar aplicación
pm2 restart medical-payments

# Parar aplicación
pm2 stop medical-payments

# Ver estado del sistema
pm2 monit

# Actualizar código
cd /var/www/medical-payments-portal
git pull origin main
npm install
npm run build
pm2 restart medical-payments
```

### 14. Verificación Final

1. **Verificar que la aplicación está corriendo:**
   ```bash
   pm2 status
   curl http://localhost:5000
   ```

2. **Verificar base de datos:**
   ```bash
   sudo -u postgres psql -d medical_payments -c "SELECT version();"
   ```

3. **Verificar logs:**
   ```bash
   pm2 logs medical-payments --lines 50
   ```

### 15. Acceso a la Aplicación

- **Directo:** `http://172.24.34.93:5000`
- **Con Nginx:** `http://tu-dominio.com` o `http://172.24.34.93`

### Solución de Problemas Comunes

1. **Error de permisos de PostgreSQL:**
   ```bash
   sudo -u postgres psql -c "ALTER USER pagomedicos WITH SUPERUSER;"
   ```

2. **Puerto ocupado:**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 PID_DEL_PROCESO
   ```

3. **Problemas de memoria:**
   ```bash
   # Aumentar límite de memoria para Node.js
   pm2 start npm --name "medical-payments" -- run dev --node-args="--max_old_space_size=4096"
   ```

4. **Ver todos los logs del sistema:**
   ```bash
   pm2 logs
   sudo journalctl -u nginx
   sudo journalctl -u postgresql
   ```

¡Listo! Con esta guía puedes desplegar completamente la aplicación en tu servidor Ubuntu.