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
  
  // New fields for intelligent rules
  scopeType: varchar("scope_type").notNull().default('individual'), // 'individual', 'group'
  scopeGroupId: varchar("scope_group_id"), // references ruleScopeGroups
  societyRut: varchar("society_rut"), // for society participation
  societyName: varchar("society_name"), // for society participation
  
  // Schedule criteria
  scheduleType: varchar("schedule_type").default('all'), // 'all', 'regular', 'irregular', 'night'
  applicableDays: jsonb("applicable_days"), // JSON array of weekdays
  
  // Payment calculation
  paymentType: varchar("payment_type").notNull(), // 'percentage', 'fixed_amount', 'factor', 'table_accumulated', 'table_direct', 'calc_plus_fixed'
  paymentValue: decimal("payment_value", { precision: 15, scale: 2 }).notNull(), // Increased precision
  
  // Convention-specific fields
  priority: integer("priority").default(100), // Lower = evaluated first
  referenceDate: varchar("reference_date").default('execution'), // 'execution', 'payment_sale'
  combinationRule: jsonb("combination_rule"), // For complex calculation rules (tables, calc_plus_fixed)
  valueBase: varchar("value_base").default('total_collected'), // What amount to base calculation on
  exclusivityMode: varchar("exclusivity_mode").default('first_win'), // 'first_win', 'stack'
  ruleType: varchar("rule_type").default('standard'), // 'standard', 'convention', 'bonus'
  parentRuleId: varchar("parent_rule_id"), // For bonus rules - self-reference handled later
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Convention criteria - complex matching rules for conventions
export const conventionCriteria = pgTable("convention_criteria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull().references(() => calculationRules.id, { onDelete: 'cascade' }),
  criteriaKey: varchar("criteria_key").notNull(), // 'service_type', 'specialty', 'patient_role', 'day_type'
  operator: varchar("operator").notNull().default('eq'), // 'eq', 'in', 'like', 'gte', 'lte', 'between', 'regex'
  criteriaValue: text("criteria_value").notNull(), // JSON string or text value
  createdAt: timestamp("created_at").defaultNow(),
});

