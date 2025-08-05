import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  rut: varchar("rut").unique(),
  profile: varchar("profile").notNull().default('user'), // 'user', 'supervisor', 'admin', 'doctor'
  doctorId: varchar("doctor_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medical centers/clinics
export const medicalCenters = pgTable("medical_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  logoUrl: varchar("logo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical specialties
export const specialties = pgTable("specialties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(),
  description: text("description"),
  participationType: varchar("participation_type"), // 'individual', 'society', 'mixed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical societies
export const medicalSocieties = pgTable("medical_societies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rut: varchar("rut").notNull().unique(),
  name: varchar("name").notNull(),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  representativeRut: varchar("representative_rut"),
  representativeName: varchar("representative_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical professionals
export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rut: varchar("rut").notNull().unique(),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  specialtyId: varchar("specialty_id").references(() => specialties.id),
  hmqType: varchar("hmq_type"), // Type of HMQ
  station: varchar("station"), // Work station/department
  forasaAgreements: jsonb("fonasa_agreements"), // JSON array of agreements
  societyType: varchar("society_type"), // 'individual', 'society'
  societyRut: varchar("society_rut").references(() => medicalSocieties.rut),
  societyName: varchar("society_name"),
  paymentType: varchar("payment_type"), // 'transfer', 'check', 'deposit'
  bankAccount: varchar("bank_account"),
  bankName: varchar("bank_name"),
  accountHolderName: varchar("account_holder_name"),
  accountHolderRut: varchar("account_holder_rut"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical services/prestations
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(),
  description: text("description"),
  participationType: varchar("participation_type"), // 'individual', 'society', 'mixed'
  specialtyId: varchar("specialty_id").references(() => specialties.id),
  baseValue: decimal("base_value", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insurance types/previsiones
export const insuranceTypes = pgTable("insurance_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agreement types/convenios
export const agreementTypes = pgTable("agreement_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calculation rules - the heart of the system
export const calculationRules = pgTable("calculation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(),
  description: text("description"),
  baseRule: text("base_rule"), // Description of the base calculation rule
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  
  // Participation criteria
  participationType: varchar("participation_type"), // 'individual', 'society', 'mixed'
  specialtyId: varchar("specialty_id").references(() => specialties.id),
  serviceId: varchar("service_id").references(() => services.id),
  
  // Professional criteria
  doctorId: varchar("doctor_id").references(() => doctors.id), // For individual doctor rules
  medicalCenterId: varchar("medical_center_id").references(() => medicalCenters.id),
  agreementTypeId: varchar("agreement_type_id").references(() => agreementTypes.id),
  insuranceTypeId: varchar("insurance_type_id").references(() => insuranceTypes.id),
  societyId: varchar("society_id").references(() => medicalSocieties.id),
  
  // Schedule criteria
  scheduleType: varchar("schedule_type"), // 'regular', 'irregular', 'night'
  applicableDays: jsonb("applicable_days"), // JSON array of weekdays
  
  // Payment calculation
  paymentType: varchar("payment_type").notNull(), // 'percentage', 'fixed_amount'
  paymentValue: decimal("payment_value", { precision: 10, scale: 2 }).notNull(),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  // Future: user roles, permissions, etc.
}));

export const specialtiesRelations = relations(specialties, ({ many }) => ({
  doctors: many(doctors),
  services: many(services),
  calculationRules: many(calculationRules),
}));

export const medicalSocietiesRelations = relations(medicalSocieties, ({ many }) => ({
  doctors: many(doctors),
  calculationRules: many(calculationRules),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  specialty: one(specialties, {
    fields: [doctors.specialtyId],
    references: [specialties.id],
  }),
  calculationRules: many(calculationRules),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  specialty: one(specialties, {
    fields: [services.specialtyId],
    references: [specialties.id],
  }),
  calculationRules: many(calculationRules),
}));

export const medicalCentersRelations = relations(medicalCenters, ({ many }) => ({
  calculationRules: many(calculationRules),
}));

export const insuranceTypesRelations = relations(insuranceTypes, ({ many }) => ({
  calculationRules: many(calculationRules),
}));

export const agreementTypesRelations = relations(agreementTypes, ({ many }) => ({
  calculationRules: many(calculationRules),
}));

// Provider types (FONASA, ISAPRE, Particular)
export const providerTypes = pgTable("provider_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(),
  description: text("description"),
  systemType: varchar("system_type").notNull(), // 'fonasa', 'isapre', 'particular'
  tramo: varchar("tramo"), // For FONASA: 'A', 'B', 'C', 'D'
  copagoPercentage: decimal("copago_percentage", { precision: 5, scale: 2 }).default('0'), // Current copago (all 0% since sept 2022)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service tariffs by provider type
export const serviceTariffs = pgTable("service_tariffs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  providerTypeId: varchar("provider_type_id").notNull().references(() => providerTypes.id),
  grossAmount: decimal("gross_amount", { precision: 10, scale: 2 }).notNull(), // Monto bruto
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(), // Monto líquido
  participatedAmount: decimal("participated_amount", { precision: 10, scale: 2 }).notNull(), // Monto participado
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical attentions/consultations
export const medicalAttentions = pgTable("medical_attentions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientRut: varchar("patient_rut").notNull(),
  patientName: varchar("patient_name").notNull(),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  providerTypeId: varchar("provider_type_id").notNull().references(() => providerTypes.id),
  medicalCenterId: varchar("medical_center_id").references(() => medicalCenters.id),
  
  // Attention details
  attentionDate: date("attention_date").notNull(),
  attentionTime: varchar("attention_time"), // HH:MM format
  scheduleType: varchar("schedule_type"), // 'regular', 'irregular', 'night'
  
  // Amounts
  grossAmount: decimal("gross_amount", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  participatedAmount: decimal("participated_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Status
  status: varchar("status").notNull().default('pending'), // 'pending', 'calculated', 'paid'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment calculations (applying rules to attentions)
export const paymentCalculations = pgTable("payment_calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  attentionId: varchar("attention_id").notNull().references(() => medicalAttentions.id),
  calculationRuleId: varchar("calculation_rule_id").notNull().references(() => calculationRules.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  
  // Calculation details
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(), // Amount used for calculation
  ruleType: varchar("rule_type").notNull(), // 'percentage', 'fixed_amount'
  ruleValue: decimal("rule_value", { precision: 10, scale: 2 }).notNull(), // Rule percentage or fixed amount
  calculatedAmount: decimal("calculated_amount", { precision: 10, scale: 2 }).notNull(), // Final calculated payment
  
  // Dates
  calculationDate: timestamp("calculation_date").defaultNow(),
  periodMonth: integer("period_month").notNull(),
  periodYear: integer("period_year").notNull(),
  
  // Status
  status: varchar("status").notNull().default('calculated'), // 'calculated', 'approved', 'paid'
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Processed payments
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  
  // Payment period
  periodMonth: integer("period_month").notNull(),
  periodYear: integer("period_year").notNull(),
  
  // Payment details
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  totalAttentions: integer("total_attentions").notNull(),
  paymentMethod: varchar("payment_method"), // 'transfer', 'check', 'deposit'
  
  // Bank details (copied from doctor at payment time)
  bankAccount: varchar("bank_account"),
  bankName: varchar("bank_name"),
  accountHolderName: varchar("account_holder_name"),
  accountHolderRut: varchar("account_holder_rut"),
  
  // Status and dates
  status: varchar("status").notNull().default('pending'), // 'pending', 'processed', 'paid', 'rejected'
  paymentDate: date("payment_date"),
  processedAt: timestamp("processed_at"),
  
  // Reference numbers
  transactionReference: varchar("transaction_reference"),
  batchNumber: varchar("batch_number"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const calculationRulesRelations = relations(calculationRules, ({ one }) => ({
  specialty: one(specialties, {
    fields: [calculationRules.specialtyId],
    references: [specialties.id],
  }),
  service: one(services, {
    fields: [calculationRules.serviceId],
    references: [services.id],
  }),
  doctor: one(doctors, {
    fields: [calculationRules.doctorId],
    references: [doctors.id],
  }),
  medicalCenter: one(medicalCenters, {
    fields: [calculationRules.medicalCenterId],
    references: [medicalCenters.id],
  }),
  agreementType: one(agreementTypes, {
    fields: [calculationRules.agreementTypeId],
    references: [agreementTypes.id],
  }),
  insuranceType: one(insuranceTypes, {
    fields: [calculationRules.insuranceTypeId],
    references: [insuranceTypes.id],
  }),
  society: one(medicalSocieties, {
    fields: [calculationRules.societyId],
    references: [medicalSocieties.id],
  }),
}));

// New relations for payment system
export const providerTypesRelations = relations(providerTypes, ({ many }) => ({
  serviceTariffs: many(serviceTariffs),
  medicalAttentions: many(medicalAttentions),
}));

export const serviceTariffsRelations = relations(serviceTariffs, ({ one }) => ({
  service: one(services, {
    fields: [serviceTariffs.serviceId],
    references: [services.id],
  }),
  providerType: one(providerTypes, {
    fields: [serviceTariffs.providerTypeId],
    references: [providerTypes.id],
  }),
}));

export const medicalAttentionsRelations = relations(medicalAttentions, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [medicalAttentions.doctorId],
    references: [doctors.id],
  }),
  service: one(services, {
    fields: [medicalAttentions.serviceId],
    references: [services.id],
  }),
  providerType: one(providerTypes, {
    fields: [medicalAttentions.providerTypeId],
    references: [providerTypes.id],
  }),
  medicalCenter: one(medicalCenters, {
    fields: [medicalAttentions.medicalCenterId],
    references: [medicalCenters.id],
  }),
  paymentCalculations: many(paymentCalculations),
}));

export const paymentCalculationsRelations = relations(paymentCalculations, ({ one }) => ({
  attention: one(medicalAttentions, {
    fields: [paymentCalculations.attentionId],
    references: [medicalAttentions.id],
  }),
  calculationRule: one(calculationRules, {
    fields: [paymentCalculations.calculationRuleId],
    references: [calculationRules.id],
  }),
  doctor: one(doctors, {
    fields: [paymentCalculations.doctorId],
    references: [doctors.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  doctor: one(doctors, {
    fields: [payments.doctorId],
    references: [doctors.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
  createdAt: true,
});

export const insertSpecialtySchema = createInsertSchema(specialties).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertCalculationRuleSchema = createInsertSchema(calculationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  paymentValue: z.union([z.string(), z.number()]).transform((val) => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
});

export const insertMedicalSocietySchema = createInsertSchema(medicalSocieties).omit({
  id: true,
  createdAt: true,
});

export const insertMedicalCenterSchema = createInsertSchema(medicalCenters).omit({
  id: true,
  createdAt: true,
});

export const insertInsuranceTypeSchema = createInsertSchema(insuranceTypes).omit({
  id: true,
  createdAt: true,
});

export const insertAgreementTypeSchema = createInsertSchema(agreementTypes).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = z.infer<typeof insertSpecialtySchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type CalculationRule = typeof calculationRules.$inferSelect;
export type InsertCalculationRule = z.infer<typeof insertCalculationRuleSchema>;

export type MedicalSociety = typeof medicalSocieties.$inferSelect;
export type InsertMedicalSociety = z.infer<typeof insertMedicalSocietySchema>;

export type MedicalCenter = typeof medicalCenters.$inferSelect;

export type InsuranceType = typeof insuranceTypes.$inferSelect;
export type InsertInsuranceType = z.infer<typeof insertInsuranceTypeSchema>;

// New payment system types
export type ProviderType = typeof providerTypes.$inferSelect;
export type ServiceTariff = typeof serviceTariffs.$inferSelect;
export type MedicalAttention = typeof medicalAttentions.$inferSelect;
export type PaymentCalculation = typeof paymentCalculations.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type InsertMedicalCenter = z.infer<typeof insertMedicalCenterSchema>;

export type AgreementType = typeof agreementTypes.$inferSelect;
export type InsertAgreementType = z.infer<typeof insertAgreementTypeSchema>;
