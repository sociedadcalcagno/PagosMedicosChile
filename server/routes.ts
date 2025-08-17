import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { setupUnifiedAuth } from "./unifiedAuth";
import { authMiddleware } from "./authMiddleware";
import { honorariosAgent, type AIMessage } from "./openai";
import { generateManualPDF } from "./pdfGenerator";
import {
  insertDoctorSchema,
  insertSpecialtySchema,
  insertServiceSchema,
  insertCalculationRuleSchema,
  insertMedicalSocietySchema,
  insertMedicalCenterSchema,
  insertInsuranceTypeSchema,
  insertAgreementTypeSchema,
  medicalAttentions,
  paymentCalculations,
} from "@shared/schema";
import { db } from "./db";
import { and, eq, gte, lte, desc, asc, inArray, sql, like, ilike } from "drizzle-orm";
import * as XLSX from 'xlsx';

export async function registerRoutes(app: Express): Promise<Server> {
  // Always setup session middleware
  const sessionModule = await import("./session");
  await sessionModule.setupSession(app);
  
  // Setup unified authentication (username/password for all users)
  setupUnifiedAuth(app);

  // Auth routes - support both real and mock auth
  app.get('/api/auth/user', async (req: any, res) => {
    // Try mock auth first (for development)
    const mockUserId = (req.session as any)?.mockUser;
    console.log(`Auth check - Session mockUser: ${mockUserId}`);
    
    if (mockUserId) {
      try {
        const user = await storage.getUser(mockUserId);
        console.log(`Auth check - User found: ${user ? user.id : 'not found'}`);
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
      if ((error as any).name === 'ZodError') {
        console.error("Validation errors:", (error as any).issues);
        res.status(400).json({ 
          message: "Invalid calculation rule data", 
          validationErrors: (error as any).issues 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to update calculation rule", 
          error: (error as any).message 
        });
      }
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
      const { doctorId, dateFrom, dateTo, status, participationTypes, showOnlyPending } = req.query;
      const filters: any = {};
      
      if (doctorId) filters.doctorId = doctorId as string;
      if (dateFrom) filters.dateFrom = dateFrom as string;
      if (dateTo) filters.dateTo = dateTo as string;
      if (status) filters.status = status as string;
      if (participationTypes) {
        filters.recordTypes = (participationTypes as string).split(',');
      }
      
      // Apply pending filter when requested
      if (showOnlyPending === 'true') {
        filters.status = 'pending';
      }
      
      const attentions = await storage.getMedicalAttentions(filters);
      res.json(attentions);
    } catch (error) {
      console.error('Medical attentions fetch error:', error);
      res.status(500).json({ error: "Failed to fetch medical attentions" });
    }
  });

  // Borrar atenciones médicas no procesadas (estado: pendiente)
  app.delete('/api/medical-attentions/delete-unprocessed', authMiddleware, async (req, res) => {
    try {
      const { recordType } = req.body;
      
      const result = await storage.deleteUnprocessedAttentions(recordType);
      
      res.json({
        deletedCount: result.deletedCount,
        message: `Se eliminaron ${result.deletedCount} atenciones no procesadas`
      });
    } catch (error) {
      console.error('Error deleting unprocessed attentions:', error);
      res.status(500).json({ 
        error: 'Error al eliminar registros no procesados',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Delete medical attentions by patient filter
  app.delete('/api/medical-attentions/delete-by-patient', authMiddleware, async (req, res) => {
    try {
      const { patientName, patientRut } = req.body;
      
      if (!patientName && !patientRut) {
        return res.status(400).json({ 
          success: false, 
          error: 'Se requiere nombre o RUT del paciente' 
        });
      }

      let deletedCount = 0;
      
      // Delete payment calculations first
      if (patientName) {
        const attentionsToDelete = await db.select({ id: medicalAttentions.id })
          .from(medicalAttentions)
          .where(ilike(medicalAttentions.patientName, `%${patientName}%`));
        
        if (attentionsToDelete.length > 0) {
          const attentionIds = attentionsToDelete.map(a => a.id);
          await db.delete(paymentCalculations)
            .where(inArray(paymentCalculations.attentionId, attentionIds));
        }
        
        const result = await db.delete(medicalAttentions)
          .where(ilike(medicalAttentions.patientName, `%${patientName}%`));
        deletedCount += result.rowCount || 0;
      }
      
      if (patientRut) {
        const attentionsToDelete = await db.select({ id: medicalAttentions.id })
          .from(medicalAttentions)
          .where(like(medicalAttentions.patientRut, `%${patientRut}%`));
        
        if (attentionsToDelete.length > 0) {
          const attentionIds = attentionsToDelete.map(a => a.id);
          await db.delete(paymentCalculations)
            .where(inArray(paymentCalculations.attentionId, attentionIds));
        }
        
        const result = await db.delete(medicalAttentions)
          .where(like(medicalAttentions.patientRut, `%${patientRut}%`));
        deletedCount += result.rowCount || 0;
      }

      res.json({ 
        success: true, 
        deletedCount,
        message: `Se eliminaron ${deletedCount} registros del paciente` 
      });
    } catch (error) {
      console.error('Error deleting attentions by patient:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al eliminar atenciones del paciente' 
      });
    }
  });

  // Delete all medical attentions (for complete cleanup)
  app.delete('/api/medical-attentions/delete-all', authMiddleware, async (req, res) => {
    try {
      const { confirmText } = req.body;
      
      if (confirmText !== 'CONFIRMAR BORRADO TOTAL') {
        return res.status(400).json({ 
          success: false, 
          error: 'Texto de confirmación incorrecto' 
        });
      }

      // Delete payment calculations first (due to foreign key constraints)
      const calcResult = await db.delete(paymentCalculations);
      const attentionResult = await db.delete(medicalAttentions);
      
      res.json({ 
        success: true, 
        deletedAttentions: attentionResult.rowCount || 0,
        deletedCalculations: calcResult.rowCount || 0,
        message: 'Se eliminaron todos los registros correctamente'
      });
    } catch (error) {
      console.error('Error deleting all attentions:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al eliminar todas las atenciones' 
      });
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
      const { doctorId, dateFrom, dateTo, includeParticipaciones, includeHmq } = req.body;
      
      // Build filters based on request
      const filters: any = {
        dateFrom,
        dateTo,
        status: 'pending'
      };
      
      if (doctorId && doctorId !== 'all') {
        filters.doctorId = doctorId;
      }
      
      // Add record type filters
      const recordTypes = [];
      if (includeParticipaciones) recordTypes.push('participacion');
      if (includeHmq) recordTypes.push('hmq');
      if (recordTypes.length > 0) {
        filters.recordTypes = recordTypes;
      }
      
      const calculations = await storage.calculatePaymentsWithFilters(filters);
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

  // Payroll processing endpoints
  app.post('/api/calculate-payroll', authMiddleware, async (req, res) => {
    try {
      const { month, year } = req.body;
      
      if (!month || !year) {
        return res.status(400).json({ error: 'Month and year are required' });
      }
      
      const payrollSummary = await storage.calculatePayroll(month, year);
      res.json(payrollSummary);
    } catch (error) {
      console.error('Payroll calculation error:', error);
      res.status(500).json({ error: "Failed to calculate payroll" });
    }
  });

  app.post('/api/process-payroll', authMiddleware, async (req, res) => {
    try {
      const { month, year } = req.body;
      
      if (!month || !year) {
        return res.status(400).json({ error: 'Month and year are required' });
      }
      
      await storage.processPayroll(month, year);
      res.json({ success: true, message: 'Payroll processed successfully' });
    } catch (error) {
      console.error('Payroll processing error:', error);
      res.status(500).json({ error: "Failed to process payroll" });
    }
  });

  app.post('/api/generate-payslip/:doctorId', authMiddleware, async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { month, year } = req.body;
      
      // Get doctor information
      const doctor = await storage.getDoctorById(doctorId);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      // Get society information if applicable
      let society = null;
      const doctorData = doctor as any;
      if (doctorData.societyId) {
        society = await storage.getMedicalSocietyById(doctorData.societyId);
      }

      // Get payroll data for the doctor
      const payrollData = await storage.calculatePayroll(month, year);
      const doctorPayroll = payrollData.find(p => p.doctorId === doctorId);
      
      if (!doctorPayroll) {
        return res.status(404).json({ error: 'No payroll data found for this doctor in the specified period' });
      }

      // Get real medical attentions data for this specific doctor
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // Get participación attentions for this doctor
      const participacionFilters = {
        doctorId: doctorId,
        dateFrom: startDate.toISOString().split('T')[0],
        dateTo: endDate.toISOString().split('T')[0],
        recordTypes: ['participacion']
        // Include all statuses - pending and processed
      };
      
      const participacionAttentionsRaw = await storage.getMedicalAttentions(participacionFilters);
      const participacionAttentions = (participacionAttentionsRaw || []).map(att => ({
        attentionDate: att.attentionDate,
        patientRut: att.patientRut || 'No informado',
        serviceCode: att.serviceName || '',
        serviceName: att.serviceName || 'Servicio no especificado',
        providerType: att.providerName || 'No informado',
        baseAmount: att.grossAmount?.toString() || '0',
        participationPercentage: att.participationPercentage || '0',
        participatedAmount: att.participatedAmount || '0',
        commissionAmount: att.netAmount?.toString() || '0'
      }));
      
      // Get HMQ attentions for this doctor
      const hmqFilters = {
        doctorId: doctorId,
        dateFrom: startDate.toISOString().split('T')[0],
        dateTo: endDate.toISOString().split('T')[0],
        recordTypes: ['hmq']
        // Include all statuses - pending and processed
      };
      
      const hmqAttentionsRaw = await storage.getMedicalAttentions(hmqFilters);
      const hmqAttentions = (hmqAttentionsRaw || []).map(att => ({
        attentionDate: att.attentionDate,
        patientRut: att.patientRut || 'No informado',
        serviceCode: att.serviceName || '',
        serviceName: att.serviceName || 'Servicio no especificado',
        providerType: att.providerName || 'No informado',
        baseAmount: att.grossAmount?.toString() || '0',
        participationPercentage: att.participationPercentage || '0',
        participatedAmount: att.participatedAmount || '0',
        commissionAmount: att.netAmount?.toString() || '0'
      }));
      
      console.log(`DEBUG - Doctor ${doctorId}: Participaciones=${participacionAttentions.length}, HMQ=${hmqAttentions.length}`);

      // Calculate correct totals from the detailed data (participation amount minus commission)
      const calculatedParticipacionTotal = participacionAttentions.reduce((sum, att) => {
        const netAmount = parseFloat(att.participatedAmount) - parseFloat(att.commissionAmount);
        console.log(`DEBUG - Participacion: ${att.participatedAmount} - ${att.commissionAmount} = ${netAmount}`);
        return sum + netAmount;
      }, 0);
      const calculatedHmqTotal = hmqAttentions.reduce((sum, att) => {
        const netAmount = parseFloat(att.participatedAmount) - parseFloat(att.commissionAmount);
        console.log(`DEBUG - HMQ: ${att.participatedAmount} - ${att.commissionAmount} = ${netAmount}`);
        return sum + netAmount;
      }, 0);
      
      console.log(`DEBUG - TOTALES CALCULADOS: Participaciones=${calculatedParticipacionTotal}, HMQ=${calculatedHmqTotal}, Total=${calculatedParticipacionTotal + calculatedHmqTotal}`);

      // Import the PDF generator
      const { generatePayrollPDF } = await import('./pdfGenerator.js');

      // Generate PDF data with calculated totals
      const pdfData = {
        doctorId,
        doctorName: doctor.name,
        doctorRut: doctor.rut,
        societyName: society?.name,
        societyRut: society?.rut,
        month,
        year,
        participacionAttentions: participacionAttentions || [],
        hmqAttentions: hmqAttentions || [],
        participacionTotal: calculatedParticipacionTotal,
        hmqTotal: calculatedHmqTotal,
        totalAmount: calculatedParticipacionTotal + calculatedHmqTotal,
      };

      const pdfBuffer = await generatePayrollPDF(pdfData);
      
      // Store the PDF Buffer in memory for download (in production, use a proper storage solution)
      const pdfId = `${doctorId}_${month}_${year}_${Date.now()}`;
      (global as any).pdfStorage = (global as any).pdfStorage || {};
      (global as any).pdfStorage[pdfId] = pdfBuffer;
      
      console.log('PDF generated with pdfId:', pdfId);
      res.json({ 
        message: 'PDF generated successfully',
        doctorId,
        period: `${month}/${year}`,
        pdfId,
        downloadUrl: `/api/download-pdf/${pdfId}`,
        success: true
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      res.status(500).json({ error: "Failed to generate PDF", details: error.message });
    }
  });

  // PDF download endpoint
  app.get('/api/download-pdf/:pdfId', async (req, res) => {
    try {
      const { pdfId } = req.params;
      
      if (!(global as any).pdfStorage || !(global as any).pdfStorage[pdfId]) {
        return res.status(404).json({ error: 'PDF not found' });
      }
      
      const pdfBuffer = (global as any).pdfStorage[pdfId];
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="liquidacion_${pdfId}.html"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('PDF download error:', error);
      res.status(500).json({ error: "Failed to download PDF" });
    }
  });

  // PDF download as file endpoint
  app.get('/api/download-pdf-file/:pdfId', async (req, res) => {
    try {
      const { pdfId } = req.params;
      
      if (!(global as any).pdfStorage || !(global as any).pdfStorage[pdfId]) {
        return res.status(404).json({ error: 'PDF not found' });
      }
      
      const pdfBuffer = (global as any).pdfStorage[pdfId];
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="liquidacion_${pdfId}.html"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('PDF file download error:', error);
      res.status(500).json({ error: "Failed to download PDF file" });
    }
  });

  app.post('/api/send-payslip/:doctorId', authMiddleware, async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { month, year } = req.body;
      
      // For now, return a simple response - we'll implement email sending next
      res.json({ 
        message: 'Email sending endpoint ready',
        doctorId,
        period: `${month}/${year}`
      });
    } catch (error) {
      console.error('Email sending error:', error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Enhanced payment processing endpoints
  app.post('/api/calculate-payment-summaries', authMiddleware, async (req, res) => {
    try {
      const { month, year, recordType } = req.body;
      
      if (!month || !year) {
        return res.status(400).json({ error: 'Month and year are required' });
      }
      
      const summaries = await storage.calculatePaymentSummaries(month, year, recordType);
      res.json(summaries);
    } catch (error) {
      console.error('Payment summaries calculation error:', error);
      res.status(500).json({ error: "Failed to calculate payment summaries" });
    }
  });

  app.post('/api/process-bulk-payments', authMiddleware, async (req, res) => {
    try {
      const { month, year, selectedDoctors, paymentMethod, notes, recordType } = req.body;
      
      if (!month || !year || !selectedDoctors || selectedDoctors.length === 0) {
        return res.status(400).json({ error: 'Month, year, and selected doctors are required' });
      }
      
      const result = await storage.processBulkPayments({
        month,
        year,
        selectedDoctors,
        paymentMethod: paymentMethod || 'transfer',
        notes,
        recordType,
      });
      
      res.json(result);
    } catch (error) {
      console.error('Bulk payment processing error:', error);
      res.status(500).json({ error: "Failed to process bulk payments" });
    }
  });

  // CSV Import endpoint for Participacion records
  // Helper function to find or create service from CSV data
  async function findOrCreateService(serviceCode: string, serviceName: string) {
    try {
      // First try to find existing service by code
      const existingServices = await storage.getServices();
      let service = existingServices.find((s: any) => s.code === serviceCode);
      
      if (service) {
        return service.id;
      }

      // If not found, create a new service entry
      const newService = {
        code: serviceCode,
        name: serviceName || `Servicio ${serviceCode}`,
        description: `Servicio importado: ${serviceName}`,
        basePrice: 50000, // Default base price
        participationType: 'individual' as const,
        specialtyId: null,
        isActive: true,
      };

      const createdService = await storage.createService(newService);
      return createdService.id;
    } catch (error) {
      console.error('Error finding/creating service:', error);
      // Return first available service as fallback
      const services = await storage.getServices();
      return services.length > 0 ? services[0].id : 'srv001';
    }
  }

  // Helper function to find or create specialty from CSV data
  async function findOrCreateSpecialty(specialtyName: string) {
    try {
      if (!specialtyName || specialtyName.trim() === '') {
        return 'esp001'; // Default specialty
      }
      
      const specialties = await storage.getSpecialties();
      
      // Look for exact name match
      let specialty = specialties.find((s: any) => 
        s.name.toLowerCase() === specialtyName.toLowerCase()
      );
      
      if (specialty) {
        return specialty.id;
      }
      
      // Look for partial matches
      specialty = specialties.find((s: any) => 
        s.name.toLowerCase().includes(specialtyName.toLowerCase()) ||
        specialtyName.toLowerCase().includes(s.name.toLowerCase())
      );
      
      if (specialty) {
        return specialty.id;
      }
      
      // Create new specialty if not found
      const newSpecialtyId = `esp_${Date.now()}`;
      const code = specialtyName.substring(0, 3).toUpperCase();
      
      const newSpecialty = {
        id: newSpecialtyId,
        code: code,
        name: specialtyName,
        description: `Especialidad: ${specialtyName}`,
        participationType: null,
      };
      
      const createdSpecialty = await storage.createSpecialty(newSpecialty);
      return createdSpecialty.id;
    } catch (error) {
      console.error('Error finding/creating specialty:', error);
      return 'esp001'; // Return default specialty on error
    }
  }

  // Helper function to find or create doctor from CSV data
  async function findOrCreateDoctor(professionalRut: string, professionalName: string, specialtyName: string) {
    try {
      // First try to find existing doctor by RUT (most reliable)
      const existingDoctors = await storage.getDoctors();
      
      // Check by RUT first (exact match)
      let doctor = existingDoctors.find((d: any) => d.rut === professionalRut);
      if (doctor) {
        return doctor.id;
      }

      // Check by RUT with different formatting (add/remove dash, digit)
      const cleanRut = professionalRut.replace(/[^0-9]/g, '');
      const rutPatterns = [
        `${cleanRut}-K`,
        `${cleanRut}-1`,
        `${cleanRut}`,
        professionalRut
      ];
      
      for (const rutPattern of rutPatterns) {
        doctor = existingDoctors.find((d: any) => d.rut === rutPattern);
        if (doctor) {
          return doctor.id;
        }
      }

      // Check by name similarity to avoid creating duplicates
      const cleanName = professionalName.toLowerCase().replace(/^(dr\.?|dra\.?)\s*/i, '');
      doctor = existingDoctors.find((d: any) => {
        const existingCleanName = d.name.toLowerCase().replace(/^(dr\.?|dra\.?)\s*/i, '');
        return existingCleanName.includes(cleanName) || cleanName.includes(existingCleanName);
      });
      if (doctor) {
        return doctor.id;
      }

      // If not found anywhere, create a new doctor with the actual RUT and name from CSV
      const formattedRut = professionalRut.includes('-') ? professionalRut : `${professionalRut}-K`;
      
      // Find or create the specialty
      const actualSpecialtyId = await findOrCreateSpecialty(specialtyName);
      
      const newDoctor = {
        rut: formattedRut,
        name: professionalName,
        email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@hospital.cl`,
        phone: '',
        specialtyId: actualSpecialtyId,
        participationType: 'individual' as const,
        societyType: 'individual' as const,
        societyRut: null,
        societyName: null,
        paymentType: 'transfer',
        bankAccount: '',
        bankName: '',
        accountHolderName: professionalName,
        accountHolderRut: formattedRut,
        isActive: true,
      };

      const createdDoctor = await storage.createDoctor(newDoctor);
      return createdDoctor.id;
    } catch (error) {
      console.error('Error finding/creating doctor:', error);
      
      // If creation failed due to duplicate, try one final search
      try {
        const existingDoctors = await storage.getDoctors();
        const fallbackMatch = existingDoctors.find((d: any) => 
          d.rut === professionalRut ||
          d.name.toLowerCase().includes(professionalName.toLowerCase())
        );
        
        if (fallbackMatch) {
          return fallbackMatch.id;
        }
        
        // If still not found, return first available doctor to prevent infinite loops
        if (existingDoctors.length > 0) {
          return existingDoctors[0].id;
        }
      } catch (searchError) {
        console.error('Error in fallback search:', searchError);
      }
      
      // Absolute last resort to prevent infinite loops
      return 'doc001';
    }
  }

  app.post('/api/import/csv-participacion', authMiddleware, async (req, res) => {
    try {
      console.log('Participacion import started. Request body:', req.body);
      const csvData = req.body.csvData || '';
      const lines = csvData.split('\n').filter((line: string) => line.trim());
      console.log('CSV lines found:', lines.length, 'First few lines:', lines.slice(0, 3));
      
      if (lines.length < 2) {
        return res.json({
          success: false,
          data: [],
          errors: ['El archivo CSV debe contener al menos una fila de datos'],
          total: 0,
          imported: 0,
        });
      }

      // Procesar hasta 10000 registros para archivos grandes
      const maxProcessedRecords = 10000;
      const totalRecords = lines.length - 1;
      let recordsToProcess = Math.min(totalRecords, maxProcessedRecords);
      const linesToProcess = lines.slice(0, recordsToProcess + 1); // +1 para incluir header
      
      if (totalRecords > maxProcessedRecords) {
        console.log(`Archivo contiene ${totalRecords} registros, procesando solo los primeros ${maxProcessedRecords}`);
      }

      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      // Expected columns for TMP_REGISTROS_PARTICIPACION
      const expectedColumns = [
        'RPAR_RUT_PACIENTE', 'RPAR_NOMBRE_PACIENTE', 'RPAR_FATENCION', 
        'RPAR_CODIGO_PRESTACION', 'RPAR_NOMBRE_PRESTACION', 'RPAR_PREVISION_PACIENTE',
        'RPAR_VAL_PARTICIPADO', 'RPAR_VAL_LIQUIDO', 'RPAR_PORCENTAJE_PARTICIPACION',
        'HORARIO', 'ESP_ID', 'RPAR_ESTADO', 'MED_ID', 'SOC_ID', 'NOMBRE_SOCIEDAD', 'RUT_SOCIEDAD', 'CODIGO_INTERNO_MEDICO'
      ];

      // Auto-detect CSV separator by analyzing the first few lines
      const detectSeparator = (lines: string[]): string => {
        if (lines.length < 2) return ',';
        
        const separators = [';', '|', ',', '\t'];
        const testLine = lines[1]; // Use first data line (skip header)
        
        let bestSeparator = ',';
        let maxColumns = 0;
        
        for (const sep of separators) {
          const columns = testLine.split(sep).length;
          console.log(`Testing separator '${sep}': ${columns} columns`);
          if (columns > maxColumns && columns >= 15) { // Should have at least 15 columns for medical data
            maxColumns = columns;
            bestSeparator = sep;
          }
        }
        
        console.log(`Auto-detected separator: '${bestSeparator}' with ${maxColumns} columns`);
        return bestSeparator;
      };
      
      const separator = detectSeparator(linesToProcess);

      for (let i = 1; i < linesToProcess.length; i++) {
        try {
          const values = lines[i].split(separator).map((v: string) => v.trim().replace(/"/g, ''));
          
          // Validate line has minimum required columns and basic data integrity
          if (values.length < 27) {
            console.log(`Skipping line ${i}: insufficient columns (${values.length})`);
            errors.push(`Fila ${i + 1}: Error al procesar - columnas insuficientes (encontradas: ${values.length}, requeridas: 27)`);
            continue;
          }
          
          const attentionDate = values[14] || '';
          const patientName = values[15] || '';
          
          // Remove debug logging for production
          
          // Validate critical fields - allow multiple date formats
          const isValidDate = attentionDate.match(/^\d{2}-[A-Z]{3}-\d{2}$/) || 
                             attentionDate.match(/^\d{2}-[A-Z][a-z]{2}-\d{2}$/) ||
                             attentionDate.match(/^\d{4}-\d{2}-\d{2}$/);
          
          if (!isValidDate || patientName.length < 3) {
            console.log(`Skipping line ${i}: invalid date format (${attentionDate}) or patient name (${patientName})`);
            if (!isValidDate) {
              errors.push(`Fila ${i + 1}: Error al procesar - formato de fecha inválido: "${attentionDate}"`);
            } else {
              errors.push(`Fila ${i + 1}: Error al procesar - nombre del paciente incompleto: "${patientName}"`);
            }
            continue;
          }
          
          console.log(`Line ${i + 1} amounts:`, {
            index6: values[6],
            index7: values[7],
            index8: values[8],
            index22: values[22],
            index23: values[23],
            index24: values[24]
          });
          
          // Find or create doctor and service based on CSV data - con manejo de errores mejorado
          let doctorId = 'doc001'; // Doctor por defecto
          let serviceId = 'srv001'; // Servicio por defecto
          
          try {
            const professionalRut = values[6] || ''; // RUT_PROF (position 6)
            const professionalName = values[7] || ''; // NOMBRE_PROF (position 7)
            const specialtyName = values[8] || ''; // ESPECIALIDAD (position 8)
            doctorId = await findOrCreateDoctor(professionalRut, professionalName, specialtyName);
          } catch (error) {
            console.log(`Warning: Could not find/create doctor for line ${i + 1}, using default`);
          }
          
          try {
            const serviceCode = values[3] || '';
            const serviceName = values[4] || '';
            serviceId = await findOrCreateService(serviceCode, serviceName);
          } catch (error) {
            console.log(`Warning: Could not find/create service for line ${i + 1}, using default`);
          }
          
          // Helper function to convert dates from DD-MMM-YY to YYYY-MM-DD
          const formatDate = (dateStr: string): string => {
            if (!dateStr) return '';
            
            // Handle DD-MMM-YY format (01-AUG-25, 04-Aug-25, etc.)
            const monthMap: { [key: string]: string } = {
              'JAN': '01', 'Jan': '01', 'ENERO': '01',
              'FEB': '02', 'Feb': '02', 'FEBRERO': '02',
              'MAR': '03', 'Mar': '03', 'MARZO': '03',
              'APR': '04', 'Apr': '04', 'ABRIL': '04',
              'MAY': '05', 'May': '05', 'MAYO': '05',
              'JUN': '06', 'Jun': '06', 'JUNIO': '06',
              'JUL': '07', 'Jul': '07', 'JULIO': '07',
              'AUG': '08', 'Aug': '08', 'AGOSTO': '08',
              'SEP': '09', 'Sep': '09', 'SEPTIEMBRE': '09',
              'OCT': '10', 'Oct': '10', 'OCTUBRE': '10',
              'NOV': '11', 'Nov': '11', 'NOVIEMBRE': '11',
              'DEC': '12', 'Dec': '12', 'DICIEMBRE': '12'
            };
            
            const parts = dateStr.split('-');
            if (parts.length === 3) {
              const day = parts[0].padStart(2, '0');
              const month = monthMap[parts[1]] || '01';
              const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
              return `${year}-${month}-${day}`;
            }
            
            return dateStr; // Return as-is if not in expected format
          };

          // Helper function to safely format numbers with overflow protection
          // Use the improved cleanNumericValue function;

          // Correct CSV mapping based on actual CSV structure:
          // 0:ID, 1:NUMERO_PAGO, 2:FECHA_SOLICITUD, 3:FECHA_PARTICIPACION, 4:RUT_PAGO, 5:NOMBRE_PAGADOR, 
          // 6:RUT_PROF, 7:NOMBRE_PROF, 8:ORIGEN, 9:CODCENTRO, 10:CENTROCOSTO, 11:CODIGO_PRESTACION, 
          // 12:NOMBRE_PRESTACION, 13:PREVISION, 14:FECHA_ATENCION, 15:PACIENTE...
          
          const attention = {
            patientRut: values[15] || '', // PACIENTE - contains patient name, not RUT in this case
            patientName: values[15] || '', // PACIENTE - full patient name
            doctorId: doctorId, // Use resolved doctor ID
            serviceId: serviceId, // Use resolved service ID  
            providerTypeId: getProviderTypeFromPrevision(values[13] || ''), // PREVISION (CONSALUD, FONASA, etc.)
            attentionDate: formatDate(values[14] || ''), // FECHA_ATENCION (01-AUG-25 format)
            attentionTime: '09:00', // Default time
            scheduleType: 'regular', // Default schedule
            grossAmount: cleanNumericValue(values[22]), // BRUTO (index 22)
            netAmount: cleanNumericValue(values[26]), // LIQUIDO (index 26) 
            participatedAmount: cleanNumericValue(values[24]), // PARTICIPADO (index 24)
            status: 'pending', // Default status
            recordType: 'participacion',
            // Additional fields
            participationPercentage: cleanNumericValue(values[23]), // PORCENTAGE_PARTICIPACION (index 23)
            serviceName: values[12] || '', // NOMBRE_PRESTACION (index 12)
            providerName: values[13] || '', // PREVISION (index 13)
            // Medical society and doctor information
            medicalSocietyId: values[4] || '', // RUT_PAGO (index 4)
            medicalSocietyName: values[5] || '', // NOMBRE_PAGADOR (index 5) 
            medicalSocietyRut: values[4] || '', // RUT_PAGO (index 4)
            doctorInternalCode: values[6] || '', // RUT_PROF (index 6)
            specialtyId: values[8] || '', // ORIGEN (index 8)
            
            // Payment beneficiary information (NEW FIELDS)
            payeeRut: values[4] || '', // RUT_PAGO - quien recibe el pago
            payeeName: values[5] || '', // NOMBRE_PAGADOR - nombre del beneficiario  
            professionalRut: values[6] || '', // RUT_PROF - RUT del profesional que atendió
            commission: cleanNumericValue(values[25]) // COMISION (index 25)
          };

          if (!attention.patientRut || !attention.patientName) {
            errors.push(`Fila ${i + 1}: RUT y nombre del paciente son requeridos`);
            continue;
          }

          if (!attention.serviceId) {
            errors.push(`Fila ${i + 1}: Código de prestación es requerido`);
            continue;
          }

          console.log(`Processing line ${i + 1}:`, {
            patientRut: attention.patientRut,
            grossAmount: attention.grossAmount,
            netAmount: attention.netAmount,
            participatedAmount: attention.participatedAmount,
            rawValues: [values[6], values[7], values[8]]
          });

          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error) {
          console.error(`Error processing line ${i + 1}:`, error);
          errors.push(`Fila ${i + 1}: Error al procesar - ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      // Agregar mensaje informativo si se procesaron menos registros que el total
      if (totalRecords > maxProcessedRecords) {
        errors.unshift(`Información: Se procesaron ${recordsToProcess} registros de ${totalRecords} totales. Para mejor rendimiento, el sistema procesa máximo ${maxProcessedRecords} registros por importación.`);
      }

      console.log(`Import complete. Total: ${totalRecords}, Processed: ${recordsToProcess}, Imported: ${imported}, Errors: ${errors.length}`);
      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: totalRecords,
        processed: recordsToProcess,
        imported,
        recordType: 'participacion'
      });
    } catch (error) {
      console.error('Error importing Participacion CSV:', error);
      res.status(500).json({
        success: false,
        data: [],
        errors: [`Error interno del servidor: ${error}`],
        total: 0,
        imported: 0,
      });
    }
  });

  // CSV Import endpoint for HMQ Activities records
  app.post('/api/import/csv-hmq', authMiddleware, async (req, res) => {
    try {
      console.log('HMQ import started. Request body:', req.body);
      const csvData = req.body.csvData || '';
      const lines = csvData.split('\n').filter((line: string) => line.trim());
      console.log('CSV lines found:', lines.length, 'First few lines:', lines.slice(0, 3));
      
      if (lines.length < 2) {
        return res.json({
          success: false,
          data: [],
          errors: ['El archivo CSV debe contener al menos una fila de datos'],
          total: 0,
          imported: 0,
        });
      }

      // Procesar hasta 10000 registros para archivos grandes
      const maxProcessedRecords = 10000;
      const totalRecords = lines.length - 1;
      let recordsToProcess = Math.min(totalRecords, maxProcessedRecords);
      const linesToProcess = lines.slice(0, recordsToProcess + 1); // +1 para incluir header
      
      if (totalRecords > maxProcessedRecords) {
        console.log(`Archivo contiene ${totalRecords} registros, procesando solo los primeros ${maxProcessedRecords}`);
      }

      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      // Expected columns for TMP_REGISTROS_HMQ
      const expectedColumns = [
        'RHMQ_RUT_PACIENTE', 'RHMQ_NOMBRE_PACIENTE', 'RHMQ_FCONSUMO', 
        'RHMQ_CODIGO_PRESTACION', 'RHMQ_NOMBRE_PRESTACION', 'RHMQ_PREVISION_PACIENTE',
        'RHMQ_VAL_BRUTO', 'RHMQ_VAL_LIQUIDO', 'RHMQ_COMISION', 'RHMQ_VAL_RECAUDADO',
        'ESP_ID', 'RHMQ_ESTADO', 'RHMQ_BANCO_PARA_PAGO', 'RHMQ_CUENTA_PARA_PAGO',
        'MED_ID', 'SOC_ID', 'NOMBRE_SOCIEDAD', 'RUT_SOCIEDAD', 'CODIGO_INTERNO_MEDICO', 'RHMQ_PARTICIPANTE'
      ];

      // Auto-detect CSV separator by analyzing the first few lines
      const detectSeparatorHMQ = (lines: string[]): string => {
        if (lines.length < 2) return ',';
        
        const separators = [';', '|', ',', '\t'];
        const testLine = lines[1]; // Use first data line (skip header)
        
        let bestSeparator = ',';
        let maxColumns = 0;
        
        for (const sep of separators) {
          const columns = testLine.split(sep).length;
          console.log(`Testing HMQ separator '${sep}': ${columns} columns`);
          if (columns > maxColumns && columns >= 10) { // Should have at least 10 columns for HMQ data
            maxColumns = columns;
            bestSeparator = sep;
          }
        }
        
        console.log(`Auto-detected HMQ separator: '${bestSeparator}' with ${maxColumns} columns`);
        return bestSeparator;
      };
      
      const separatorHMQ = detectSeparatorHMQ(linesToProcess);

      for (let i = 1; i < linesToProcess.length; i++) {
        try {
          const values = lines[i].split(separatorHMQ).map((v: string) => v.trim().replace(/"/g, ''));
          
          // Find or create doctor and service based on CSV data
          const medId = values[14] || '';
          const doctorInternalCode = values[18] || '';
          const specialtyId = values[10] || '';
          const doctorId = await findOrCreateDoctor(medId, doctorInternalCode, specialtyId);
          
          const serviceCode = values[3] || '';
          const serviceName = values[4] || '';
          const serviceId = await findOrCreateService(serviceCode, serviceName);
          
          // Map TMP_REGISTROS_HMQ fields to medical attention format
          const attention = {
            patientRut: values[0] || '', // RHMQ_RUT_PACIENTE
            patientName: values[1] || '', // RHMQ_NOMBRE_PACIENTE
            doctorId: doctorId, // Use resolved doctor ID
            serviceId: serviceId, // Use resolved service ID
            providerTypeId: getProviderTypeFromPrevision(values[5] || ''), // RHMQ_PREVISION_PACIENTE
            attentionDate: formatDate(values[2] || ''), // RHMQ_FCONSUMO
            attentionTime: '09:00', // Default time for HMQ records
            scheduleType: 'regular' as const,
            grossAmount: values[6] || '0', // RHMQ_VAL_BRUTO
            netAmount: values[7] || '0', // RHMQ_VAL_LIQUIDO
            participatedAmount: values[9] || '0', // RHMQ_VAL_RECAUDADO
            status: mapHmqStatus(values[11] || 'pending'), // RHMQ_ESTADO
            // Additional fields specific to HMQ
            commission: values[8] || '0', // RHMQ_COMISION
            serviceName: values[4] || '', // RHMQ_NOMBRE_PRESTACION
            providerName: values[5] || '', // RHMQ_PREVISION_PACIENTE
            bankForPayment: values[12] || '', // RHMQ_BANCO_PARA_PAGO
            accountForPayment: values[13] || '', // RHMQ_CUENTA_PARA_PAGO
            // Medical society and doctor information
            medicalSocietyId: values[15] || '', // SOC_ID
            medicalSocietyName: values[16] || '', // NOMBRE_SOCIEDAD
            medicalSocietyRut: values[17] || '', // RUT_SOCIEDAD
            doctorInternalCode: values[18] || '', // CODIGO_INTERNO_MEDICO
            participantName: values[19] || '', // RHMQ_PARTICIPANTE
            specialtyId: values[10] || '', // ESP_ID
          };

          if (!attention.patientRut || !attention.patientName) {
            errors.push(`Fila ${i + 1}: RUT y nombre del paciente son requeridos`);
            continue;
          }

          if (!attention.serviceId) {
            errors.push(`Fila ${i + 1}: Código de prestación es requerido`);
            continue;
          }

          console.log('Creating HMQ attention:', JSON.stringify(attention, null, 2));
          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error) {
          console.error(`Error processing HMQ line ${i + 1}:`, error);
          errors.push(`Fila ${i + 1}: Error al procesar - ${error}`);
        }
      }

      // Agregar mensaje informativo si se procesaron menos registros que el total
      if (totalRecords > maxProcessedRecords) {
        errors.unshift(`Información: Se procesaron ${recordsToProcess} registros de ${totalRecords} totales. Para mejor rendimiento, el sistema procesa máximo ${maxProcessedRecords} registros por importación.`);
      }

      console.log(`HMQ Import complete. Total: ${totalRecords}, Processed: ${recordsToProcess}, Imported: ${imported}, Errors: ${errors.length}`);
      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: totalRecords,
        processed: recordsToProcess,
        imported,
        recordType: 'hmq'
      });
    } catch (error) {
      console.error('Error importing HMQ CSV:', error);
      res.status(500).json({
        success: false,
        data: [],
        errors: [`Error interno del servidor: ${error}`],
        total: 0,
        imported: 0,
      });
    }
  });

  // Excel Import endpoint for Participacion records
  app.post('/api/import/excel-participacion', authMiddleware, async (req, res) => {
    try {
      console.log('Excel Participacion import started');
      const { excelData, fileName } = req.body;
      
      if (!excelData) {
        return res.json({
          success: false,
          data: [],
          errors: ['Datos de Excel requeridos'],
          total: 0,
          imported: 0,
        });
      }

      // Decode base64 to buffer
      const buffer = Buffer.from(excelData, 'base64');
      
      // Parse Excel file
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      console.log('Excel file analysis:', {
        fileName: fileName,
        sheetNames: workbook.SheetNames,
        totalSheets: workbook.SheetNames.length
      });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON (header row included)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log(`Excel structure info:`, {
        sheetUsed: sheetName,
        dataRowsFound: jsonData.length,
        headerRow: jsonData[0],
        firstDataRow: jsonData[1],
        sampleFromMiddle: jsonData[Math.floor(jsonData.length/2)]
      });
      
      if (jsonData.length < 2) {
        return res.json({
          success: false,
          data: [],
          errors: ['El archivo Excel debe contener al menos una fila de datos'],
          total: 0,
          imported: 0,
        });
      }

      // Process data (skip header row)
      const maxProcessedRecords = 10000;
      const totalRecords = jsonData.length - 1;
      const recordsToProcess = Math.min(totalRecords, maxProcessedRecords);
      const dataToProcess = jsonData.slice(1, recordsToProcess + 1); // Skip header, process up to max
      
      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      for (let i = 0; i < dataToProcess.length; i++) {
        try {
          const row = dataToProcess[i] as any[];
          const rowIndex = i + 2; // +2 because we skip header and array is 0-indexed
          
          // Validate minimum columns
          if (!row || row.length < 15) {
            errors.push(`Fila ${rowIndex}: Error al procesar - columnas insuficientes (encontradas: ${row?.length || 0}, requeridas: 15)`);
            continue;
          }

          // Log ALL raw values for debugging to understand the structure
          console.log(`Excel row ${rowIndex} ALL columns:`, {
            row0: row[0], row1: row[1], row2: row[2], row3: row[3], row4: row[4],
            row5: row[5], row6: row[6], row7: row[7], row8: row[8], row9: row[9],
            row10: row[10], row11: row[11], row12: row[12], row13: row[13], row14: row[14],
            row15: row[15], row16: row[16], row17: row[17], row18: row[18], row19: row[19]
          });

          // Map Excel columns to attention object with proper data cleaning
          const grossAmountCleaned = cleanNumericValue(row[6]);
          const netAmountCleaned = cleanNumericValue(row[7]);
          
          console.log(`Excel row ${rowIndex} cleaned amounts:`, {
            grossAmount: grossAmountCleaned,
            netAmount: netAmountCleaned
          });

          // MAPEO CORREGIDO - Necesito ver los logs para identificar las columnas correctas
          // Por ahora, voy a usar un mapeo más conservador basado en lo que sabemos:
          // - row[0] probablemente sea el RUT del profesional médico (14366756-1)
          // - row[1] probablemente sea el nombre del profesional (ALARCON STUARDO RAUL)
          // - Necesito identificar dónde están: RUT paciente, nombre paciente, montos reales
          
          // Analizando la imagen del Excel vs los logs:
          // Necesito encontrar dónde están los valores reales: BRUTO=36252, PARTICIPADO=9788
          // Los logs muestran que row[17]=3295849 está mal
          
          console.log(`Excel row ${rowIndex} MONTOS detallados:`, {
            row0: row[0], row1: row[1], row2: row[2], row3: row[3], row4: row[4],
            row5: row[5], row6: row[6], row7: row[7], row8: row[8], row9: row[9],
            row10: row[10], row11: row[11], row12: row[12], row13: row[13], row14: row[14],
            row15: row[15], row16: row[16], row17: row[17], row18: row[18], row19: row[19],
            row20: row[20], row21: row[21], row22: row[22], row23: row[23], row24: row[24],
            row25: row[25], row26: row[26], row27: row[27], row28: row[28], row29: row[29]
          });
          
          console.log(`🎯 VALORES CORRECTOS fila ${rowIndex}:`, {
            'ID (row[0])': row[0],
            'BRUTO W (row[22])': row[22],
            'NETO Y (row[24])': row[24], 
            'PARTICIPADO AA (row[26])': row[26]
          });
          
          // BUSCAR VALORES ESPECÍFICOS: ID=51263438, BRUTO=162620, LIQUIDO=21141
          console.log(`🔍 Buscando valores específicos en fila ${rowIndex}:`);
          let encontrado = false;
          for (let i = 0; i < row.length; i++) {
            const valor = String(row[i]);
            if (valor.includes('51263438') || valor.includes('162620') || valor.includes('21141')) {
              console.log(`⭐ VALOR ENCONTRADO en fila ${rowIndex}, columna ${i}: ${valor}`);
              encontrado = true;
            }
          }
          if (encontrado) {
            console.log(`📋 FILA COMPLETA ${rowIndex}:`, row);
          }

          const attention = {
            patientRut: String(row[4] || ''), // '76375293-3' - RUT del paciente  
            patientName: String(row[5] || '').trim(), // 'ALARCON VASQUEZ IMAGENOLOGIA MEDICA LTDA' - Nombre del paciente
            doctorId: await findOrCreateDoctor(String(row[6] || ''), String(row[7] || ''), String(row[8] || '')), // RUT, nombre y especialidad del profesional
            serviceId: await findOrCreateService(String(row[11] || ''), String(row[10] || '')), // Código y nombre del servicio
            providerTypeId: getProviderTypeFromPrevision(String(row[13] || '')), // 'CONSALUD' - Tipo de prestador
            attentionDate: formatDate(String(row[2] || '')), // 45876 - Fecha en formato Excel serial
            attentionTime: '09:00',
            scheduleType: 'regular' as const,
            // MAPEO DEFINITIVO CORRECTO según columnas Excel especificadas:
            // BRUTO: Columna W = row[22]
            // NETO: Columna Y = row[24]
            // PARTICIPADO: Columna AA = row[26]
            grossAmount: cleanNumericValue(row[22] || '0'), // Columna W - BRUTO
            netAmount: cleanNumericValue(row[24] || '0'), // Columna Y - NETO
            participatedAmount: cleanNumericValue(row[26] || '0'), // Columna AA - PARTICIPADO
            externalId: String(row[0] || ''), // row[0]: 51270341 - ID del Excel
            status: 'pending' as const,
            recordType: 'participacion' as const,
            participationPercentage: cleanNumericValue(row[16] || '0'), // 3 - Porcentaje
            serviceName: String(row[10] || ''), // Nombre del servicio
            providerName: String(row[13] || ''), // Tipo de prestador
            professionalRut: String(row[6] || ''), // RUT del profesional
            professionalName: String(row[7] || ''), // Nombre del profesional
            commission: cleanNumericValue(row[18] || '0') // 0 - Comisión
          };

          // Validate all decimal fields before database insertion
          console.log(`Final validation for row ${rowIndex}:`, {
            grossAmount: attention.grossAmount,
            netAmount: attention.netAmount,
            participatedAmount: attention.participatedAmount,
            participationPercentage: attention.participationPercentage
          });

          if (!attention.patientRut || !attention.patientName) {
            errors.push(`Fila ${rowIndex}: RUT y nombre del paciente son requeridos`);
            continue;
          }

          // Double-check that decimal fields are valid before insertion
          if (isNaN(parseFloat(attention.grossAmount)) || 
              isNaN(parseFloat(attention.netAmount)) || 
              isNaN(parseFloat(attention.participatedAmount))) {
            errors.push(`Fila ${rowIndex}: Montos inválidos después de limpieza - bruto: ${attention.grossAmount}, neto: ${attention.netAmount}, participado: ${attention.participatedAmount}`);
            continue;
          }

          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error) {
          console.error(`Error processing Excel row ${i + 2}:`, error);
          errors.push(`Fila ${i + 2}: Error al procesar - ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      // Add info message if processing was limited
      if (totalRecords > maxProcessedRecords) {
        errors.unshift(`Información: Se procesaron ${recordsToProcess} registros de ${totalRecords} totales. Para mejor rendimiento, el sistema procesa máximo ${maxProcessedRecords} registros por importación.`);
      }

      console.log(`Excel Participacion import complete. Total: ${totalRecords}, Processed: ${recordsToProcess}, Imported: ${imported}, Errors: ${errors.length}`);
      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: totalRecords,
        processed: recordsToProcess,
        imported,
        recordType: 'participacion'
      });
    } catch (error) {
      console.error('Error importing Excel Participacion:', error);
      res.status(500).json({
        success: false,
        data: [],
        errors: [`Error interno del servidor: ${error}`],
        total: 0,
        imported: 0,
      });
    }
  });

  // Excel Import endpoint for HMQ records
  app.post('/api/import/excel-hmq', authMiddleware, async (req, res) => {
    try {
      console.log('Excel HMQ import started');
      const { excelData, fileName } = req.body;
      
      if (!excelData) {
        return res.json({
          success: false,
          data: [],
          errors: ['Datos de Excel requeridos'],
          total: 0,
          imported: 0,
        });
      }

      // Decode base64 to buffer
      const buffer = Buffer.from(excelData, 'base64');
      
      // Parse Excel file
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON (header row included)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log(`Excel HMQ file "${fileName}" loaded. Data rows found: ${jsonData.length}`);
      
      if (jsonData.length < 2) {
        return res.json({
          success: false,
          data: [],
          errors: ['El archivo Excel debe contener al menos una fila de datos'],
          total: 0,
          imported: 0,
        });
      }

      // Process data similar to HMQ CSV but with cleaner Excel data
      const maxProcessedRecords = 10000;
      const totalRecords = jsonData.length - 1;
      const recordsToProcess = Math.min(totalRecords, maxProcessedRecords);
      const dataToProcess = jsonData.slice(1, recordsToProcess + 1);
      
      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      for (let i = 0; i < dataToProcess.length; i++) {
        try {
          const row = dataToProcess[i] as any[];
          const rowIndex = i + 2;
          
          if (!row || row.length < 10) {
            errors.push(`Fila ${rowIndex}: Error al procesar - columnas insuficientes (encontradas: ${row?.length || 0}, requeridas: 10)`);
            continue;
          }

          // Map Excel HMQ columns to attention object
          const attention = {
            patientRut: String(row[0] || ''),
            patientName: String(row[1] || ''),
            doctorId: await findOrCreateDoctor(String(row[14] || ''), String(row[18] || ''), String(row[10] || '')),
            serviceId: await findOrCreateService(String(row[3] || ''), String(row[4] || '')),
            providerTypeId: getProviderTypeFromPrevision(String(row[5] || '')),
            attentionDate: formatDate(String(row[2] || '')),
            attentionTime: '09:00',
            scheduleType: 'regular' as const,
            grossAmount: String(row[6] || '0'),
            netAmount: String(row[7] || '0'),
            participatedAmount: String(row[9] || '0'),
            status: mapHmqStatus(String(row[11] || 'pending')),
            recordType: 'hmq' as const,
          };

          if (!attention.patientRut || !attention.patientName) {
            errors.push(`Fila ${rowIndex}: RUT y nombre del paciente son requeridos`);
            continue;
          }

          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error) {
          console.error(`Error processing Excel HMQ row ${i + 2}:`, error);
          errors.push(`Fila ${i + 2}: Error al procesar - ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      if (totalRecords > maxProcessedRecords) {
        errors.unshift(`Información: Se procesaron ${recordsToProcess} registros de ${totalRecords} totales. Para mejor rendimiento, el sistema procesa máximo ${maxProcessedRecords} registros por importación.`);
      }

      console.log(`Excel HMQ import complete. Total: ${totalRecords}, Processed: ${recordsToProcess}, Imported: ${imported}, Errors: ${errors.length}`);
      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: totalRecords,
        processed: recordsToProcess,
        imported,
        recordType: 'hmq'
      });
    } catch (error) {
      console.error('Error importing Excel HMQ:', error);
      res.status(500).json({
        success: false,
        data: [],
        errors: [`Error interno del servidor: ${error}`],
        total: 0,
        imported: 0,
      });
    }
  });

  // CSV Import endpoint for general attentions (backward compatibility)
  app.post('/api/import/csv-attentions', authMiddleware, async (req, res) => {
    try {
      const csvData = req.body.csvData || '';
      const lines = csvData.split('\n').filter((line: string) => line.trim());
      
      if (lines.length < 2) {
        return res.json({
          success: false,
          data: [],
          errors: ['El archivo CSV debe contener al menos una fila de datos'],
          total: 0,
          imported: 0,
        });
      }

      // Procesar hasta 10000 registros para archivos grandes
      const maxProcessedRecords = 10000;
      const totalRecords = lines.length - 1;
      let recordsToProcess = Math.min(totalRecords, maxProcessedRecords);
      const linesToProcess = lines.slice(0, recordsToProcess + 1); // +1 para incluir header
      
      if (totalRecords > maxProcessedRecords) {
        console.log(`Archivo contiene ${totalRecords} registros, procesando solo los primeros ${maxProcessedRecords}`);
      }

      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      for (let i = 1; i < linesToProcess.length; i++) {
        try {
          const values = lines[i].split(',').map((v: string) => v.trim());
          
          const attention = {
            patientRut: values[0] || '',
            patientName: values[1] || '',
            doctorId: values[2] || '',
            serviceId: values[3] || '',
            providerTypeId: values[4] || '',
            attentionDate: values[5] || '',
            attentionTime: values[6] || '',
            scheduleType: values[7] || 'regular',
            grossAmount: values[8] || '0',
            netAmount: values[9] || '0',
            participatedAmount: values[10] || '0',
            status: 'pending',
          };

          if (!attention.patientRut || !attention.patientName) {
            errors.push(`Fila ${i + 1}: RUT y nombre del paciente son requeridos`);
            continue;
          }

          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error) {
          errors.push(`Fila ${i + 1}: Error al procesar - ${error}`);
        }
      }

      // Agregar mensaje informativo si se procesaron menos registros que el total
      if (totalRecords > maxProcessedRecords) {
        errors.unshift(`Información: Se procesaron ${recordsToProcess} registros de ${totalRecords} totales. Para mejor rendimiento, el sistema procesa máximo ${maxProcessedRecords} registros por importación.`);
      }

      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: totalRecords,
        processed: recordsToProcess,
        imported,
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      res.status(500).json({
        success: false,
        data: [],
        errors: ['Error interno del servidor'],
        total: 0,
        imported: 0,
      });
    }
  });

  // API Import endpoint for Participacion records
  app.post('/api/import/api-participacion', authMiddleware, async (req, res) => {
    try {
      const { url, method = 'GET', headers = {}, body } = req.body;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error('Error al conectar con la API externa');
      }

      const apiData = await response.json();
      const dataArray = Array.isArray(apiData) ? apiData : [apiData];

      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      for (let index = 0; index < dataArray.length; index++) {
        const item = dataArray[index];
        try {
          // Map API data to participacion format
          const attention = {
            patientRut: item.rut_paciente || item.patientRut || '',
            patientName: item.nombre_paciente || item.patientName || '',
            doctorId: `doc_${item.especialidad_id || item.esp_id || 'unknown'}`,
            serviceId: item.codigo_prestacion || item.serviceCode || '',
            providerTypeId: getProviderTypeFromPrevision(item.prevision || item.provider || ''),
            attentionDate: formatDate(item.fecha_atencion || item.attentionDate || ''),
            attentionTime: item.horario || item.time || '09:00',
            scheduleType: 'regular' as const,
            grossAmount: item.val_participado || item.participatedAmount || '0',
            netAmount: item.val_liquido || item.netAmount || '0',
            participatedAmount: item.val_participado || item.participatedAmount || '0',
            status: mapParticipacionStatus(item.estado || item.status || 'pending'),
            participationPercentage: item.porcentaje_participacion || item.participationPercentage || '0',
            serviceName: item.nombre_prestacion || item.serviceName || '',
            providerName: item.prevision || item.provider || '',
          };

          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error: any) {
          errors.push(`Registro ${index + 1}: ${error.message}`);
        }
      }

      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: dataArray.length,
        imported,
        recordType: 'participacion'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        data: [],
        errors: [`Error al importar desde API: ${error.message}`],
        total: 0,
        imported: 0,
      });
    }
  });

  // API Import endpoint for HMQ Activities records  
  app.post('/api/import/api-hmq', authMiddleware, async (req, res) => {
    try {
      const { url, method = 'GET', headers = {}, body } = req.body;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error('Error al conectar con la API externa');
      }

      const apiData = await response.json();
      const dataArray = Array.isArray(apiData) ? apiData : [apiData];

      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      for (let index = 0; index < dataArray.length; index++) {
        const item = dataArray[index];
        try {
          // Map API data to HMQ format
          const attention = {
            patientRut: item.rut_paciente || item.patientRut || '',
            patientName: item.nombre_paciente || item.patientName || '',
            doctorId: `doc_${item.especialidad_id || item.esp_id || 'unknown'}`,
            serviceId: item.codigo_prestacion || item.serviceCode || '',
            providerTypeId: getProviderTypeFromPrevision(item.prevision || item.provider || ''),
            attentionDate: formatDate(item.fecha_consumo || item.consumptionDate || ''),
            attentionTime: '09:00',
            scheduleType: 'regular' as const,
            grossAmount: item.val_bruto || item.grossAmount || '0',
            netAmount: item.val_liquido || item.netAmount || '0',
            participatedAmount: item.val_recaudado || item.collectedAmount || '0',
            status: mapHmqStatus(item.estado || item.status || 'pending'),
            commission: item.comision || item.commission || '0',
            serviceName: item.nombre_prestacion || item.serviceName || '',
            providerName: item.prevision || item.provider || '',
            bankForPayment: item.banco_pago || item.paymentBank || '',
            accountForPayment: item.cuenta_pago || item.paymentAccount || '',
          };

          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error: any) {
          errors.push(`Registro ${index + 1}: ${error.message}`);
        }
      }

      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: dataArray.length,
        imported,
        recordType: 'hmq'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        data: [],
        errors: [`Error al importar desde API: ${error.message}`],
        total: 0,
        imported: 0,
      });
    }
  });

  // API Import endpoint for general attentions (backward compatibility)
  app.post('/api/import/api-attentions', authMiddleware, async (req, res) => {
    try {
      const { url, method, headers, body } = req.body;

      const response = await fetch(url, {
        method: method || 'GET',
        headers: headers || {},
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        return res.json({
          success: false,
          data: [],
          errors: [`Error al conectar con la API: ${response.statusText}`],
          total: 0,
          imported: 0,
        });
      }

      const apiData = await response.json();
      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      const dataArray = Array.isArray(apiData) ? apiData : apiData.data || [];

      for (const item of dataArray) {
        try {
          const attention = {
            patientRut: item.patientRut || item.rut_paciente || '',
            patientName: item.patientName || item.nombre_paciente || '',
            doctorId: item.doctorId || item.medico_id || '',
            serviceId: item.serviceId || item.servicio_id || '',
            providerTypeId: item.providerTypeId || item.tipo_prestador_id || '',
            attentionDate: item.attentionDate || item.fecha_atencion || '',
            attentionTime: item.attentionTime || item.hora_atencion || '',
            scheduleType: item.scheduleType || 'regular',
            grossAmount: item.grossAmount || item.monto_bruto || '0',
            netAmount: item.netAmount || item.monto_liquido || '0',
            participatedAmount: item.participatedAmount || item.monto_participado || '0',
            status: 'pending',
          };

          if (!attention.patientRut || !attention.patientName) {
            errors.push(`Registro: RUT y nombre del paciente son requeridos`);
            continue;
          }

          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error) {
          errors.push(`Error al procesar registro: ${error}`);
        }
      }

      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: dataArray.length,
        imported,
      });
    } catch (error) {
      console.error('Error importing from API:', error);
      res.status(500).json({
        success: false,
        data: [],
        errors: ['Error al conectar con la API externa'],
        total: 0,
        imported: 0,
      });
    }
  });

  // HIS Import endpoint for Participacion records
  app.post('/api/import/his-participacion', authMiddleware, async (req, res) => {
    try {
      const { endpoint, apiKey, facility, dateFrom, dateTo } = req.body;

      const hisHeaders = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Facility-Code': facility,
      };

      const hisParams = new URLSearchParams({
        dateFrom: dateFrom || '',
        dateTo: dateTo || '',
        recordType: 'participacion',
        status: 'completed',
      });

      const response = await fetch(`${endpoint}/participacion?${hisParams}`, {
        method: 'GET',
        headers: hisHeaders,
      });

      if (!response.ok) {
        throw new Error(`Error al conectar con el HIS: ${response.statusText}`);
      }

      const hisData = await response.json();
      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      const dataArray = hisData.participaciones || hisData.data || [];

      for (const item of dataArray) {
        try {
          const attention = {
            patientRut: item.rut_paciente || item.patient_rut || '',
            patientName: item.nombre_paciente || item.patient_name || '',
            doctorId: `doc_${item.especialidad_id || item.specialty_id || 'unknown'}`,
            serviceId: item.codigo_prestacion || item.service_code || '',
            providerTypeId: getProviderTypeFromPrevision(item.prevision || item.provider || ''),
            attentionDate: formatDate(item.fecha_atencion || item.attention_date || ''),
            attentionTime: item.horario || item.time || '09:00',
            scheduleType: 'regular' as const,
            grossAmount: item.val_participado || item.participated_amount || '0',
            netAmount: item.val_liquido || item.net_amount || '0',
            participatedAmount: item.val_participado || item.participated_amount || '0',
            status: mapParticipacionStatus(item.estado || item.status || 'pending'),
            participationPercentage: item.porcentaje_participacion || item.participation_percentage || '0',
            serviceName: item.nombre_prestacion || item.service_name || '',
            providerName: item.prevision || item.provider || '',
          };

          if (!attention.patientRut || !attention.patientName) {
            errors.push(`Registro HIS: RUT y nombre del paciente son requeridos`);
            continue;
          }

          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error: any) {
          errors.push(`Error HIS: ${error.message}`);
        }
      }

      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: dataArray.length,
        imported,
        recordType: 'participacion'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        data: [],
        errors: [`Error al conectar con el HIS: ${error.message}`],
        total: 0,
        imported: 0,
      });
    }
  });

  // HIS Import endpoint for HMQ Activities
  app.post('/api/import/his-hmq', authMiddleware, async (req, res) => {
    try {
      const { endpoint, apiKey, facility, dateFrom, dateTo } = req.body;

      const hisHeaders = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Facility-Code': facility,
      };

      const hisParams = new URLSearchParams({
        dateFrom: dateFrom || '',
        dateTo: dateTo || '',
        recordType: 'hmq',
        status: 'liquidado',
      });

      const response = await fetch(`${endpoint}/actividades-hmq?${hisParams}`, {
        method: 'GET',
        headers: hisHeaders,
      });

      if (!response.ok) {
        throw new Error(`Error al conectar con el HIS: ${response.statusText}`);
      }

      const hisData = await response.json();
      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      const dataArray = hisData.actividades || hisData.data || [];

      for (const item of dataArray) {
        try {
          const attention = {
            patientRut: item.rut_paciente || item.patient_rut || '',
            patientName: item.nombre_paciente || item.patient_name || '',
            doctorId: `doc_${item.especialidad_id || item.specialty_id || 'unknown'}`,
            serviceId: item.codigo_prestacion || item.service_code || '',
            providerTypeId: getProviderTypeFromPrevision(item.prevision || item.provider || ''),
            attentionDate: formatDate(item.fecha_consumo || item.consumption_date || ''),
            attentionTime: '09:00',
            scheduleType: 'regular' as const,
            grossAmount: item.val_bruto || item.gross_amount || '0',
            netAmount: item.val_liquido || item.net_amount || '0',
            participatedAmount: item.val_recaudado || item.collected_amount || '0',
            status: mapHmqStatus(item.estado || item.status || 'pending'),
            commission: item.comision || item.commission || '0',
            serviceName: item.nombre_prestacion || item.service_name || '',
            providerName: item.prevision || item.provider || '',
            bankForPayment: item.banco_pago || item.payment_bank || '',
            accountForPayment: item.cuenta_pago || item.payment_account || '',
          };

          if (!attention.patientRut || !attention.patientName) {
            errors.push(`Registro HIS: RUT y nombre del paciente son requeridos`);
            continue;
          }

          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error: any) {
          errors.push(`Error HIS: ${error.message}`);
        }
      }

      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: dataArray.length,
        imported,
        recordType: 'hmq'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        data: [],
        errors: [`Error al conectar con el HIS: ${error.message}`],
        total: 0,
        imported: 0,
      });
    }
  });

  // HIS Import endpoint for general attentions (backward compatibility)
  app.post('/api/import/his-attentions', authMiddleware, async (req, res) => {
    try {
      const { endpoint, apiKey, facility, dateFrom, dateTo } = req.body;

      const hisHeaders = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Facility-Code': facility,
      };

      const hisParams = new URLSearchParams({
        dateFrom: dateFrom || '',
        dateTo: dateTo || '',
        status: 'completed',
      });

      const response = await fetch(`${endpoint}/attentions?${hisParams}`, {
        method: 'GET',
        headers: hisHeaders,
      });

      if (!response.ok) {
        return res.json({
          success: false,
          data: [],
          errors: [`Error al conectar con el HIS: ${response.statusText}`],
          total: 0,
          imported: 0,
        });
      }

      const hisData = await response.json();
      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      const dataArray = hisData.attentions || hisData.data || [];

      for (const item of dataArray) {
        try {
          const attention = {
            patientRut: item.rut_paciente || item.patient_rut || '',
            patientName: item.nombre_paciente || item.patient_name || '',
            doctorId: item.medico_rut || item.doctor_rut || '',
            serviceId: item.codigo_prestacion || item.service_code || '',
            providerTypeId: item.tipo_prestador || item.provider_type || '',
            attentionDate: item.fecha_atencion || item.attention_date || '',
            attentionTime: item.hora_atencion || item.attention_time || '',
            scheduleType: item.tipo_horario || 'regular',
            grossAmount: item.valor_bruto || item.gross_amount || '0',
            netAmount: item.valor_liquido || item.net_amount || '0',
            participatedAmount: item.valor_participado || item.participated_amount || '0',
            status: 'pending',
          };

          if (!attention.patientRut || !attention.patientName) {
            errors.push(`Registro HIS: RUT y nombre del paciente son requeridos`);
            continue;
          }

          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error) {
          errors.push(`Error al procesar registro HIS: ${error}`);
        }
      }

      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: dataArray.length,
        imported,
      });
    } catch (error) {
      console.error('Error importing from HIS:', error);
      res.status(500).json({
        success: false,
        data: [],
        errors: ['Error al conectar con el sistema HIS'],
        total: 0,
        imported: 0,
      });
    }
  });

  // Helper functions for participacion import
  function getProviderTypeFromPrevision(prevision: string): string {
    const previsionLower = prevision.toLowerCase();
    if (previsionLower.includes('fonasa a')) return '4c4a775e-40f1-4709-8e8c-a434f20bab67';
    if (previsionLower.includes('fonasa b')) return '9645c305-9ed3-4e5e-b9e9-28fbde66aa7a';
    if (previsionLower.includes('fonasa c')) return '96fb4a7a-7040-401f-8e84-c1fcff2fa9df';
    if (previsionLower.includes('fonasa d')) return '5ed37495-fe3e-4df6-a13c-445e1ee4e013';
    if (previsionLower.includes('consalud')) return '2f2fb1fa-eb6a-443e-aaaa-ad70cb1568e7'; // ISAPRE_CONSALUD
    if (previsionLower.includes('banmedica')) return '16f71b19-ec30-49a7-8bec-0266664de412'; // ISAPRE_BANMEDICA
    if (previsionLower.includes('colmena')) return '62166e16-1766-42fe-b02a-cfb8b3082a14'; // ISAPRE_COLMENA
    if (previsionLower.includes('cruz blanca')) return 'ce1da615-24c1-49de-90dd-b6060ca069e8'; // ISAPRE_CRUZBLANC
    if (previsionLower.includes('vida tres')) return 'f81b0b1f-5b06-4e7c-8e8b-212c445e7344'; // ISAPRE_VIDATRES
    if (previsionLower.includes('isapre')) return '62166e16-1766-42fe-b02a-cfb8b3082a14'; // Generic ISAPRE
    if (previsionLower.includes('particular')) return 'c381abd7-3ba9-4623-928a-afa2dcb43dcb';
    return 'c381abd7-3ba9-4623-928a-afa2dcb43dcb'; // Default to particular
  }

  // Helper function to clean and validate numeric values
  function cleanNumericValue(value: any): string {
    if (!value || value === null || value === undefined) return '0';
    
    const str = String(value).trim();
    console.log(`Cleaning numeric value: "${str}"`);
    
    // If empty or just whitespace
    if (!str || str === '') return '0';
    
    // Extract only digits, decimal points, and commas
    const cleaned = str.replace(/[^\d.,]/g, '');
    console.log(`After removing non-numeric: "${cleaned}"`);
    
    if (!cleaned || cleaned === '') return '0';
    
    // Replace comma with dot for decimal separator (handle European format)
    let normalized = cleaned.replace(/,/g, '.');
    
    // If multiple decimal points, keep only the first one
    const parts = normalized.split('.');
    if (parts.length > 2) {
      normalized = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Validate it's a proper number
    const num = parseFloat(normalized);
    if (isNaN(num)) {
      console.log(`Still not a valid number after cleaning: "${normalized}", returning 0`);
      return '0';
    }
    
    console.log(`Final cleaned value: "${normalized}"`);
    return normalized;
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    const cleanDate = String(dateStr).trim();
    
    // Check if it's an Excel serial number (number > 1 and < 2958466 which is year 9999)
    const numericValue = Number(cleanDate);
    if (!isNaN(numericValue) && numericValue > 1 && numericValue < 2958466) {
      console.log(`Converting Excel serial date: ${numericValue}`);
      // Excel dates start from January 1, 1900 (but Excel incorrectly treats 1900 as a leap year)
      // So we need to subtract 2 from the serial number to account for this bug
      const excelEpoch = new Date(1899, 11, 30); // December 30, 1899 (adjusted for Excel bug)
      const date = new Date(excelEpoch.getTime() + numericValue * 24 * 60 * 60 * 1000);
      const result = date.toISOString().split('T')[0];
      console.log(`Excel date ${numericValue} converted to ${result}`);
      return result;
    }
    
    // Handle DD-MMM-YY format (like "01-AUG-25")
    if (cleanDate.match(/^\d{2}-[A-Z]{3}-\d{2}$/)) {
      const parts = cleanDate.split('-');
      const day = parts[0];
      const monthAbbr = parts[1];
      const year = `20${parts[2]}`; // Convert 25 to 2025
      
      // Convert month abbreviations to numbers
      const monthMap: Record<string, string> = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
        'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
        'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
      };
      
      const month = monthMap[monthAbbr] || '01';
      return `${year}-${month}-${day}`;
    }
    
    // Handle Oracle date format DD/MM/YYYY or YYYY-MM-DD
    if (cleanDate.includes('/')) {
      const [day, month, year] = cleanDate.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return cleanDate.split('T')[0]; // Remove time part if exists
  }

  function mapParticipacionStatus(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('liquidado') || statusLower.includes('pagado')) return 'processed';
    if (statusLower.includes('anulado') || statusLower.includes('cancelado')) return 'cancelled';
    return 'pending';
  }

  function mapHmqStatus(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('liquidado') || statusLower.includes('pagado') || statusLower.includes('recaudado')) return 'processed';
    if (statusLower.includes('anulado') || statusLower.includes('cancelado')) return 'cancelled';
    if (statusLower.includes('pendiente') || statusLower.includes('proceso')) return 'pending';
    return 'pending';
  }

  // Professional login endpoint
  app.post('/api/professional-login', async (req, res) => {
    try {
      const { rut, password } = req.body;
      
      if (!rut || !password) {
        return res.status(400).json({ message: 'RUT y contraseña son requeridos' });
      }
      
      console.log(`Professional login attempt: RUT=${rut}, Password=${password ? '[HIDDEN]' : 'empty'}`);
      
      // Find doctor by RUT (case insensitive, trim whitespace)
      const doctors = await storage.getDoctors();
      console.log(`Total doctors in database: ${doctors.length}`);
      
      // Normalize RUT for comparison (remove dots, keep dashes)
      const normalizeRut = (rutInput: string) => {
        return rutInput.trim().replace(/\./g, '').toUpperCase();
      };
      
      const cleanInputRut = normalizeRut(rut);
      const doctor = doctors.find((d: any) => {
        const cleanDbRut = normalizeRut(d.rut || '');
        console.log(`Comparing: "${cleanInputRut}" === "${cleanDbRut}"`);
        return cleanDbRut === cleanInputRut;
      });
      
      if (!doctor) {
        console.log(`Doctor not found for RUT: ${rut}`);
        // Show first few doctors for debugging
        console.log('Available doctors:', doctors.slice(0, 5).map(d => ({ rut: d.rut, name: d.name })));
        return res.status(401).json({ message: 'RUT no encontrado en el sistema' });
      }
      
      console.log(`Doctor found: ${doctor.name} (${doctor.rut})`);
      
      // For development, accept any password for existing doctors
      // In production, this would validate against a proper password hash
      if (password.length < 1) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }
      
      // Create or get user for this doctor
      let userId = `doctor_${doctor.id}`;
      
      try {
        // Try to get existing user
        const existingUser = await storage.getUser(userId);
        console.log(`Existing user found: ${existingUser ? existingUser.id : 'none'}`);
      } catch (error) {
        console.log(`Creating new user: ${userId}`);
        // User doesn't exist, create it
        const newUser = await storage.upsertUser({
          id: userId,
          email: doctor.email,
          firstName: doctor.name.split(' ')[0],
          lastName: doctor.name.split(' ').slice(1).join(' '),
          profileImageUrl: null,
          profile: 'doctor', // Set doctor profile
        });
        console.log(`User created: ${newUser.id}`);
        
        // Link to doctor profile
        await storage.linkUserToDoctor(userId, doctor.id);
        console.log(`User linked to doctor: ${doctor.id}`);
      }
      
      // Set session
      (req.session as any).mockUser = userId;
      console.log(`Session set for doctor: ${userId}`);
      
      res.json({
        success: true,
        doctorId: doctor.id,
        doctorName: doctor.name,
        message: 'Login exitoso'
      });
      
    } catch (error) {
      console.error('Professional login error:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  // Get current doctor information (for authenticated professionals)
  app.get('/api/user-doctor', async (req: any, res) => {
    try {
      // Check if user is authenticated as a doctor
      const mockUserId = (req.session as any)?.mockUser;
      if (!mockUserId || !mockUserId.startsWith('doctor_')) {
        return res.status(401).json({ message: "No doctor session found" });
      }

      // Extract doctor ID from user ID format: doctor_{doctorId}
      const doctorId = mockUserId.replace('doctor_', '');
      const doctor = await storage.getDoctorById(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // Return doctor information
      res.json({
        id: doctor.id,
        rut: doctor.rut,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialtyId: doctor.specialtyId,
        societyType: doctor.societyType,
        societyName: doctor.societyName,
        paymentType: doctor.paymentType,
        isActive: doctor.isActive
      });
    } catch (error) {
      console.error('Error getting doctor info:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  // ==================== CONTABILIDAD TESORERÍA ====================

  // Generate accounting export
  app.post('/api/generate-accounting-export', async (req, res) => {
    try {
      const { month, year, exportFormat, includeDetail, notes } = req.body;
      
      // Get payment data for the period
      const payments = await storage.getPayments({ month, year, status: 'processed' });
      
      // Generate accounting entries
      const entries = [];
      let totalDebits = 0;
      let totalCredits = 0;
      
      for (const payment of payments) {
        // Debit entry - Honorarios Médicos expense
        const debitEntry = {
          account: '5110001',
          accountName: 'Honorarios Médicos Profesionales',
          debit: parseFloat(payment.totalAmount),
          credit: 0,
          description: `Honorarios médicos ${month}/${year}`,
          reference: `PAY-${payment.id.slice(0, 8)}`
        };
        
        // Credit entry - Bank account
        const creditEntry = {
          account: '1110001',
          accountName: 'Banco Cuenta Corriente',
          debit: 0,
          credit: parseFloat(payment.totalAmount),
          description: `Pago honorarios médicos ${month}/${year}`,
          reference: `PAY-${payment.id.slice(0, 8)}`
        };
        
        entries.push(debitEntry, creditEntry);
        totalDebits += debitEntry.debit;
        totalCredits += creditEntry.credit;
      }
      
      const summary = {
        totalEntries: entries.length,
        totalDebits,
        totalCredits,
        balanceCheck: Math.abs(totalDebits - totalCredits) < 0.01,
        period: `${month}/${year}`
      };
      
      res.json({ summary, entries });
    } catch (error: any) {
      console.error('Error generating accounting export:', error);
      res.status(500).json({ error: 'Error al generar exportación contable' });
    }
  });

  // Download accounting export file
  app.post('/api/download-accounting-export', async (req, res) => {
    try {
      const { month, year, format } = req.body;
      
      // Get payment data for the period
      const payments = await storage.getPayments({ month, year, status: 'processed' });
      
      // Generate accounting entries
      const entries = [];
      for (const payment of payments) {
        entries.push(
          {
            account: '5110001',
            accountName: 'Honorarios Médicos Profesionales',
            debit: parseFloat(payment.totalAmount),
            credit: 0,
            description: `Honorarios médicos ${month}/${year}`,
            reference: `PAY-${payment.id.slice(0, 8)}`
          },
          {
            account: '1110001',
            accountName: 'Banco Cuenta Corriente',
            debit: 0,
            credit: parseFloat(payment.totalAmount),
            description: `Pago honorarios médicos ${month}/${year}`,
            reference: `PAY-${payment.id.slice(0, 8)}`
          }
        );
      }
      
      let content = '';
      let contentType = 'text/plain';
      let filename = `exportacion_contable_${month}_${year}`;
      
      if (format === 'csv') {
        contentType = 'text/csv';
        filename += '.csv';
        content = 'Cuenta,Nombre Cuenta,Débito,Crédito,Descripción,Referencia\n';
        content += entries.map(entry => 
          `"${entry.account}","${entry.accountName}","${entry.debit}","${entry.credit}","${entry.description}","${entry.reference}"`
        ).join('\n');
      } else if (format === 'excel') {
        contentType = 'application/vnd.ms-excel';
        filename += '.xls';
        content = 'Cuenta\tNombre Cuenta\tDébito\tCrédito\tDescripción\tReferencia\n';
        content += entries.map(entry => 
          `${entry.account}\t${entry.accountName}\t${entry.debit}\t${entry.credit}\t${entry.description}\t${entry.reference}`
        ).join('\n');
      } else {
        filename += '.txt';
        content = entries.map(entry => 
          `${entry.account}|${entry.accountName}|${entry.debit}|${entry.credit}|${entry.description}|${entry.reference}`
        ).join('\n');
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error: any) {
      console.error('Error downloading accounting export:', error);
      res.status(500).json({ error: 'Error al descargar exportación' });
    }
  });

  // Generate bank payroll
  app.post('/api/generate-bank-payroll', async (req, res) => {
    try {
      const { month, year, bankFormat, includeOnlyProcessed } = req.body;
      
      // Get processed payments for the period
      const payments = await storage.getPayments({ 
        month, 
        year, 
        status: includeOnlyProcessed ? 'processed' : undefined 
      });
      
      // Get doctor details for each payment
      const transfers = [];
      const byBank: Record<string, { count: number; amount: number }> = {};
      
      for (const payment of payments) {
        const doctor = await storage.getDoctorById(payment.doctorId);
        if (!doctor) continue;
        
        // Mock bank details (in real implementation, these would come from doctor profile)
        const bankName = 'Banco Santander';
        const bankAccount = `${Math.random().toString().slice(2, 12)}`;
        const accountType = 'Cuenta Corriente';
        
        const transfer = {
          id: payment.id,
          doctorName: doctor.name,
          doctorRut: doctor.rut,
          email: doctor.email || `${doctor.rut.replace('-', '')}@medico.cl`,
          bankName,
          bankAccount,
          accountType,
          amount: parseFloat(payment.totalAmount),
          reference: `HON-${month}${year}-${payment.id.slice(0, 6)}`,
          societyInfo: doctor.societyRut ? {
            name: 'Sociedad Médica Demo',
            rut: '76.123.456-7'
          } : undefined
        };
        
        transfers.push(transfer);
        
        if (!byBank[bankName]) {
          byBank[bankName] = { count: 0, amount: 0 };
        }
        byBank[bankName].count++;
        byBank[bankName].amount += transfer.amount;
      }
      
      const summary = {
        totalTransfers: transfers.length,
        totalAmount: transfers.reduce((sum, t) => sum + t.amount, 0),
        byBank,
        period: `${month}/${year}`
      };
      
      res.json({ summary, transfers });
    } catch (error: any) {
      console.error('Error generating bank payroll:', error);
      res.status(500).json({ error: 'Error al generar nómina bancaria' });
    }
  });

  // Download bank file
  app.post('/api/download-bank-file', async (req, res) => {
    try {
      const { month, year, bankFormat, selectedTransfers } = req.body;
      
      // Get selected payments
      const payments = await storage.getPayments({ month, year });
      const selectedPayments = payments.filter(p => selectedTransfers.includes(p.id));
      
      let content = '';
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      
      // Generate bank format file
      if (bankFormat === 'santander') {
        content = '001' + today + '001\n'; // Header
        
        for (const payment of selectedPayments) {
          const doctor = await storage.getDoctorById(payment.doctorId);
          if (!doctor) continue;
          
          const amount = Math.round(parseFloat(payment.totalAmount));
          const line = [
            '002', // Record type
            '01', // Bank code
            '0'.repeat(12 - doctor.rut.replace(/\D/g, '').length) + doctor.rut.replace(/\D/g, ''), // Account
            amount.toString().padStart(15, '0'), // Amount
            doctor.name.padEnd(40, ' ').slice(0, 40), // Name
            doctor.rut.padEnd(12, ' '), // RUT
            `HON${month}${year}`.padEnd(20, ' ') // Reference
          ].join('');
          content += line + '\n';
        }
        
        content += '999' + selectedPayments.length.toString().padStart(6, '0'); // Footer
      } else {
        // Universal format
        content = 'RUT,NOMBRE,BANCO,CUENTA,MONTO,REFERENCIA\n';
        
        for (const payment of selectedPayments) {
          const doctor = await storage.getDoctorById(payment.doctorId);
          if (!doctor) continue;
          
          content += `"${doctor.rut}","${doctor.name}","Banco Santander","${Math.random().toString().slice(2, 12)}","${payment.totalAmount}","HON-${month}${year}-${payment.id.slice(0, 6)}"\n`;
        }
      }
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="nomina_bancaria_${month}_${year}.txt"`);
      res.send(content);
    } catch (error: any) {
      console.error('Error downloading bank file:', error);
      res.status(500).json({ error: 'Error al descargar archivo bancario' });
    }
  });

  // ENDPOINTS DE DESCARGA DE MANUALES
  // Descargar Manual de Sistema
  app.get('/api/download-manual/sistema', authMiddleware, async (req, res) => {
    try {
      const pdfBuffer = await generateManualPDF('sistema');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Manual_Sistema_Portal_Pagos_Medicos.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating sistema manual PDF:', error);
      res.status(500).json({ error: 'Error al generar PDF del Manual de Sistema' });
    }
  });
  
  // Descargar Manual Técnico
  app.get('/api/download-manual/tecnico', authMiddleware, async (req, res) => {
    try {
      const pdfBuffer = await generateManualPDF('tecnico');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Manual_Tecnico_Portal_Pagos_Medicos.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating tecnico manual PDF:', error);
      res.status(500).json({ error: 'Error al generar PDF del Manual Técnico' });
    }
  });
  
  // Descargar Manual de Ventajas Competitivas
  app.get('/api/download-manual/competitivo', authMiddleware, async (req, res) => {
    try {
      const pdfBuffer = await generateManualPDF('competitivo');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Manual_Ventajas_Competitivas_Portal_Pagos_Medicos.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating competitive manual PDF:', error);
      res.status(500).json({ error: 'Error al generar PDF del Manual de Ventajas Competitivas' });
    }
  });

  // Endpoint para consultar información sobre límites de importación
  app.get('/api/import/limits', authMiddleware, async (req, res) => {
    try {
      const limits = {
        maxFileSize: '50MB',
        maxFileSizeBytes: 50 * 1024 * 1024,
        maxRecordsPerFile: 'Sin límite (archivos grandes permitidos)',
        maxProcessedRecords: 100,
        supportedFormats: ['CSV'],
        recommendedBatchSize: 100,
        importTypes: [
          {
            type: 'participacion',
            name: 'Registros Participaciones',
            description: 'Registros de participaciones médicas (TMP_REGISTROS_PARTICIPACION)',
            maxProcessedRecords: 100,
            estimatedProcessingTime: '30-60 segundos por 100 registros'
          },
          {
            type: 'hmq',
            name: 'Registros HMQ',
            description: 'Registros de actividades HMQ (TMP_REGISTROS_HMQ)',
            maxProcessedRecords: 100,
            estimatedProcessingTime: '30-60 segundos por 100 registros'
          },
          {
            type: 'attentions',
            name: 'Atenciones Médicas',
            description: 'Atenciones médicas generales (backward compatibility)',
            maxProcessedRecords: 100,
            estimatedProcessingTime: '15-30 segundos por 100 registros'
          }
        ],
        tips: [
          'Puede subir archivos CSV de cualquier tamaño - el sistema procesará automáticamente los primeros 100 registros',
          'Para procesar más de 100 registros, divida su archivo y haga múltiples importaciones',
          'Asegúrese de que el archivo CSV incluya encabezados en la primera fila',
          'Los campos obligatorios son: RUT del paciente, nombre del paciente',
          'Se crearán automáticamente doctores y servicios no existentes',
          'Verifique que los datos estén en el formato correcto antes de importar',
          'El sistema procesa automáticamente máximo 100 registros por importación para evitar bloqueos'
        ],
        lastUpdated: new Date().toISOString()
      };

      res.json(limits);
    } catch (error) {
      console.error('Error getting import limits:', error);
      res.status(500).json({
        error: 'Error al obtener información sobre límites de importación'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
