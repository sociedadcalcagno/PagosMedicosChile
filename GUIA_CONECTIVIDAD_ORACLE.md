# Guía de Conectividad Oracle para Replit

## Problema Identificado
La aplicación Replit no puede conectarse directamente a tu servidor Oracle en `192.168.237.88:1521` porque:
- Replit ejecuta en la nube (internet público)
- Tu Oracle está en una red privada (192.168.x.x)
- No hay conectividad directa entre ambos

## Soluciones Disponibles

### Opción 1: Túnel SSH (Más Seguro)
Crea un túnel SSH para exponer Oracle de forma segura:

```bash
# En tu servidor Oracle o uno con acceso
ssh -R 1521:192.168.237.88:1521 usuario@servidor-publico.com

# Luego usar en Replit:
# Cadena de conexión: servidor-publico.com:1521/PROD
```

### Opción 2: ngrok (Desarrollo)
Instala ngrok en tu red local:

```bash
# Instalar ngrok
# Crear túnel TCP
ngrok tcp 192.168.237.88:1521

# Te dará una URL como: tcp://0.tcp.ngrok.io:12345
# Usar esa dirección en Replit
```

### Opción 3: Oracle Cloud o IP Pública
- Configura tu firewall para permitir conexiones externas al puerto 1521
- Asigna una IP pública a tu servidor Oracle
- **⚠️ IMPORTANTE**: Configura SSL/TLS y autenticación robusta

### Opción 4: VPN corporativa
- Configura Replit para usar VPN de tu empresa
- Requiere configuración de red avanzada

## Alternativa Inmediata: Exportar SQL
Mientras configuras la conectividad, puedes:

1. **Exportar desde Oracle**:
```sql
-- En SQL Developer o SQLPlus
SPOOL /ruta/participacion.csv
SELECT * FROM TMP_REGISTROS_PARTICIPACION;
SPOOL OFF

SPOOL /ruta/hmq.csv  
SELECT * FROM TMP_REGISTROS_HMQ;
SPOOL OFF
```

2. **Usar el sistema de archivos Excel/CSV** que ya funciona

## Configuración Recomendada (Túnel SSH)

1. **En tu servidor con acceso a Oracle**:
```bash
# Crear túnel reverso SSH
ssh -R 1521:192.168.237.88:1521 usuario@servidor-publico

# O túnel local hacia servidor público
ssh -L 1521:192.168.237.88:1521 usuario@servidor-publico
```

2. **En Replit usar**:
- Cadena de conexión: `servidor-publico.com:1521/PROD`
- Usuario: `webindisa` 
- Contraseña: `tu_contraseña`

## Verificación de Conectividad
Antes de usar en Replit, prueba desde línea de comandos:

```bash
# Probar conectividad
telnet servidor-publico.com 1521

# Probar con SQLPlus
sqlplus webindisa/password@servidor-publico.com:1521/PROD
```

## Consideraciones de Seguridad
- ✅ Usar túneles SSH encriptados
- ✅ Autenticación por llaves SSH
- ✅ Limitación de IPs de origen
- ⚠️ Evitar exposición directa del puerto 1521
- ⚠️ Usar credenciales de solo lectura para importación

## Estado Actual
- ❌ Conexión directa bloqueada (192.168.237.88)
- ✅ Sistema de archivos Excel/CSV funcionando
- ✅ Interfaz Oracle implementada y lista
- 🔄 Esperando configuración de túnel o IP pública