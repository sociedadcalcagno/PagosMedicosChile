# Fix Rápido - Error 401 en Producción

## Problema
La aplicación usa autenticación mock que solo funciona en desarrollo. En producción, las APIs devuelven 401.

## Solución Temporal (Habilitar Mock Auth en Producción)

### En el servidor, edita el archivo de entorno:

```bash
cd /var/www/medical-payments-portal
nano .env
```

**Agrega/modifica estas líneas:**
```env
NODE_ENV=development
# O si prefieres mantener production:
# NODE_ENV=production
# MOCK_AUTH_ENABLED=true
```

### Reinicia la aplicación:
```bash
pm2 restart medical-payments
```

## Solución Permanente (Configurar Auth Real)

### 1. Crear usuarios en base de datos:

```bash
# Conectar a PostgreSQL
sudo -u postgres psql medical_payments

# Crear usuario admin
INSERT INTO users (id, email, name, role, created_at) 
VALUES ('admin', 'admin@hospital.cl', 'Administrador Hospital', 'admin', NOW());

# Crear usuario supervisor  
INSERT INTO users (id, email, name, role, created_at)
VALUES ('supervisor', 'supervisor@hospital.cl', 'Dr. Carlos Rodriguez', 'supervisor', NOW());

# Crear usuario médico
INSERT INTO users (id, email, name, role, created_at)
VALUES ('doctor', 'doctor@hospital.cl', 'Dra. Ana Lopez', 'doctor', NOW());

# Verificar creación
SELECT * FROM users;
\q
```

### 2. Usar login directo en producción:

Puedes acceder directamente a:
- `http://172.24.34.93:5000/api/mock-login/admin` (para admin)
- `http://172.24.34.93:5000/api/mock-login/supervisor` (para supervisor)
- `http://172.24.34.93:5000/api/mock-login/doctor` (para médico)

Después de visitar cualquiera de esas URLs, regresa a `http://172.24.34.93:5000` y ya estarás logueado.

### 3. O usar credenciales en la página de login:

- **Admin:** RUT: `12345678-9`, Contraseña: `admin123`
- **Supervisor:** RUT: `23456789-0`, Contraseña: `supervisor123`
- **Médico:** RUT: `34567890-1`, Contraseña: `doctor123`

## Verificación

Después del fix, las APIs deberían responder 200 en lugar de 401:
- `/api/auth/user` - Debe devolver datos del usuario
- `/api/doctors` - Debe devolver lista de doctores
- `/api/services` - Debe devolver servicios médicos

## Comando para verificar logs:
```bash
pm2 logs medical-payments --lines 20
```