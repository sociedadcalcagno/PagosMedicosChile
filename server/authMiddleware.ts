import type { RequestHandler } from "express";
import { storage } from "./storage";

export const authMiddleware: RequestHandler = async (req: any, res, next) => {
  try {
    // Try mock auth first (for development)
    const mockUserId = (req.session as any)?.mockUser;
    if (mockUserId) {
      const user = await storage.getUser(mockUserId);
      if (user) {
        // Add mock user data to request object for compatibility
        req.user = { claims: { sub: mockUserId } };
        req.mockUser = { id: mockUserId };
        return next();
      }
    }

    // Fall back to real auth (only in production)
    if (process.env.NODE_ENV === "production") {
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      return next();
    }

    // In development without mock user
    return res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};