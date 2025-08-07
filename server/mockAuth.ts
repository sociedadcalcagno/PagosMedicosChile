import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Mock users for development testing
const mockUsers = [
  {
    id: "mock_admin",
    email: "admin@hospital.cl",
    firstName: "Dr. María",
    lastName: "González",
    profileImageUrl: null,
    role: "admin"
  },
  {
    id: "mock_supervisor",
    email: "supervisor@hospital.cl",
    firstName: "Dr. Carlos",
    lastName: "Rodríguez",
    profileImageUrl: null,
    role: "supervisor"
  },
  {
    id: "mock_user",
    email: "usuario@hospital.cl",
    firstName: "Dra. Ana",
    lastName: "López",
    profileImageUrl: null,
    role: "user"
  },
  {
    id: "mock_doctor_carlos",
    email: "cperez@hospital.cl",
    firstName: "Dr. Carlos Alberto",
    lastName: "Pérez Morales",
    profileImageUrl: null,
    role: "user",
    linkedDoctorId: "doc003" // Vinculado al perfil del doctor
  }
];

export function setupMockAuth(app: Express) {
  // Mock login endpoint - shows user selection
  app.get(["/api/mock-login", "/api/login"], (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Seleccionar Usuario de Prueba</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; background: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        .user-card { border: 1px solid #ddd; border-radius: 6px; padding: 20px; margin: 10px 0; cursor: pointer; transition: all 0.2s; }
        .user-card:hover { background: #f8f9fa; border-color: #007bff; }
        .user-name { font-weight: 600; color: #333; }
        .user-email { color: #666; font-size: 14px; }
        .user-role { background: #007bff; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-top: 8px; display: inline-block; }
        .back-btn { color: #666; text-decoration: none; display: inline-block; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <a href="/" class="back-btn">← Volver al inicio</a>
        <h1>Seleccionar Usuario</h1>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
          Portal de Pagos Médicos - Selecciona tu perfil de usuario
        </p>
        ${mockUsers.map(user => `
          <div class="user-card" onclick="window.location.href='/api/mock-login/${user.id}'">
            <div class="user-name">${user.firstName} ${user.lastName}</div>
            <div class="user-email">${user.email}</div>
            <div class="user-role">${user.role}</div>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
    `;
    res.send(html);
  });

  // Mock login with specific user
  app.get("/api/mock-login/:userId", async (req, res) => {
    const userId = req.params.userId;
    const mockUser = mockUsers.find(u => u.id === userId);
    
    if (!mockUser) {
      return res.status(404).send("Usuario no encontrado");
    }

    // Create or update user in database
    await storage.upsertUser({
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      profileImageUrl: mockUser.profileImageUrl,
    });

    // If user has a linked doctor, set up the relationship
    if ((mockUser as any).linkedDoctorId) {
      try {
        await storage.linkUserToDoctor(mockUser.id, (mockUser as any).linkedDoctorId);
      } catch (error) {
        console.error("Error linking doctor profile:", error);
      }
    }

    // Set session
    (req.session as any).mockUser = mockUser.id;
    res.redirect("/");
  });

  // Mock logout
  app.get(["/api/mock-logout", "/api/logout"], (req, res) => {
    (req.session as any).mockUser = null;
    res.redirect("/");
  });

  // Mock auth check middleware
  app.get('/api/auth/mock-user', async (req, res) => {
    const mockUserId = (req.session as any)?.mockUser;
    
    if (!mockUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(mockUserId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching mock user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isMockAuthenticated: RequestHandler = async (req, res, next) => {
  const mockUserId = (req.session as any)?.mockUser;

  if (!mockUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await storage.getUser(mockUserId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  // Add mock user to request
  (req as any).mockUser = { id: mockUserId, claims: { sub: mockUserId } };
  next();
};