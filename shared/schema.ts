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
export type InsertMedicalCenter = z.infer<typeof insertMedicalCenterSchema>;

export type InsuranceType = typeof insuranceTypes.$inferSelect;
export type InsertInsuranceType = z.infer<typeof insertInsuranceTypeSchema>;

export type AgreementType = typeof agreementTypes.$inferSelect;
export type InsertAgreementType = z.infer<typeof insertAgreementTypeSchema>;
