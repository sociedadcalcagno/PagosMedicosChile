import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { setupMockAuth } from "./mockAuth";
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
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Always setup session middleware
  const sessionModule = await import("./session");
  await sessionModule.setupSession(app);
  
  // Use mock auth for now (OAuth not configured yet)
  // TODO: Setup real auth when OAuth is configured
  // if (process.env.NODE_ENV === "production" && process.env.REPLIT_DOMAINS) {
  //   await setupAuth(app);
  // } else {
    // Setup mock auth for development and deployment (multiple user testing)
    setupMockAuth(app);
  // }

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

  // Helper function to find or create doctor from CSV data
  async function findOrCreateDoctor(medId: string, doctorInternalCode: string, specialtyId: string) {
    try {
      // First try to find existing doctor by internal code or RUT patterns
      const existingDoctors = await storage.getDoctors();
      
      // Check by internal code first (most reliable)
      let doctor = existingDoctors.find((d: any) => d.internalCode === doctorInternalCode);
      if (doctor) {
        return doctor.id;
      }

      // Check by various RUT patterns that might exist
      const baseRut = medId.replace('MED', '');
      const rutPatterns = [
        `${baseRut}-K`,
        `${baseRut}-1-K`,
        `${doctorInternalCode}-K`
      ];
      
      for (const rutPattern of rutPatterns) {
        doctor = existingDoctors.find((d: any) => d.rut === rutPattern);
        if (doctor) {
          return doctor.id;
        }
      }

      // Check by name similarity to avoid creating duplicates
      doctor = existingDoctors.find((d: any) => 
        d.name.toLowerCase().includes(doctorInternalCode.toLowerCase()) ||
        doctorInternalCode.toLowerCase().includes(d.name.toLowerCase().replace('dr./dra. ', ''))
      );
      if (doctor) {
        return doctor.id;
      }

      // If not found anywhere, create a new doctor with truly unique RUT
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const uniqueRut = `${baseRut}-${timestamp}-${randomSuffix}-K`;
      
      const newDoctor = {
        rut: uniqueRut,
        name: `Dr./Dra. ${doctorInternalCode}`,
        email: `${doctorInternalCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@hospital.cl`,
        phone: '',
        specialties: specialtyId ? [specialtyId] : [],
        participationType: 'individual' as const,
        medicalSocietyId: null,
        internalCode: doctorInternalCode,
        bankAccount: '',
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
          d.internalCode === doctorInternalCode ||
          d.name.toLowerCase().includes(doctorInternalCode.toLowerCase())
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

      // Verificar límite de registros recomendado (10,000 registros por archivo)
      const maxRecommendedRecords = 10000;
      if (lines.length - 1 > maxRecommendedRecords) {
        return res.json({
          success: false,
          data: [],
          errors: [`El archivo contiene ${lines.length - 1} registros. Se recomienda dividir en archivos de máximo ${maxRecommendedRecords} registros para mejor rendimiento.`],
          total: lines.length - 1,
          imported: 0,
        });
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

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''));
          
          // Find or create doctor and service based on CSV data
          const medId = values[12] || '';
          const doctorInternalCode = values[16] || '';
          const specialtyId = values[10] || '';
          const doctorId = await findOrCreateDoctor(medId, doctorInternalCode, specialtyId);
          
          const serviceCode = values[3] || '';
          const serviceName = values[4] || '';
          const serviceId = await findOrCreateService(serviceCode, serviceName);
          
          // Map TMP_REGISTROS_PARTICIPACION fields to medical attention format
          const attention = {
            patientRut: values[0] || '', // RPAR_RUT_PACIENTE
            patientName: values[1] || '', // RPAR_NOMBRE_PACIENTE
            doctorId: doctorId, // Use resolved doctor ID
            serviceId: serviceId, // Use resolved service ID
            providerTypeId: getProviderTypeFromPrevision(values[5] || ''), // RPAR_PREVISION_PACIENTE
            attentionDate: formatDate(values[2] || ''), // RPAR_FATENCION
            attentionTime: values[9] || '09:00', // HORARIO
            scheduleType: values[9]?.includes('nocturno') || values[9]?.includes('festivo') ? 'irregular' : 'regular',
            grossAmount: values[6] || '0', // RPAR_VAL_PARTICIPADO
            netAmount: values[7] || '0', // RPAR_VAL_LIQUIDO
            participatedAmount: values[6] || '0', // RPAR_VAL_PARTICIPADO
            status: mapParticipacionStatus(values[11] || 'pending'), // RPAR_ESTADO
            // Additional fields specific to participacion
            participationPercentage: values[8] || '0', // RPAR_PORCENTAJE_PARTICIPACION
            serviceName: values[4] || '', // RPAR_NOMBRE_PRESTACION
            providerName: values[5] || '', // RPAR_PREVISION_PACIENTE
            // Medical society and doctor information
            medicalSocietyId: values[13] || '', // SOC_ID
            medicalSocietyName: values[14] || '', // NOMBRE_SOCIEDAD
            medicalSocietyRut: values[15] || '', // RUT_SOCIEDAD
            doctorInternalCode: values[16] || '', // CODIGO_INTERNO_MEDICO
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

          await storage.createMedicalAttention(attention);
          importedData.push(attention);
          imported++;
        } catch (error) {
          errors.push(`Fila ${i + 1}: Error al procesar - ${error}`);
        }
      }

      console.log(`Import complete. Total: ${lines.length - 1}, Imported: ${imported}, Errors: ${errors.length}`);
      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: lines.length - 1,
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

      // Verificar límite de registros recomendado (10,000 registros por archivo)
      const maxRecommendedRecords = 10000;
      if (lines.length - 1 > maxRecommendedRecords) {
        return res.json({
          success: false,
          data: [],
          errors: [`El archivo contiene ${lines.length - 1} registros. Se recomienda dividir en archivos de máximo ${maxRecommendedRecords} registros para mejor rendimiento.`],
          total: lines.length - 1,
          imported: 0,
        });
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

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''));
          
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

      console.log(`HMQ Import complete. Total: ${lines.length - 1}, Imported: ${imported}, Errors: ${errors.length}`);
      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: lines.length - 1,
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

      // Verificar límite de registros recomendado (10,000 registros por archivo)
      const maxRecommendedRecords = 10000;
      if (lines.length - 1 > maxRecommendedRecords) {
        return res.json({
          success: false,
          data: [],
          errors: [`El archivo contiene ${lines.length - 1} registros. Se recomienda dividir en archivos de máximo ${maxRecommendedRecords} registros para mejor rendimiento.`],
          total: lines.length - 1,
          imported: 0,
        });
      }

      const errors: string[] = [];
      const importedData: any[] = [];
      let imported = 0;

      for (let i = 1; i < lines.length; i++) {
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

      res.json({
        success: imported > 0,
        data: importedData,
        errors,
        total: lines.length - 1,
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
    if (previsionLower.includes('isapre')) return '62166e16-1766-42fe-b02a-cfb8b3082a14';
    if (previsionLower.includes('particular')) return 'c381abd7-3ba9-4623-928a-afa2dcb43dcb';
    return 'c381abd7-3ba9-4623-928a-afa2dcb43dcb'; // Default to particular
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    // Handle Oracle date format DD/MM/YYYY or YYYY-MM-DD
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateStr.split('T')[0]; // Remove time part if exists
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
      
      // Find doctor by RUT
      const doctors = await storage.getDoctors();
      const doctor = doctors.find((d: any) => d.rut === rut);
      
      if (!doctor) {
        return res.status(401).json({ message: 'RUT no encontrado en el sistema' });
      }
      
      // For development, accept any password for existing doctors
      // In production, this would validate against a proper password hash
      if (password.length < 1) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }
      
      // Create or get user for this doctor
      let userId = `doctor_${doctor.id}`;
      
      try {
        // Try to get existing user
        await storage.getUser(userId);
      } catch (error) {
        // User doesn't exist, create it
        await storage.upsertUser({
          id: userId,
          email: doctor.email,
          firstName: doctor.name.split(' ')[0],
          lastName: doctor.name.split(' ').slice(1).join(' '),
          profileImageUrl: null,
        });
        
        // Link to doctor profile
        await storage.linkUserToDoctor(userId, doctor.id);
      }
      
      // Set session
      (req.session as any).mockUser = userId;
      
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
        maxRecordsPerFile: 10000,
        supportedFormats: ['CSV'],
        recommendedBatchSize: 5000,
        importTypes: [
          {
            type: 'participacion',
            name: 'Registros Participaciones',
            description: 'Registros de participaciones médicas (TMP_REGISTROS_PARTICIPACION)',
            maxRecords: 10000,
            estimatedProcessingTime: '2-5 minutos por 1000 registros'
          },
          {
            type: 'hmq',
            name: 'Registros HMQ',
            description: 'Registros de actividades HMQ (TMP_REGISTROS_HMQ)',
            maxRecords: 10000,
            estimatedProcessingTime: '2-5 minutos por 1000 registros'
          },
          {
            type: 'attentions',
            name: 'Atenciones Médicas',
            description: 'Atenciones médicas generales (backward compatibility)',
            maxRecords: 10000,
            estimatedProcessingTime: '1-3 minutos por 1000 registros'
          }
        ],
        tips: [
          'Para archivos grandes (>5,000 registros), divida en archivos más pequeños',
          'Asegúrese de que el archivo CSV incluya encabezados en la primera fila',
          'Los campos obligatorios son: RUT del paciente, nombre del paciente',
          'Se crearán automáticamente doctores y servicios no existentes',
          'Verifique que los datos estén en el formato correcto antes de importar',
          'El sistema procesa aproximadamente 500-1000 registros por minuto'
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
