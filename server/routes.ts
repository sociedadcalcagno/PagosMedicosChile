import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { setupMockAuth } from "./mockAuth";
import { authMiddleware } from "./authMiddleware";
import { honorariosAgent, type AIMessage } from "./openai";
import {
  insertDoctorSchema,
  insertSpecialtySchema,
  insertServiceSchema,
  insertCalculationRuleSchema,
  insertMedicalSocietySchema,
  insertMedicalCenterSchema,
  insertInsuranceTypeSchema,
  insertAgreementTypeSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Always setup session middleware
  const sessionModule = await import("./session");
  sessionModule.setupSession(app);
  
  // Only setup real auth in production, use mock auth in development
  if (process.env.NODE_ENV === "production") {
    await setupAuth(app);
  } else {
    // Setup mock auth for development (multiple user testing)
    setupMockAuth(app);
  }

  // Auth routes - support both real and mock auth
  app.get('/api/auth/user', async (req: any, res) => {
    // Try mock auth first (for development)
    const mockUserId = (req.session as any)?.mockUser;
    if (mockUserId) {
      try {
        const user = await storage.getUser(mockUserId);
        if (user) {
          return res.json(user);
        }
      } catch (error) {
        console.error("Error fetching mock user:", error);
      }
    }

    // Fall back to real auth (only in production)
    if (process.env.NODE_ENV === "production") {
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    } else {
      // In development without mock user
      return res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Link/unlink doctor profile
  app.post('/api/link-doctor', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { doctorId } = req.body;
      await storage.linkUserToDoctor(userId, doctorId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error linking doctor:", error);
      res.status(500).json({ message: "Failed to link doctor profile" });
    }
  });

  app.post('/api/unlink-doctor', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.unlinkUserFromDoctor(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unlinking doctor:", error);
      res.status(500).json({ message: "Failed to unlink doctor profile" });
    }
  });

  app.get('/api/user-doctor', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userDoctor = await storage.getUserDoctor(userId);
      res.json(userDoctor);
    } catch (error) {
      console.error("Error fetching user doctor:", error);
      res.status(500).json({ message: "Failed to fetch user doctor" });
    }
  });

  // AI Agent routes
  app.post('/api/ai/chat', authMiddleware, async (req: any, res) => {
    try {
      const { message, conversationHistory } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get user information and associated doctor profile
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const userDoctor = await storage.getUserDoctor(userId);

      const response = await honorariosAgent.processMessage(message, conversationHistory, user, userDoctor);
      res.json(response);
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Error processing AI request" });
    }
  });

  app.post('/api/ai/analyze-rule', authMiddleware, async (req, res) => {
    try {
      const { rule } = req.body;
      
      if (!rule) {
        return res.status(400).json({ message: "Rule data is required" });
      }

      const response = await honorariosAgent.analyzeCalculationRule(rule);
      res.json(response);
    } catch (error) {
      console.error("Error analyzing rule:", error);
      res.status(500).json({ message: "Error analyzing rule" });
    }
  });

  app.post('/api/ai/suggest-rule', authMiddleware, async (req, res) => {
    try {
      const { context } = req.body;
      
      const response = await honorariosAgent.generateRuleSuggestions(context || {});
      res.json(response);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ message: "Error generating suggestions" });
    }
  });

  // Doctor routes
  app.get('/api/doctors', authMiddleware, async (req, res) => {
    try {
      const { rut, name, specialtyId } = req.query;
      const filters: any = {};
      
      if (rut) filters.rut = rut as string;
      if (name) filters.name = name as string;
      if (specialtyId) filters.specialtyId = specialtyId as string;

      const doctors = await storage.getDoctors(filters);
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.get('/api/doctors/:id', authMiddleware, async (req, res) => {
    try {
      const doctor = await storage.getDoctorById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      console.error("Error fetching doctor:", error);
      res.status(500).json({ message: "Failed to fetch doctor" });
    }
  });

  app.post('/api/doctors', authMiddleware, async (req, res) => {
    try {
      const validatedData = insertDoctorSchema.parse(req.body);
      const doctor = await storage.createDoctor(validatedData);
      res.status(201).json(doctor);
    } catch (error) {
      console.error("Error creating doctor:", error);
      res.status(400).json({ message: "Invalid doctor data", error });
    }
  });

  app.put('/api/doctors/:id', authMiddleware, async (req, res) => {
    try {
      const validatedData = insertDoctorSchema.partial().parse(req.body);
      const doctor = await storage.updateDoctor(req.params.id, validatedData);
      res.json(doctor);
    } catch (error) {
      console.error("Error updating doctor:", error);
      res.status(400).json({ message: "Invalid doctor data", error });
    }
  });

  app.delete('/api/doctors/:id', authMiddleware, async (req, res) => {
    try {
      await storage.deleteDoctor(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      res.status(500).json({ message: "Failed to delete doctor" });
    }
  });

  // Specialty routes
  app.get('/api/specialties', authMiddleware, async (req, res) => {
    try {
      const specialties = await storage.getSpecialties();
      res.json(specialties);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      res.status(500).json({ message: "Failed to fetch specialties" });
    }
  });

  // Medical societies routes
  app.get('/api/medical-societies', authMiddleware, async (req, res) => {
    try {
      const societies = await storage.getMedicalSocieties();
      res.json(societies);
    } catch (error) {
      console.error("Error fetching medical societies:", error);
      res.status(500).json({ message: "Failed to fetch medical societies" });
    }
  });

  app.post('/api/specialties', authMiddleware, async (req, res) => {
    try {
      const validatedData = insertSpecialtySchema.parse(req.body);
      const specialty = await storage.createSpecialty(validatedData);
      res.status(201).json(specialty);
    } catch (error) {
      console.error("Error creating specialty:", error);
      res.status(400).json({ message: "Invalid specialty data", error });
    }
  });

  app.put('/api/specialties/:id', authMiddleware, async (req, res) => {
    try {
      const validatedData = insertSpecialtySchema.partial().parse(req.body);
      const specialty = await storage.updateSpecialty(req.params.id, validatedData);
      res.json(specialty);
    } catch (error) {
      console.error("Error updating specialty:", error);
      res.status(400).json({ message: "Invalid specialty data", error });
    }
  });

  app.delete('/api/specialties/:id', authMiddleware, async (req, res) => {
    try {
      await storage.deleteSpecialty(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting specialty:", error);
      res.status(500).json({ message: "Failed to delete specialty" });
    }
  });

  // Service routes
  app.get('/api/services', authMiddleware, async (req, res) => {
    try {
      const { specialtyId, participationType } = req.query;
      const filters: any = {};
      
      if (specialtyId) filters.specialtyId = specialtyId as string;
      if (participationType) filters.participationType = participationType as string;

      const services = await storage.getServices(filters);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post('/api/services', authMiddleware, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(400).json({ message: "Invalid service data", error });
    }
  });

  app.put('/api/services/:id', authMiddleware, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(req.params.id, validatedData);
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(400).json({ message: "Invalid service data", error });
    }
  });

  app.delete('/api/services/:id', authMiddleware, async (req, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Calculation rule routes
  app.get('/api/calculation-rules', authMiddleware, async (req, res) => {
    try {
      const { code, participationType, specialtyId, isActive } = req.query;
      const filters: any = {};
      
      if (code) filters.code = code as string;
      if (participationType) filters.participationType = participationType as string;
      if (specialtyId) filters.specialtyId = specialtyId as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const rules = await storage.getCalculationRules(filters);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching calculation rules:", error);
      res.status(500).json({ message: "Failed to fetch calculation rules" });
    }
  });

  app.get('/api/calculation-rules/:id', authMiddleware, async (req, res) => {
    try {
      const rule = await storage.getCalculationRuleById(req.params.id);
      if (!rule) {
        return res.status(404).json({ message: "Calculation rule not found" });
      }
      res.json(rule);
    } catch (error) {
      console.error("Error fetching calculation rule:", error);
      res.status(500).json({ message: "Failed to fetch calculation rule" });
    }
  });

  app.post('/api/calculation-rules', authMiddleware, async (req, res) => {
    try {
      const validatedData = insertCalculationRuleSchema.parse(req.body);
      const rule = await storage.createCalculationRule(validatedData);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating calculation rule:", error);
      res.status(400).json({ message: "Invalid calculation rule data", error });
    }
  });

  app.put('/api/calculation-rules/:id', authMiddleware, async (req, res) => {
    try {
      const validatedData = insertCalculationRuleSchema.partial().parse(req.body);
      const rule = await storage.updateCalculationRule(req.params.id, validatedData);
      res.json(rule);
    } catch (error) {
      console.error("Error updating calculation rule:", error);
      res.status(400).json({ message: "Invalid calculation rule data", error });
    }
  });

  app.delete('/api/calculation-rules/:id', authMiddleware, async (req, res) => {
    try {
      await storage.deleteCalculationRule(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting calculation rule:", error);
      res.status(500).json({ message: "Failed to delete calculation rule" });
    }
  });

  // Medical society routes
  app.get('/api/medical-societies', authMiddleware, async (req, res) => {
    try {
      const societies = await storage.getMedicalSocieties();
      res.json(societies);
    } catch (error) {
      console.error("Error fetching medical societies:", error);
      res.status(500).json({ message: "Failed to fetch medical societies" });
    }
  });

  app.post('/api/medical-societies', authMiddleware, async (req, res) => {
    try {
      const validatedData = insertMedicalSocietySchema.parse(req.body);
      const society = await storage.createMedicalSociety(validatedData);
      res.status(201).json(society);
    } catch (error) {
      console.error("Error creating medical society:", error);
      res.status(400).json({ message: "Invalid medical society data", error });
    }
  });

  // Medical center routes
  app.get('/api/medical-centers', authMiddleware, async (req, res) => {
    try {
      const centers = await storage.getMedicalCenters();
      res.json(centers);
    } catch (error) {
      console.error("Error fetching medical centers:", error);
      res.status(500).json({ message: "Failed to fetch medical centers" });
    }
  });

  // Insurance type routes
  app.get('/api/insurance-types', authMiddleware, async (req, res) => {
    try {
      const types = await storage.getInsuranceTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching insurance types:", error);
      res.status(500).json({ message: "Failed to fetch insurance types" });
    }
  });

  // Medical Attentions endpoints
  app.get('/api/medical-attentions', authMiddleware, async (req, res) => {
    try {
      const { doctorId, dateFrom, dateTo, status } = req.query;
      const attentions = await storage.getMedicalAttentions({
        doctorId: doctorId as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        status: status as string,
      });
      res.json(attentions);
    } catch (error) {
      console.error('Medical attentions fetch error:', error);
      res.status(500).json({ error: "Failed to fetch medical attentions" });
    }
  });

  // Payment Calculations endpoints
  app.get('/api/payment-calculations', authMiddleware, async (req, res) => {
    try {
      const { doctorId, month, year, status } = req.query;
      const calculations = await storage.getPaymentCalculations({
        doctorId: doctorId as string,
        month: month ? parseInt(month as string) : undefined,
        year: year ? parseInt(year as string) : undefined,
        status: status as string,
      });
      res.json(calculations);
    } catch (error) {
      console.error('Payment calculations fetch error:', error);
      res.status(500).json({ error: "Failed to fetch payment calculations" });
    }
  });

  app.post('/api/calculate-payments', authMiddleware, async (req, res) => {
    try {
      const { doctorId, month, year } = req.body;
      const calculations = await storage.calculatePayments(doctorId, month, year);
      res.json(calculations);
    } catch (error) {
      console.error('Payment calculation error:', error);
      res.status(500).json({ error: "Failed to calculate payments" });
    }
  });

  // Payments endpoints
  app.get('/api/payments', authMiddleware, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error('Payments fetch error:', error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.post('/api/process-payment', authMiddleware, async (req, res) => {
    try {
      const { doctorId, month, year } = req.body;
      const payment = await storage.processPayment(doctorId, month, year);
      res.json(payment);
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  // Provider Types endpoint
  app.get('/api/provider-types', authMiddleware, async (req, res) => {
    try {
      const providerTypes = await storage.getProviderTypes();
      res.json(providerTypes);
    } catch (error) {
      console.error('Provider types fetch error:', error);
      res.status(500).json({ error: "Failed to fetch provider types" });
    }
  });

  // Agreement type routes
  app.get('/api/agreement-types', authMiddleware, async (req, res) => {
    try {
      const types = await storage.getAgreementTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching agreement types:", error);
      res.status(500).json({ message: "Failed to fetch agreement types" });
    }
  });

  // Payment system routes
  app.get('/api/provider-types', authMiddleware, async (req, res) => {
    try {
      const types = await storage.getProviderTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching provider types:", error);
      res.status(500).json({ message: "Failed to fetch provider types" });
    }
  });

  app.get('/api/service-tariffs', authMiddleware, async (req, res) => {
    try {
      const { serviceId, providerTypeId } = req.query;
      const tariffs = await storage.getServiceTariffs(
        serviceId as string,
        providerTypeId as string
      );
      res.json(tariffs);
    } catch (error) {
      console.error("Error fetching service tariffs:", error);
      res.status(500).json({ message: "Failed to fetch service tariffs" });
    }
  });

  app.get('/api/medical-attentions', authMiddleware, async (req, res) => {
    try {
      const { doctorId, dateFrom, dateTo, status } = req.query;
      const attentions = await storage.getMedicalAttentions({
        doctorId: doctorId as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        status: status as string,
      });
      res.json(attentions);
    } catch (error) {
      console.error("Error fetching medical attentions:", error);
      res.status(500).json({ message: "Failed to fetch medical attentions" });
    }
  });

  app.post('/api/medical-attentions', authMiddleware, async (req, res) => {
    try {
      const attention = await storage.createMedicalAttention(req.body);
      res.status(201).json(attention);
    } catch (error) {
      console.error("Error creating medical attention:", error);
      res.status(400).json({ message: "Invalid attention data", error });
    }
  });

  app.post('/api/calculate-payments', authMiddleware, async (req, res) => {
    try {
      const { doctorId, month, year } = req.body;
      const calculations = await storage.calculatePayments(doctorId, month, year);
      res.json(calculations);
    } catch (error) {
      console.error("Error calculating payments:", error);
      res.status(400).json({ message: "Failed to calculate payments", error });
    }
  });

  app.get('/api/payment-calculations', authMiddleware, async (req, res) => {
    try {
      const { doctorId, month, year, status } = req.query;
      const calculations = await storage.getPaymentCalculations({
        doctorId: doctorId as string,
        month: month ? parseInt(month as string) : undefined,
        year: year ? parseInt(year as string) : undefined,
        status: status as string,
      });
      res.json(calculations);
    } catch (error) {
      console.error("Error fetching payment calculations:", error);
      res.status(500).json({ message: "Failed to fetch payment calculations" });
    }
  });

  app.get('/api/payments', authMiddleware, async (req, res) => {
    try {
      const { doctorId, month, year, status } = req.query;
      const payments = await storage.getPayments({
        doctorId: doctorId as string,
        month: month ? parseInt(month as string) : undefined,
        year: year ? parseInt(year as string) : undefined,
        status: status as string,
      });
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post('/api/process-payment', authMiddleware, async (req, res) => {
    try {
      const { doctorId, month, year } = req.body;
      const payment = await storage.processPayment(doctorId, month, year);
      res.json(payment);
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(400).json({ message: "Failed to process payment", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