// Convention bonuses - additional percentage bonuses based on criteria
export const conventionBonuses = pgTable("convention_bonuses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull().references(() => calculationRules.id, { onDelete: 'cascade' }),
  description: text("description").notNull(),
  percentage: decimal("percentage", { precision: 12, scale: 4 }).notNull().default('0'), // 0.10 = +10%
  criteriaKey: varchar("criteria_key").notNull(),
  criteriaOperator: varchar("criteria_operator").notNull().default('eq'),
  criteriaValue: text("criteria_value").notNull(),
  priority: integer("priority").default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calculation audit trail - tracks all calculations performed
export const calculationAudit = pgTable("calculation_audit", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").defaultNow(),
  inputData: jsonb("input_data"),
  appliedRules: jsonb("applied_rules"),
  result: jsonb("result"),
  createdAt: timestamp("created_at").defaultNow(),
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
  grossAmount: decimal("gross_amount", { precision: 15, scale: 2 }).notNull(), // Monto bruto
  netAmount: decimal("net_amount", { precision: 15, scale: 2 }).notNull(), // Monto líquido
  participatedAmount: decimal("participated_amount", { precision: 15, scale: 2 }).notNull(), // Monto participado
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
  
  // Amounts - increased precision to handle large Chilean peso amounts
  grossAmount: decimal("gross_amount", { precision: 15, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 15, scale: 2 }).notNull(),
  participatedAmount: decimal("participated_amount", { precision: 15, scale: 2 }).notNull(),
  
  // Status
  status: varchar("status").notNull().default('pending'), // 'pending', 'calculated', 'paid'
  
  // Import-related fields
  recordType: varchar("record_type").default('participacion'), // 'participacion', 'hmq'
  participationPercentage: varchar("participation_percentage"),
  serviceName: varchar("service_name"),
  providerName: varchar("provider_name"),
  medicalSocietyId: varchar("medical_society_id"),
  medicalSocietyName: varchar("medical_society_name"),
  medicalSocietyRut: varchar("medical_society_rut"),
  doctorInternalCode: varchar("doctor_internal_code"),
  specialtyId: varchar("specialty_id"),
  
  // Payment beneficiary fields (who actually receives the payment)
  payeeRut: varchar("payee_rut"), // RUT_PAGO - quien recibe el pago
  payeeName: varchar("payee_name"), // NOMBRE_PAGADOR - nombre del beneficiario
  professionalRut: varchar("professional_rut"), // RUT_PROF - RUT del profesional que atendió
  
  // Commission and additional payment details
  commission: varchar("commission"), // COMISION
  externalId: varchar("external_id"), // ID del sistema externo (Excel/Oracle)
  
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
  baseAmount: decimal("base_amount", { precision: 15, scale: 2 }).notNull(), // Amount used for calculation
  ruleType: varchar("rule_type").notNull(), // 'percentage', 'fixed_amount'
  ruleValue: decimal("rule_value", { precision: 15, scale: 2 }).notNull(), // Rule percentage or fixed amount
  calculatedAmount: decimal("calculated_amount", { precision: 15, scale: 2 }).notNull(), // Final calculated payment
  
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
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  totalBrutAmount: decimal("total_brut_amount", { precision: 15, scale: 2 }),
  totalAttentions: integer("total_attentions").notNull(),
  paymentMethod: varchar("payment_method"), // 'transfer', 'check', 'deposit'
  
  // Payment recipient details (may differ from doctor)
  payeeRut: varchar("payee_rut"), // Actual recipient RUT (may be different from doctor RUT)
  payeeName: varchar("payee_name"), // Actual recipient name
  
  // Bank details (copied from doctor at payment time, but should match payee)
  bankAccount: varchar("bank_account"),
  bankName: varchar("bank_name"),
  accountHolderName: varchar("account_holder_name"),
  accountHolderRut: varchar("account_holder_rut"), // Should match payeeRut
  
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

export const calculationRulesRelations = relations(calculationRules, ({ one, many }) => ({
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
  scopeGroup: one(ruleScopeGroups, {
    fields: [calculationRules.scopeGroupId],
    references: [ruleScopeGroups.id],
  }),
  versions: many(ruleVersions),
  alerts: many(ruleAlerts),
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

// NEW INTELLIGENT RULES TABLES

// Rule versions for audit trail
export const ruleVersions = pgTable("rule_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull().references(() => calculationRules.id),
  snapshot: jsonb("snapshot").notNull(), // Complete rule data at time of change
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").notNull(),
});

// Rule alerts for conflicts and issues
export const ruleAlerts = pgTable("rule_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull().references(() => calculationRules.id),
  type: varchar("type").notNull(), // 'overlap', 'sum_gt_100', 'invalid_range'
  message: text("message").notNull(),
  details: jsonb("details").notNull(), // Structured alert details
  createdAt: timestamp("created_at").defaultNow(),
});

// Rule scope groups for managing collections of entities
export const ruleScopeGroups = pgTable("rule_scope_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'doctor', 'service', 'branch', 'society'
  members: jsonb("members").notNull(), // array of entity IDs
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced relations
export const ruleVersionsRelations = relations(ruleVersions, ({ one }) => ({
  rule: one(calculationRules, {
    fields: [ruleVersions.ruleId],
    references: [calculationRules.id],
  }),
}));

export const ruleAlertsRelations = relations(ruleAlerts, ({ one }) => ({
  rule: one(calculationRules, {
    fields: [ruleAlerts.ruleId],
    references: [calculationRules.id],
  }),
}));

export const ruleScopeGroupsRelations = relations(ruleScopeGroups, ({ many }) => ({
  rules: many(calculationRules),
}));


// Insert schemas for new tables
export const insertRuleVersionSchema = createInsertSchema(ruleVersions).omit({
  id: true,
  createdAt: true,
});

export const insertRuleAlertSchema = createInsertSchema(ruleAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertRuleScopeGroupSchema = createInsertSchema(ruleScopeGroups).omit({
  id: true,
  createdAt: true,
});

// Types for new tables
export type RuleVersion = typeof ruleVersions.$inferSelect;
export type InsertRuleVersion = z.infer<typeof insertRuleVersionSchema>;

export type RuleAlert = typeof ruleAlerts.$inferSelect;
export type InsertRuleAlert = z.infer<typeof insertRuleAlertSchema>;

export type RuleScopeGroup = typeof ruleScopeGroups.$inferSelect;
export type InsertRuleScopeGroup = z.infer<typeof insertRuleScopeGroupSchema>;

// Enhanced calculation rule schema with new fields
export const enhancedCalculationRuleSchema = insertCalculationRuleSchema.extend({
  scopeType: z.enum(['individual', 'group']).default('individual'),
  scopeGroupId: z.string().optional(),
  societyRut: z.string().optional(),
  societyName: z.string().optional(),
  scheduleType: z.enum(['all', 'regular', 'irregular', 'night']).default('all'),
  applicableDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
  validFrom: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  validTo: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  paymentType: z.enum(['percentage', 'fixed_amount']),
  paymentValue: z.number().refine((val) => {
    return val > 0;
  }, { message: 'Payment value must be positive' }),
}).superRefine((data, ctx) => {
  // Validation: percentage must be between 0 and 100
  if (data.paymentType === 'percentage' && (data.paymentValue < 0 || data.paymentValue > 100)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['paymentValue'],
      message: 'Percentage must be between 0 and 100',
    });
  }
  
  // Validation: valid dates
  if (data.validFrom && data.validTo && data.validFrom > data.validTo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['validTo'],
      message: 'Valid to date must be after valid from date',
    });
  }
  
  // Validation: participation type consistency
  if (data.participationType === 'individual' && !data.doctorId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['doctorId'],
      message: 'Doctor ID is required for individual participation',
    });
  }
  
  if (data.participationType === 'society' && !data.societyId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['societyId'],
      message: 'Society ID is required for society participation',
    });
  }
  
  // Validation: scope type consistency
  if (data.scopeType === 'group' && !data.scopeGroupId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['scopeGroupId'],
      message: 'Scope group ID is required when scope type is group',
    });
  }
});

