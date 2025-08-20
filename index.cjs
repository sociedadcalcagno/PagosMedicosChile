/**
 * Aplicación principal - Convenios + Motor de Cálculo
 * Stack: Node.js + Express + Knex + PostgreSQL
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const knex = require('knex');
const knexConfig = require('./knexfile.cjs')[process.env.NODE_ENV || 'development'];

// Importar rutas
const { router: conveniosRouter, initDB: initConveniosDB } = require('./src/routes/convenios.routes.cjs');
const { router: simuladorRouter, initDB: initSimuladorDB } = require('./src/routes/simulador.routes.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos de la UI
app.use(express.static(path.join(__dirname, 'src/ui')));

// Inicializar conexión a la base de datos
const db = knex(knexConfig);

// Inicializar conexiones en los routers
initConveniosDB(db);
initSimuladorDB(db);

// Configurar rutas de la API
app.use('/api/convenios', conveniosRouter);
app.use('/api/simular', simuladorRouter);

// Ruta principal - servir la UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/ui/index.html'));
});

// Ruta de salud del sistema
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await db.raw('SELECT 1');
    
    // Contar convenios activos
    const conveniosActivos = await db('convenios').where('estado', true).count('id as count').first();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      convenios_activos: parseInt(conveniosActivos.count),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path
  });
});

// Función para verificar y ejecutar migraciones
async function verificarBaseDatos() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await db.raw('SELECT 1');
    console.log('✅ Conexión a PostgreSQL exitosa');

    // Verificar si existen las tablas principales
    const hasConvenios = await db.schema.hasTable('convenios');
    
    if (!hasConvenios) {
      console.log('📋 Las tablas no existen. Ejecute: npm run setup');
      console.log('   Esto ejecutará las migraciones y cargará los datos iniciales.');
    } else {
      const conveniosCount = await db('convenios').count('id as count').first();
      console.log(`📊 Base de datos lista. Convenios disponibles: ${conveniosCount.count}`);
    }
    
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    console.log('💡 Verifique que:');
    console.log('   1. PostgreSQL esté ejecutándose');
    console.log('   2. DATABASE_URL esté configurada en .env');
    console.log('   3. Las credenciales sean correctas');
    
    // No detener el servidor, pero mostrar advertencia
    console.log('⚠️  El servidor iniciará, pero las funcionalidades de BD no estarán disponibles');
  }
}

// Función de inicio del servidor
async function iniciarServidor() {
  await verificarBaseDatos();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🚀 ============================================');
    console.log(`🏥 Simulador de Convenios Médicos`);
    console.log(`📍 Servidor ejecutándose en: http://localhost:${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log('============================================');
    console.log('\n📋 Endpoints disponibles:');
    console.log(`   🏠 UI Principal:           http://localhost:${PORT}/`);
    console.log(`   💚 Health Check:          http://localhost:${PORT}/health`);
    console.log(`   📄 API Convenios:         http://localhost:${PORT}/api/convenios`);
    console.log(`   🎯 API Simulador:         http://localhost:${PORT}/api/simular`);
    console.log(`   📋 Ejemplo Madre+Bebé:    http://localhost:${PORT}/api/simular/ejemplo`);
    console.log('\n💡 Para configurar la BD:');
    console.log('   npm run migrate  # Crear tablas');
    console.log('   npm run seed     # Cargar datos de ejemplo');
    console.log('   npm run setup    # Ambos en un comando');
    console.log('\n✨ ¡Sistema listo para simular convenios!');
  });
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  try {
    await db.destroy();
    console.log('✅ Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('Error al cerrar la conexión:', error);
  }
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promise rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar el servidor
iniciarServidor().catch(error => {
  console.error('💥 Error al iniciar el servidor:', error);
  process.exit(1);
});

module.exports = app;