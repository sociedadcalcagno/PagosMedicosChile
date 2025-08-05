import {
  users,
  doctors,
  specialties,
  services,
  calculationRules,
  medicalSocieties,
  medicalCenters,
  insuranceTypes,
  agreementTypes,
  type User,
  type UpsertUser,
  type Doctor,
  type InsertDoctor,
  type Specialty,
  type InsertSpecialty,
  type Service,
  type InsertService,
  type CalculationRule,
  type InsertCalculationRule,
  type MedicalSociety,
  type InsertMedicalSociety,
  type MedicalCenter,
  type InsertMedicalCenter,
  type InsuranceType,
  type InsertInsuranceType,
  type AgreementType,
  type InsertAgreementType,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Doctor operations
  getDoctors(filters?: { rut?: string; name?: string; specialtyId?: string }): Promise<Doctor[]>;
  getDoctorById(id: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: string, doctor: Partial<InsertDoctor>): Promise<Doctor>;
  deleteDoctor(id: string): Promise<void>;
  
  // Specialty operations
  getSpecialties(): Promise<Specialty[]>;
  getSpecialtyById(id: string): Promise<Specialty | undefined>;
  createSpecialty(specialty: InsertSpecialty): Promise<Specialty>;
  updateSpecialty(id: string, specialty: Partial<InsertSpecialty>): Promise<Specialty>;
  deleteSpecialty(id: string): Promise<void>;
  
  // Service operations
  getServices(filters?: { specialtyId?: string; participationType?: string }): Promise<Service[]>;
  getServiceById(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: string): Promise<void>;
  
  // Calculation rule operations
  getCalculationRules(filters?: {
    code?: string;
    participationType?: string;
    specialtyId?: string;
    isActive?: boolean;
  }): Promise<CalculationRule[]>;
  getCalculationRuleById(id: string): Promise<CalculationRule | undefined>;
  createCalculationRule(rule: InsertCalculationRule): Promise<CalculationRule>;
  updateCalculationRule(id: string, rule: Partial<InsertCalculationRule>): Promise<CalculationRule>;
  deleteCalculationRule(id: string): Promise<void>;
  
  // Medical society operations
  getMedicalSocieties(): Promise<MedicalSociety[]>;
  getMedicalSocietyById(id: string): Promise<MedicalSociety | undefined>;
  createMedicalSociety(society: InsertMedicalSociety): Promise<MedicalSociety>;
  updateMedicalSociety(id: string, society: Partial<InsertMedicalSociety>): Promise<MedicalSociety>;
  deleteMedicalSociety(id: string): Promise<void>;
  
  // Medical center operations
  getMedicalCenters(): Promise<MedicalCenter[]>;
  getMedicalCenterById(id: string): Promise<MedicalCenter | undefined>;
  createMedicalCenter(center: InsertMedicalCenter): Promise<MedicalCenter>;
  updateMedicalCenter(id: string, center: Partial<InsertMedicalCenter>): Promise<MedicalCenter>;
  deleteMedicalCenter(id: string): Promise<void>;
  
  // Insurance type operations
  getInsuranceTypes(): Promise<InsuranceType[]>;
  getInsuranceTypeById(id: string): Promise<InsuranceType | undefined>;
  createInsuranceType(type: InsertInsuranceType): Promise<InsuranceType>;
  updateInsuranceType(id: string, type: Partial<InsertInsuranceType>): Promise<InsuranceType>;
  deleteInsuranceType(id: string): Promise<void>;
  
  // Agreement type operations
  getAgreementTypes(): Promise<AgreementType[]>;
  getAgreementTypeById(id: string): Promise<AgreementType | undefined>;
  createAgreementType(type: InsertAgreementType): Promise<AgreementType>;
  updateAgreementType(id: string, type: Partial<InsertAgreementType>): Promise<AgreementType>;
  deleteAgreementType(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async linkUserToDoctor(userId: string, doctorId: string): Promise<void> {
    await db
      .update(users)
      .set({ doctorId, profile: 'doctor', updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async unlinkUserFromDoctor(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ doctorId: null, profile: 'user', updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getUserDoctor(userId: string): Promise<any> {
    const [result] = await db
      .select({
        id: doctors.id,
        rut: doctors.rut,
        name: doctors.name,
        email: doctors.email,
        specialtyId: doctors.specialtyId,
        specialtyName: specialties.name,
      })
      .from(users)
      .innerJoin(doctors, eq(users.doctorId, doctors.id))
      .leftJoin(specialties, eq(doctors.specialtyId, specialties.id))
      .where(eq(users.id, userId));
    
    return result;
  }

  // Doctor operations
  async getDoctors(filters?: { rut?: string; name?: string; specialtyId?: string }): Promise<Doctor[]> {
    let query = db.select().from(doctors);
    
    if (filters) {
      const conditions = [];
      if (filters.rut) {
        conditions.push(ilike(doctors.rut, `%${filters.rut}%`));
      }
      if (filters.name) {
        conditions.push(ilike(doctors.name, `%${filters.name}%`));
      }
      if (filters.specialtyId) {
        conditions.push(eq(doctors.specialtyId, filters.specialtyId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(asc(doctors.name)).execute();
  }

  async getDoctorById(id: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor;
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    // Limpiar societyRut y societyName si societyType es 'individual'
    const cleanedDoctor = { ...doctor };
    if (cleanedDoctor.societyType === 'individual') {
      cleanedDoctor.societyRut = null;
      cleanedDoctor.societyName = null;
    }
    // También limpiar si los valores están vacíos
    if (cleanedDoctor.societyRut === '') {
      cleanedDoctor.societyRut = null;
    }
    if (cleanedDoctor.societyName === '') {
      cleanedDoctor.societyName = null;
    }
    
    const [newDoctor] = await db.insert(doctors).values(cleanedDoctor).returning();
    return newDoctor;
  }

  async updateDoctor(id: string, doctor: Partial<InsertDoctor>): Promise<Doctor> {
    // Limpiar societyRut y societyName si societyType es 'individual'
    const cleanedDoctor = { ...doctor };
    if (cleanedDoctor.societyType === 'individual') {
      cleanedDoctor.societyRut = null;
      cleanedDoctor.societyName = null;
    }
    // También limpiar si los valores están vacíos
    if (cleanedDoctor.societyRut === '') {
      cleanedDoctor.societyRut = null;
    }
    if (cleanedDoctor.societyName === '') {
      cleanedDoctor.societyName = null;
    }
    
    const [updatedDoctor] = await db
      .update(doctors)
      .set(cleanedDoctor)
      .where(eq(doctors.id, id))
      .returning();
    return updatedDoctor;
  }

  async deleteDoctor(id: string): Promise<void> {
    await db.delete(doctors).where(eq(doctors.id, id));
  }

  // Specialty operations
  async getSpecialties(): Promise<Specialty[]> {
    return await db.select().from(specialties).orderBy(asc(specialties.name));
  }

  async getSpecialtyById(id: string): Promise<Specialty | undefined> {
    const [specialty] = await db.select().from(specialties).where(eq(specialties.id, id));
    return specialty;
  }

  async createSpecialty(specialty: InsertSpecialty): Promise<Specialty> {
    const [newSpecialty] = await db.insert(specialties).values(specialty).returning();
    return newSpecialty;
  }

  async updateSpecialty(id: string, specialty: Partial<InsertSpecialty>): Promise<Specialty> {
    const [updatedSpecialty] = await db
      .update(specialties)
      .set(specialty)
      .where(eq(specialties.id, id))
      .returning();
    return updatedSpecialty;
  }

  async deleteSpecialty(id: string): Promise<void> {
    await db.delete(specialties).where(eq(specialties.id, id));
  }

  // Medical Society operations
  async getMedicalSocieties(): Promise<any[]> {
    return await db.select().from(medicalSocieties).orderBy(asc(medicalSocieties.name));
  }

  // Service operations
  async getServices(filters?: { specialtyId?: string; participationType?: string }): Promise<Service[]> {
    let query = db.select().from(services);
    
    if (filters) {
      const conditions = [];
      if (filters.specialtyId) {
        conditions.push(eq(services.specialtyId, filters.specialtyId));
      }
      if (filters.participationType) {
        conditions.push(eq(services.participationType, filters.participationType));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(asc(services.name)).execute();
  }

  async getServiceById(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service> {
    const [updatedService] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Calculation rule operations
  async getCalculationRules(filters?: {
    code?: string;
    participationType?: string;
    specialtyId?: string;
    isActive?: boolean;
  }): Promise<CalculationRule[]> {
    let query = db.select().from(calculationRules);
    
    if (filters) {
      const conditions = [];
      if (filters.code) {
        conditions.push(ilike(calculationRules.code, `%${filters.code}%`));
      }
      if (filters.participationType) {
        conditions.push(eq(calculationRules.participationType, filters.participationType));
      }
      if (filters.specialtyId) {
        conditions.push(eq(calculationRules.specialtyId, filters.specialtyId));
      }
      if (filters.isActive !== undefined) {
        conditions.push(eq(calculationRules.isActive, filters.isActive));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(calculationRules.createdAt)).execute();
  }

  async getCalculationRuleById(id: string): Promise<CalculationRule | undefined> {
    const [rule] = await db.select().from(calculationRules).where(eq(calculationRules.id, id));
    return rule;
  }

  async createCalculationRule(rule: InsertCalculationRule): Promise<CalculationRule> {
    const [newRule] = await db.insert(calculationRules).values(rule).returning();
    return newRule;
  }

  async updateCalculationRule(id: string, rule: Partial<InsertCalculationRule>): Promise<CalculationRule> {
    const [updatedRule] = await db
      .update(calculationRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(calculationRules.id, id))
      .returning();
    return updatedRule;
  }

  async deleteCalculationRule(id: string): Promise<void> {
    await db.delete(calculationRules).where(eq(calculationRules.id, id));
  }

  // Medical society operations
  async getMedicalSocieties(): Promise<MedicalSociety[]> {
    return await db.select().from(medicalSocieties).orderBy(asc(medicalSocieties.name));
  }

  async getMedicalSocietyById(id: string): Promise<MedicalSociety | undefined> {
    const [society] = await db.select().from(medicalSocieties).where(eq(medicalSocieties.id, id));
    return society;
  }

  async createMedicalSociety(society: InsertMedicalSociety): Promise<MedicalSociety> {
    const [newSociety] = await db.insert(medicalSocieties).values(society).returning();
    return newSociety;
  }

  async updateMedicalSociety(id: string, society: Partial<InsertMedicalSociety>): Promise<MedicalSociety> {
    const [updatedSociety] = await db
      .update(medicalSocieties)
      .set(society)
      .where(eq(medicalSocieties.id, id))
      .returning();
    return updatedSociety;
  }

  async deleteMedicalSociety(id: string): Promise<void> {
    await db.delete(medicalSocieties).where(eq(medicalSocieties.id, id));
  }

  // Medical center operations
  async getMedicalCenters(): Promise<MedicalCenter[]> {
    return await db.select().from(medicalCenters).orderBy(asc(medicalCenters.name));
  }

  async getMedicalCenterById(id: string): Promise<MedicalCenter | undefined> {
    const [center] = await db.select().from(medicalCenters).where(eq(medicalCenters.id, id));
    return center;
  }

  async createMedicalCenter(center: InsertMedicalCenter): Promise<MedicalCenter> {
    const [newCenter] = await db.insert(medicalCenters).values(center).returning();
    return newCenter;
  }

  async updateMedicalCenter(id: string, center: Partial<InsertMedicalCenter>): Promise<MedicalCenter> {
    const [updatedCenter] = await db
      .update(medicalCenters)
      .set(center)
      .where(eq(medicalCenters.id, id))
      .returning();
    return updatedCenter;
  }

  async deleteMedicalCenter(id: string): Promise<void> {
    await db.delete(medicalCenters).where(eq(medicalCenters.id, id));
  }

  // Insurance type operations
  async getInsuranceTypes(): Promise<InsuranceType[]> {
    return await db.select().from(insuranceTypes).orderBy(asc(insuranceTypes.name));
  }

  async getInsuranceTypeById(id: string): Promise<InsuranceType | undefined> {
    const [type] = await db.select().from(insuranceTypes).where(eq(insuranceTypes.id, id));
    return type;
  }

  async createInsuranceType(type: InsertInsuranceType): Promise<InsuranceType> {
    const [newType] = await db.insert(insuranceTypes).values(type).returning();
    return newType;
  }

  async updateInsuranceType(id: string, type: Partial<InsertInsuranceType>): Promise<InsuranceType> {
    const [updatedType] = await db
      .update(insuranceTypes)
      .set(type)
      .where(eq(insuranceTypes.id, id))
      .returning();
    return updatedType;
  }

  async deleteInsuranceType(id: string): Promise<void> {
    await db.delete(insuranceTypes).where(eq(insuranceTypes.id, id));
  }

  // Agreement type operations
  async getAgreementTypes(): Promise<AgreementType[]> {
    return await db.select().from(agreementTypes).orderBy(asc(agreementTypes.name));
  }

  async getAgreementTypeById(id: string): Promise<AgreementType | undefined> {
    const [type] = await db.select().from(agreementTypes).where(eq(agreementTypes.id, id));
    return type;
  }

  async createAgreementType(type: InsertAgreementType): Promise<AgreementType> {
    const [newType] = await db.insert(agreementTypes).values(type).returning();
    return newType;
  }

  async updateAgreementType(id: string, type: Partial<InsertAgreementType>): Promise<AgreementType> {
    const [updatedType] = await db
      .update(agreementTypes)
      .set(type)
      .where(eq(agreementTypes.id, id))
      .returning();
    return updatedType;
  }

  async deleteAgreementType(id: string): Promise<void> {
    await db.delete(agreementTypes).where(eq(agreementTypes.id, id));
  }
}

export const storage = new DatabaseStorage();