export type EnhancedInsertCalculationRule = z.infer<typeof enhancedCalculationRuleSchema>;

// ========== NUEVAS TABLAS PARA CASUÍSTICA COMPLETA ==========

// Sucursales de empresas/clínicas
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(),
  medicalCenterId: varchar("medical_center_id").notNull().references(() => medicalCenters.id),
  address: text("address"),
  phone: varchar("phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Grupos de códigos de prestación
export const serviceGroups = pgTable("service_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  groupType: varchar("group_type"), // 'procedure', 'consultation', 'diagnostic'
  createdAt: timestamp("created_at").defaultNow(),
});

// Relación servicios con grupos
export const serviceGroupItems = pgTable("service_group_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceGroupId: varchar("service_group_id").notNull().references(() => serviceGroups.id),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Horarios y turnos detallados
export const scheduleDetails = pgTable("schedule_details", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull().references(() => calculationRules.id, { onDelete: 'cascade' }),
  dayType: varchar("day_type").notNull(), // 'weekday', 'weekend', 'holiday'
  specificDay: varchar("specific_day"), // 'monday', 'tuesday', etc.
  startTime: varchar("start_time"), // '08:00'
  endTime: varchar("end_time"), // '17:00'
  hoursPerShift: integer("hours_per_shift"), // 3 horas por turno
  hoursPerSchedule: integer("hours_per_schedule"), // Total horas por agenda
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reglas escalables (tabla acumulada)
export const scaleRules = pgTable("scale_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull().references(() => calculationRules.id, { onDelete: 'cascade' }),
  minQuantity: integer("min_quantity").notNull(), // 1, 3, 5
  maxQuantity: integer("max_quantity"), // null para "o más"
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(), // 70.00, 80.00, 90.00
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Planes de previsión específicos
export const insurancePlans = pgTable("insurance_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  insuranceTypeId: varchar("insurance_type_id").notNull().references(() => insuranceTypes.id),
  code: varchar("code").notNull(),
  name: varchar("name").notNull(), // 'Preferente', 'Básico', 'Premium'
  description: text("description"),
  copaymentPercentage: decimal("copayment_percentage", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Convenios específicos de pacientes
export const patientAgreements = pgTable("patient_agreements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(), // 'GES', 'CAEC', 'PARTICULAR'
  description: text("description"),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Extendemos services para incluir información detallada
export const serviceExtensions = pgTable("service_extensions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  procedureType: varchar("procedure_type"), // 'consultation', 'procedure_with_pavilion', 'diagnostic'
  requiresAnesthesia: boolean("requires_anesthesia").default(false),
  pavilionTime: integer("pavilion_time"), // minutos
  complexityLevel: varchar("complexity_level"), // 'low', 'medium', 'high'
  exemptAmount: decimal("exempt_amount", { precision: 15, scale: 2 }), // 350.000
  taxableAmount: decimal("taxable_amount", { precision: 15, scale: 2 }), // 320.000
  createdAt: timestamp("created_at").defaultNow(),
});

// Extendemos calculation_rules para soportar toda la casuística
export const calculationRuleExtensions = pgTable("calculation_rule_extensions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull().references(() => calculationRules.id, { onDelete: 'cascade' }),
  
  // Identificadores específicos
  branchId: varchar("branch_id").references(() => branches.id),
  serviceGroupId: varchar("service_group_id").references(() => serviceGroups.id),
  insurancePlanId: varchar("insurance_plan_id").references(() => insurancePlans.id),
  patientAgreementId: varchar("patient_agreement_id").references(() => patientAgreements.id),
  
  // RUTs diferenciados
  executingDoctorRut: varchar("executing_doctor_rut"),
  reportingDoctorRut: varchar("reporting_doctor_rut"),
  executingDoctorName: varchar("executing_doctor_name"),
  reportingDoctorName: varchar("reporting_doctor_name"),
  
  // Marcas y condiciones
  doctorConditionMark: varchar("doctor_condition_mark"), // 'executing', 'reporting'
  isResidentDoctor: boolean("is_resident_doctor").default(false),
  
  // Proceso y tipo
  processType: varchar("process_type"), // 'direct', 'production_participation'
  
  // Fechas específicas
  executionDate: date("execution_date"),
  salePaymentDate: date("sale_payment_date"),
  
  // Valores detallados
  exemptValue: decimal("exempt_value", { precision: 15, scale: 2 }),
  taxableValue: decimal("taxable_value", { precision: 15, scale: 2 }),
  totalCollected: decimal("total_collected", { precision: 15, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relaciones
export const branchesRelations = relations(branches, ({ one, many }) => ({
  medicalCenter: one(medicalCenters, {
    fields: [branches.medicalCenterId],
    references: [medicalCenters.id],
  }),
  rules: many(calculationRuleExtensions),
}));

export const serviceGroupsRelations = relations(serviceGroups, ({ many }) => ({
  items: many(serviceGroupItems),
  rules: many(calculationRuleExtensions),
}));

export const serviceGroupItemsRelations = relations(serviceGroupItems, ({ one }) => ({
  serviceGroup: one(serviceGroups, {
    fields: [serviceGroupItems.serviceGroupId],
    references: [serviceGroups.id],
  }),
  service: one(services, {
    fields: [serviceGroupItems.serviceId],
    references: [services.id],
  }),
}));

export const scheduleDetailsRelations = relations(scheduleDetails, ({ one }) => ({
  rule: one(calculationRules, {
    fields: [scheduleDetails.ruleId],
    references: [calculationRules.id],
  }),
}));

export const scaleRulesRelations = relations(scaleRules, ({ one }) => ({
  rule: one(calculationRules, {
    fields: [scaleRules.ruleId],
    references: [calculationRules.id],
  }),
}));

export const insurancePlansRelations = relations(insurancePlans, ({ one, many }) => ({
  insuranceType: one(insuranceTypes, {
    fields: [insurancePlans.insuranceTypeId],
    references: [insuranceTypes.id],
  }),
  rules: many(calculationRuleExtensions),
}));

export const patientAgreementsRelations = relations(patientAgreements, ({ many }) => ({
  rules: many(calculationRuleExtensions),
}));

export const serviceExtensionsRelations = relations(serviceExtensions, ({ one }) => ({
  service: one(services, {
    fields: [serviceExtensions.serviceId],
    references: [services.id],
  }),
}));

export const calculationRuleExtensionsRelations = relations(calculationRuleExtensions, ({ one }) => ({
  rule: one(calculationRules, {
    fields: [calculationRuleExtensions.ruleId],
    references: [calculationRules.id],
  }),
  branch: one(branches, {
    fields: [calculationRuleExtensions.branchId],
    references: [branches.id],
  }),
  serviceGroup: one(serviceGroups, {
    fields: [calculationRuleExtensions.serviceGroupId],
    references: [serviceGroups.id],
  }),
  insurancePlan: one(insurancePlans, {
    fields: [calculationRuleExtensions.insurancePlanId],
    references: [insurancePlans.id],
  }),
  patientAgreement: one(patientAgreements, {
    fields: [calculationRuleExtensions.patientAgreementId],
    references: [patientAgreements.id],
  }),
}));

// Esquemas Zod para las nuevas tablas
export const insertBranchSchema = createInsertSchema(branches);
export const insertServiceGroupSchema = createInsertSchema(serviceGroups);
export const insertServiceGroupItemSchema = createInsertSchema(serviceGroupItems);
export const insertScheduleDetailSchema = createInsertSchema(scheduleDetails);
export const insertScaleRuleSchema = createInsertSchema(scaleRules);
export const insertInsurancePlanSchema = createInsertSchema(insurancePlans);
export const insertPatientAgreementSchema = createInsertSchema(patientAgreements);
export const insertServiceExtensionSchema = createInsertSchema(serviceExtensions);
export const insertCalculationRuleExtensionSchema = createInsertSchema(calculationRuleExtensions);

// Tipos TypeScript
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;

export type ServiceGroup = typeof serviceGroups.$inferSelect;
export type InsertServiceGroup = z.infer<typeof insertServiceGroupSchema>;

export type ServiceGroupItem = typeof serviceGroupItems.$inferSelect;
export type InsertServiceGroupItem = z.infer<typeof insertServiceGroupItemSchema>;

export type ScheduleDetail = typeof scheduleDetails.$inferSelect;
export type InsertScheduleDetail = z.infer<typeof insertScheduleDetailSchema>;

export type ScaleRule = typeof scaleRules.$inferSelect;
export type InsertScaleRule = z.infer<typeof insertScaleRuleSchema>;

export type InsurancePlan = typeof insurancePlans.$inferSelect;
export type InsertInsurancePlan = z.infer<typeof insertInsurancePlanSchema>;

export type PatientAgreement = typeof patientAgreements.$inferSelect;
export type InsertPatientAgreement = z.infer<typeof insertPatientAgreementSchema>;

export type ServiceExtension = typeof serviceExtensions.$inferSelect;
export type InsertServiceExtension = z.infer<typeof insertServiceExtensionSchema>;

export type CalculationRuleExtension = typeof calculationRuleExtensions.$inferSelect;
export type InsertCalculationRuleExtension = z.infer<typeof insertCalculationRuleExtensionSchema>;
