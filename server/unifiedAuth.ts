import type { Express } from "express";
import { storage } from "./storage.js";

// Sistema de autenticación unificado - usuario/contraseña para todos
const credentials = {
  // Administrador
  'admin': { password: 'admin123', userId: 'admin_user' },
  // Doctor específico
  '14366756-1': { password: '123', userId: 'doctor_14366756' },
  '14.366.756-1': { password: '123', userId: 'doctor_14366756' }, // Con puntos
  // Doctor Andueza
  '6095009-1': { password: '123', userId: 'doctor_c8941b14-2e68-4399-b480-145f173b90d9' },
  '6.095.009-1': { password: '123', userId: 'doctor_c8941b14-2e68-4399-b480-145f173b90d9' }, // Con puntos
};

export function setupUnifiedAuth(app: Express) {
  
  // Login unificado - tanto admin como doctores
  app.post('/api/unified-login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
      }
      
      console.log(`Unified login attempt: ${username}`);
      
      // Normalizar username (remover puntos para RUTs)
      const normalizedUsername = username.trim().replace(/\./g, '');
      
      // Buscar credenciales
      const cred = credentials[username as keyof typeof credentials] || credentials[normalizedUsername as keyof typeof credentials];
      
      if (!cred || cred.password !== password) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }
      
      // Obtener usuario de la base de datos
      const user = await storage.getUser(cred.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado en sistema' });
      }
      
      // Establecer sesión
      (req.session as any).unifiedUser = cred.userId;
      console.log(`Session set for user: ${cred.userId} (${user.profile})`);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          profile: user.profile,
          email: user.email
        },
        message: 'Login exitoso'
      });
      
    } catch (error) {
      console.error('Unified login error:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });
  
  // Logout unificado
  app.get('/api/unified-logout', (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.clearCookie('medical.sid');
      res.clearCookie('connect.sid');
      res.json({ message: 'Sesión cerrada exitosamente' });
    });
  });

  // También manejar logout legacy - redirigir al login
  app.get('/api/logout', (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.clearCookie('medical.sid');
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
  
  // Verificar usuario actual
  app.get('/api/current-user', async (req, res) => {
    try {
      const userId = (req.session as any)?.unifiedUser;
      console.log(`Current user check: ${userId}`);
      
      if (!userId) {
        return res.status(401).json({ message: 'No hay sesión activa' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Si es doctor, incluir información del doctor
      let doctorInfo = null;
      if (user.profile === 'doctor' && user.doctorId) {
        try {
          doctorInfo = await storage.getDoctorById(user.doctorId);
        } catch (error) {
          console.error('Error fetching doctor info:', error);
        }
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profile: user.profile,
        rut: user.rut,
        doctorInfo: doctorInfo
      });
      
    } catch (error) {
      console.error('Current user error:', error);
      res.status(500).json({ message: 'Error al obtener usuario' });
    }
  });
}