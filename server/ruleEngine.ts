import { storage } from './storage.js';

export interface CalculationRule {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  validFrom: string;
  validTo: string;
  participationType: string | null;
  specialtyId?: string | null;
  serviceId?: string | null;
  doctorId?: string | null;
  societyId?: string | null;
  paymentType: string;
  paymentValue: number | string;
  scheduleType?: string | null;
  applicableDays?: string[] | null;
  isActive: boolean;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface RuleSimulationRequest {
  date: string;
  specialtyId?: string;
  doctorId?: string;
  societyId?: string;
  serviceId?: string;
  baseAmount: number;
  scheduleType?: string;
  weekday?: string;
}

export interface RuleSimulationResponse {
  selectedRuleId: string | null;
  applied: {
    paymentType: string;
    paymentValue: number;
  } | null;
  calculatedPayment: number;
  explanation: string;
  conflictingRules?: CalculationRule[];
}

export interface RuleConflict {
  ruleId: string;
  reason: string;
  fields: string[];
}

export interface RuleConflictError {
  code: "RULE_CONFLICT";
  conflicts: RuleConflict[];
}

export class IntelligentRuleEngine {
  
  /**
   * Simulates rule application for given criteria with intelligent matching
   */
  async simulateRule(request: RuleSimulationRequest): Promise<RuleSimulationResponse> {
    const date = new Date(request.date);
    const weekday = request.weekday || this.getWeekdayFromDate(date);
    
    try {
      console.log(`[RuleEngine] Starting simulation with criteria:`, {
        specialtyId: request.specialtyId,
        doctorId: request.doctorId,
        baseAmount: request.baseAmount,
        scheduleType: request.scheduleType,
        date: request.date
      });

      // Get applicable rules with intelligent matching
      const applicableRules = await this.getApplicableRules({
        ...request,
        date: request.date,
        weekday
      });
      
      if (applicableRules.length === 0) {
        console.log(`[RuleEngine] No applicable rules found`);
        return {
          selectedRuleId: null,
          applied: null,
          calculatedPayment: 0,
          explanation: "❌ No se encontraron reglas aplicables para los criterios especificados. Verifique la especialidad, fechas de vigencia y configuración de reglas."
        };
      }
      
      // Sort by specificity and resolve conflicts intelligently
      const selectedRule = this.resolveRuleConflicts(applicableRules);
      const conflictingRules = applicableRules.filter(rule => rule.id !== selectedRule.id);
      
      // Calculate payment with rounding
      const calculatedPayment = this.calculatePayment(request.baseAmount, selectedRule);
      
      // Generate intelligent explanation
      const explanation = await this.generateExplanation(selectedRule, applicableRules, request.baseAmount);
      
      console.log(`[RuleEngine] Selected rule: ${selectedRule.code}, calculated: $${calculatedPayment.toLocaleString('es-CL')}`);
      
      return {
        selectedRuleId: selectedRule.id,
        applied: {
          paymentType: selectedRule.paymentType,
          paymentValue: parseFloat(selectedRule.paymentValue.toString())
        },
        calculatedPayment,
        explanation,
        conflictingRules: conflictingRules.length > 0 ? conflictingRules : undefined
      };
      
    } catch (error) {
      console.error('Error in rule simulation:', error);
      return {
        selectedRuleId: null,
        applied: null,
        calculatedPayment: 0,
        explanation: `❌ Error al simular reglas: ${error instanceof Error ? error.message : 'Error desconocido'}. Contacte al administrador del sistema.`
      };
    }
  }

  /**
   * Gets applicable rules based on criteria with intelligent matching
   */
  async getApplicableRules(request: RuleSimulationRequest & { date: string; weekday: string }): Promise<CalculationRule[]> {
    const rawRules = await storage.getCalculationRules({ isActive: true });
    
    // Type conversion for applicableDays and isActive
    const allRules: CalculationRule[] = rawRules.map(rule => ({
      ...rule,
      applicableDays: Array.isArray(rule.applicableDays) ? rule.applicableDays as string[] : null,
      isActive: rule.isActive ?? true
    }));
    
    console.log(`[RuleEngine] Evaluating ${allRules.length} total rules`);
    console.log(`[RuleEngine] Request criteria:`, {
      specialtyId: request.specialtyId,
      doctorId: request.doctorId,
      serviceId: request.serviceId,
      scheduleType: request.scheduleType,
      date: request.date
    });
    
    const applicableRules = allRules.filter(rule => {
      console.log(`[RuleEngine] Evaluating rule: ${rule.code} (${rule.name})`);
      
      // Check if rule is active
      if (!rule.isActive) {
        console.log(`  ❌ Rule inactive`);
        return false;
      }
      
      // Check valid date range
      const requestDate = new Date(request.date);
      const validFrom = new Date(rule.validFrom);
      const validTo = new Date(rule.validTo);
      if (validFrom > requestDate) {
        console.log(`  ❌ Not yet valid (starts ${validFrom.toISOString().split('T')[0]})`);
        return false;
      }
      if (validTo < requestDate) {
        console.log(`  ❌ Expired (ended ${validTo.toISOString().split('T')[0]})`);
        return false;
      }
      
      // INTELLIGENT MATCHING: Be more permissive with specialty matching
      if (request.specialtyId && rule.specialtyId) {
        if (rule.specialtyId !== request.specialtyId) {
          console.log(`  ❌ Specialty mismatch: rule=${rule.specialtyId}, request=${request.specialtyId}`);
          return false;
        }
      } else if (!request.specialtyId && rule.specialtyId) {
        console.log(`  ⚠️  Rule has specialty ${rule.specialtyId} but no specialty requested`);
        // Don't exclude - rule may be more general
      }
      // If rule has no specialty specified, it applies to all specialties
      
      // Smart participation type matching
      if (rule.participationType && rule.participationType !== 'mixed') {
        const requestParticipation = request.doctorId ? 'individual' : 'society';
        if (rule.participationType !== requestParticipation) {
          console.log(`  ⚠️  Participation type preference: rule=${rule.participationType}, inferred=${requestParticipation}`);
          // Don't exclude yet - lower priority in conflict resolution
        }
      }
      
      // Service matching - null/empty means "applies to all services"
      if (request.serviceId && rule.serviceId && rule.serviceId !== request.serviceId) {
        console.log(`  ⚠️  Service mismatch: rule=${rule.serviceId}, request=${request.serviceId}`);
        // Don't exclude - service specificity affects priority
      }
      
      // Doctor matching - specific doctor rules take precedence
      if (request.doctorId && rule.doctorId && rule.doctorId !== request.doctorId) {
        console.log(`  ⚠️  Doctor mismatch: rule=${rule.doctorId}, request=${request.doctorId}`);
        // Don't exclude - general rules can still apply
      }
      
      // Schedule type matching - 'all' or null means applies to all schedules
      if (request.scheduleType && rule.scheduleType && 
          rule.scheduleType !== 'all' && rule.scheduleType !== request.scheduleType) {
        console.log(`  ⚠️  Schedule type mismatch: rule=${rule.scheduleType}, request=${request.scheduleType}`);
        // Don't exclude - affects priority only
      }
      
      // Day of week matching - empty means applies to all days
      if (rule.applicableDays && rule.applicableDays.length > 0) {
        if (!rule.applicableDays.includes(request.weekday)) {
          console.log(`  ❌ Weekday mismatch: rule=${rule.applicableDays.join(',')}, request=${request.weekday}`);
          return false;
        }
      }
      
      console.log(`  ✅ Rule ${rule.code} is APPLICABLE`);
      return true;
    });
    
    console.log(`[RuleEngine] Found ${applicableRules.length} applicable rules:`, 
      applicableRules.map(r => `${r.code} (${r.paymentType}: ${r.paymentValue})`));
    
    return applicableRules;
  }

  /**
   * Resolves conflicts between multiple applicable rules with intelligence
   */
  resolveRuleConflicts(rules: CalculationRule[]): CalculationRule {
    if (rules.length === 1) return rules[0];
    
    console.log(`[RuleEngine] Resolving conflicts between ${rules.length} rules`);
    
    const sortedRules = rules.sort((a, b) => {
      let scoreA = this.calculateRuleSpecificity(a);
      let scoreB = this.calculateRuleSpecificity(b);
      
      console.log(`[RuleEngine] Rule ${a.code} specificity: ${scoreA}, Rule ${b.code} specificity: ${scoreB}`);
      
      // Higher specificity wins
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      
      // If same specificity, prefer higher payment value (better for medical professional)
      const valueA = this.getRuleMonetaryValue(a);
      const valueB = this.getRuleMonetaryValue(b);
      
      console.log(`[RuleEngine] Rule ${a.code} value: $${valueA}, Rule ${b.code} value: $${valueB}`);
      
      return valueB - valueA;
    });
    
    const selectedRule = sortedRules[0];
    console.log(`[RuleEngine] Selected rule: ${selectedRule.code} (${selectedRule.name})`);
    
    return selectedRule;
  }

  /**
   * Calculates rule specificity score with intelligent weighting
   */
  calculateRuleSpecificity(rule: CalculationRule): number {
    let score = 0;
    
    // Doctor-specific rules are most specific (highest priority)
    if (rule.doctorId) score += 1000;
    
    // Service-specific rules (high priority)
    if (rule.serviceId) score += 500;
    
    // Participation type specific (medium-high priority)
    if (rule.participationType === 'individual') score += 200;
    if (rule.participationType === 'society') score += 150;
    // Mixed gets lower score as it's more general
    
    // Schedule-specific rules (medium priority)
    if (rule.scheduleType && rule.scheduleType !== 'all') {
      score += 100;
      // Night shifts get higher priority (typically higher pay)
      if (rule.scheduleType === 'night') score += 50;
    }
    
    // Day-specific rules (lower priority)
    if (rule.applicableDays && rule.applicableDays.length > 0) {
      score += 25;
      // More specific if fewer days
      score += Math.max(0, 7 - rule.applicableDays.length) * 5;
      // Weekend rules get higher priority
      const hasWeekend = rule.applicableDays.some(day => ['saturday', 'sunday'].includes(day));
      if (hasWeekend) score += 30;
    }
    
    // Society-specific rules
    if (rule.societyId) score += 75;
    
    // Newer rules get slight preference (for version control)
    if (rule.createdAt) {
      const daysSinceCreation = (Date.now() - new Date(rule.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 30 - daysSinceCreation * 0.1); // Slight boost for newer rules
    }
    
    return score;
  }

  /**
   * Calculates payment amount based on rule with intelligent rounding
   */
  calculatePayment(baseAmount: number, rule: CalculationRule): number {
    let amount = 0;
    
    if (rule.paymentType === 'table_accumulated') {
      // Handle escalated payments based on combinationRule
      const ruleWithCombination = rule as any;
      if (ruleWithCombination.combinationRule && typeof ruleWithCombination.combinationRule === 'object') {
        const combination = ruleWithCombination.combinationRule as any;
        if (combination.type === 'table_accumulated' && combination.scales && Array.isArray(combination.scales)) {
          // Find applicable percentage based on amount
          let appliedPercentage = 60; // default
          for (const scale of combination.scales) {
            if (baseAmount >= scale.from && (scale.to === undefined || baseAmount <= scale.to)) {
              appliedPercentage = scale.percentage;
              break;
            }
          }
          amount = (baseAmount * appliedPercentage) / 100;
        } else {
          // Fallback to basic percentage
          const percentage = parseFloat(rule.paymentValue.toString());
          amount = (baseAmount * percentage) / 100;
        }
      } else {
        // Fallback to basic percentage
        const percentage = parseFloat(rule.paymentValue.toString());
        amount = (baseAmount * percentage) / 100;
      }
    } else if (rule.paymentType === 'percentage') {
      const percentage = parseFloat(rule.paymentValue.toString());
      amount = (baseAmount * percentage) / 100;
    } else {
      amount = parseFloat(rule.paymentValue.toString());
    }
    
    // Round to nearest peso for practical purposes
    return Math.round(amount);
  }
  
  /**
   * Gets monetary value of rule for comparison purposes
   */
  getRuleMonetaryValue(rule: CalculationRule): number {
    if (rule.paymentType === 'percentage') {
      // Assume standard consultation fee of 100,000 CLP for comparison
      return (100000 * parseFloat(rule.paymentValue.toString())) / 100;
    } else {
      return parseFloat(rule.paymentValue.toString());
    }
  }

  /**
   * Generates intelligent, comprehensive explanation of rule selection with all convention parameters
   */
  async generateExplanation(selectedRule: CalculationRule, allApplicableRules: CalculationRule[], baseAmount: number): Promise<string> {
    const parts = [];
    const criteria = [];
    
    parts.push(`✅ Se aplicó la regla "${selectedRule.name}" (${selectedRule.code})`);
    
    try {
      // Get comprehensive rule details for convention rules
      if ((selectedRule as any).ruleType === 'convention') {
        const conventionDetails = await this.getConventionDetails(selectedRule.id);
        
        // Basic criteria
        if (selectedRule.doctorId && conventionDetails.doctor) {
          criteria.push(`específica para Dr. ${conventionDetails.doctor.name} (RUT: ${conventionDetails.doctor.rut})`);
        }
        if (selectedRule.serviceId && conventionDetails.service) {
          criteria.push(`específica para ${conventionDetails.service.name} (${conventionDetails.service.code})`);
        }
        if (selectedRule.specialtyId && conventionDetails.specialty) {
          criteria.push(`en especialidad ${conventionDetails.specialty.name}`);
        }
        
        // Extended criteria for conventions
        if (conventionDetails.extension) {
          const ext = conventionDetails.extension;
          
          if (conventionDetails.medicalCenter) {
            criteria.push(`en ${conventionDetails.medicalCenter.name}`);
          }
          if (conventionDetails.branch) {
            criteria.push(`sucursal ${conventionDetails.branch.name}`);
          }
          if (conventionDetails.insurancePlan) {
            criteria.push(`previsión ${conventionDetails.insurancePlan.name}`);
          }
          if (conventionDetails.patientAgreement) {
            criteria.push(`convenio ${conventionDetails.patientAgreement.name}`);
          }
          if (conventionDetails.serviceGroup) {
            criteria.push(`grupo "${conventionDetails.serviceGroup.name}"`);
          }
          
          // Doctor condition details
          if (ext.doctor_condition_mark === 'executing') {
            criteria.push("médico ejecutante");
          } else if (ext.doctor_condition_mark === 'reporting') {
            criteria.push("médico informante");
          }
          
          if (ext.is_resident_doctor === false) {
            criteria.push("médico NO residente");
          }
          
          // Process type
          if (ext.process_type) {
            const processNames: Record<string, string> = {
              'production_participation': 'participación por producción',
              'fixed_payment': 'pago fijo',
              'bonus_payment': 'bono adicional'
            };
            criteria.push(`proceso: ${processNames[ext.process_type] || ext.process_type}`);
          }
        }
        
        // Service extension details
        if (conventionDetails.serviceExtension) {
          const svcExt = conventionDetails.serviceExtension;
          if (svcExt.procedure_type === 'procedure_with_pavilion') {
            criteria.push(`procedimiento con pabellón (${svcExt.pavilion_time} min)`);
          }
          if (svcExt.requires_anesthesia) {
            criteria.push("requiere anestesia");
          }
          if (svcExt.complexity_level) {
            criteria.push(`complejidad ${svcExt.complexity_level}`);
          }
        }
        
        // Schedule details
        if (conventionDetails.scheduleDetails && conventionDetails.scheduleDetails.length > 0) {
          const schedule = conventionDetails.scheduleDetails[0];
          const dayNames: Record<string, string> = {
            'monday': 'lunes', 'tuesday': 'martes', 'wednesday': 'miércoles',
            'thursday': 'jueves', 'friday': 'viernes', 'saturday': 'sábado', 'sunday': 'domingo'
          };
          criteria.push(`día ${dayNames[schedule.specific_day]} ${schedule.start_time}-${schedule.end_time} (${schedule.hours_per_shift}h/turno)`);
        }
        
        if (criteria.length > 0) {
          parts.push(`porque es ${criteria.join(', ')}`);
        }
        
        // Detailed payment calculation explanation
        if (selectedRule.paymentType === 'table_accumulated') {
          // Check if it has monto-based scaling (combinationRule) or quantity-based scaling (scaleRules)
          const ruleWithCombination = selectedRule as any;
          if (ruleWithCombination.combinationRule && typeof ruleWithCombination.combinationRule === 'object') {
            const combination = ruleWithCombination.combinationRule as any;
            if (combination.type === 'table_accumulated' && combination.scales && Array.isArray(combination.scales)) {
              parts.push(`\n\n📊 **SISTEMA ESCALABLE POR MONTO:**`);
              combination.scales.forEach((scale: any) => {
                if (scale.to && scale.to < 999999999) {
                  parts.push(`   • $${scale.from.toLocaleString('es-CL')} - $${scale.to.toLocaleString('es-CL')}: ${scale.percentage}%`);
                } else {
                  parts.push(`   • Más de $${scale.from.toLocaleString('es-CL')}: ${scale.percentage}%`);
                }
              });
              
              // Current calculation with escalation logic
              let appliedPercentage = 60; // default
              for (const scale of combination.scales) {
                if (baseAmount >= scale.from && (scale.to === undefined || baseAmount <= scale.to)) {
                  appliedPercentage = scale.percentage;
                  break;
                }
              }
              
              const calculatedAmount = Math.round((baseAmount * appliedPercentage) / 100);
              parts.push(`\n🎯 **APLICACIÓN DEL ESCALONAMIENTO:**`);
              parts.push(`   • Monto a evaluar: $${baseAmount.toLocaleString('es-CL')}`);
              
              // Find which range applies
              for (const scale of combination.scales) {
                if (baseAmount >= scale.from && (scale.to === undefined || baseAmount <= scale.to)) {
                  if (scale.to && scale.to < 999999999) {
                    parts.push(`   • Cae en rango: $${scale.from.toLocaleString('es-CL')} - $${scale.to.toLocaleString('es-CL')}`);
                  } else {
                    parts.push(`   • Cae en rango: Más de $${scale.from.toLocaleString('es-CL')}`);
                  }
                  parts.push(`   • Porcentaje aplicado: ${scale.percentage}%`);
                  break;
                }
              }
              
              parts.push(`\n💰 **CÁLCULO FINAL:** ${appliedPercentage}% de $${baseAmount.toLocaleString('es-CL')} = $${calculatedAmount.toLocaleString('es-CL')}`);
            }
          } else if (conventionDetails.scaleRules && conventionDetails.scaleRules.length > 0) {
            // Quantity-based scaling (original logic)
            parts.push(`\n\n📊 **SISTEMA DE TABLA ESCALABLE POR CANTIDAD:**`);
            conventionDetails.scaleRules.forEach((scale: any) => {
              const rangeText = scale.max_quantity 
                ? `${scale.min_quantity}-${scale.max_quantity} procedimientos`
                : `${scale.min_quantity}+ procedimientos`;
              parts.push(`   • ${rangeText}: ${scale.percentage}%`);
            });
            
            // Current calculation 
            const percentage = parseFloat(selectedRule.paymentValue.toString());
            const calculatedAmount = Math.round((baseAmount * percentage) / 100);
            parts.push(`\n💰 Para 1 procedimiento: ${percentage}% de $${baseAmount.toLocaleString('es-CL')} = $${calculatedAmount.toLocaleString('es-CL')}`);
          }
          
          // Values breakdown if available
          if (conventionDetails.extension) {
            const ext = conventionDetails.extension;
            if (ext.exempt_value && ext.taxable_value) {
              parts.push(`\n📋 **DESGLOSE DE VALORES:**`);
              parts.push(`   • Valor exento: $${parseFloat(ext.exempt_value.toString()).toLocaleString('es-CL')}`);
              parts.push(`   • Valor afecto: $${parseFloat(ext.taxable_value.toString()).toLocaleString('es-CL')}`);
              parts.push(`   • Total recaudado: $${parseFloat(ext.total_collected.toString()).toLocaleString('es-CL')}`);
            }
          }
          
        } else if (selectedRule.paymentType === 'percentage') {
          const percentage = parseFloat(selectedRule.paymentValue.toString());
          const calculatedAmount = Math.round((baseAmount * percentage) / 100);
          parts.push(`💰 Calcula ${percentage}% del monto base ($${baseAmount.toLocaleString('es-CL')}) = $${calculatedAmount.toLocaleString('es-CL')}`);
        } else {
          const fixedAmount = parseFloat(selectedRule.paymentValue.toString());
          parts.push(`💰 Monto fijo de $${fixedAmount.toLocaleString('es-CL')}`);
        }
        
        // Validity and dates
        parts.push(`\n📅 **VIGENCIA:** ${selectedRule.validFrom} hasta ${selectedRule.validTo}`);
        if (conventionDetails.extension && conventionDetails.extension.execution_date) {
          parts.push(`   • Fecha ejecución: ${conventionDetails.extension.execution_date}`);
        }
        
      } else {
        // Standard rule explanation (existing logic for non-convention rules)
        if (selectedRule.doctorId) {
          criteria.push("específica para este doctor");
        }
        if (selectedRule.serviceId) {
          criteria.push("específica para este servicio médico");
        }
        if (selectedRule.participationType === 'individual') {
          criteria.push("para atención individual");
        } else if (selectedRule.participationType === 'society') {
          criteria.push("para atención en sociedad médica");
        }
        
        if (criteria.length > 0) {
          parts.push(`porque es ${criteria.join(', ')}`);
        }
        
        if (selectedRule.paymentType === 'percentage') {
          const percentage = parseFloat(selectedRule.paymentValue.toString());
          const calculatedAmount = Math.round((baseAmount * percentage) / 100);
          parts.push(`💰 Calcula ${percentage}% del monto base ($${baseAmount.toLocaleString('es-CL')}) = $${calculatedAmount.toLocaleString('es-CL')}`);
        } else {
          const fixedAmount = parseFloat(selectedRule.paymentValue.toString());
          parts.push(`💰 Monto fijo de $${fixedAmount.toLocaleString('es-CL')}`);
        }
      }
    } catch (error) {
      console.error('Error generating detailed explanation:', error);
      // Fallback to basic explanation
      criteria.push("aplicable según criterios básicos");
      parts.push(`porque es ${criteria.join(', ')}`);
    }
    
    // Mention conflicts if any
    if (allApplicableRules.length > 1) {
      const conflictCount = allApplicableRules.length - 1;
      parts.push(`\n⚠️ Se encontraron ${allApplicableRules.length} reglas aplicables. Se seleccionó la más específica y beneficiosa.`);
      
      if (conflictCount <= 3) {
        const otherRules = allApplicableRules.filter(r => r.id !== selectedRule.id).map(r => r.name).join(', ');
        parts.push(`Otras reglas consideradas: ${otherRules}`);
      }
    } else {
      parts.push(`\n🎯 Regla única aplicable para estos criterios.`);
    }
    
    return parts.join('. ') + '.';
  }

  /**
   * Gets comprehensive convention details from all related tables
   */
  async getConventionDetails(ruleId: string): Promise<any> {
    try {
      // Get rule extensions
      const extensionQuery = `
        SELECT 
          ext.*,
          mc.name as medical_center_name,
          br.name as branch_name,
          sg.name as service_group_name,
          ip.name as insurance_plan_name,
          pa.name as patient_agreement_name
        FROM calculation_rule_extensions ext
        LEFT JOIN medical_centers mc ON ext.branch_id = mc.id
        LEFT JOIN branches br ON ext.branch_id = br.id
        LEFT JOIN service_groups sg ON ext.service_group_id = sg.id
        LEFT JOIN insurance_plans ip ON ext.insurance_plan_id = ip.id
        LEFT JOIN patient_agreements pa ON ext.patient_agreement_id = pa.id
        WHERE ext.rule_id = $1
        LIMIT 1
      `;
      
      const extensionResult = await storage.query(extensionQuery, [ruleId]);
      const extension = extensionResult[0] || null;
      
      // Get related entities
      const rule = await storage.getCalculationRuleById(ruleId);
      if (!rule) return { extension };
      
      const [
        doctor,
        specialty, 
        service,
        medicalCenter,
        scaleRules,
        scheduleDetails,
        serviceExtension
      ] = await Promise.all([
        rule.doctorId ? storage.getDoctorById(rule.doctorId) : null,
        rule.specialtyId ? storage.getSpecialtyById(rule.specialtyId) : null,
        rule.serviceId ? storage.getServiceById(rule.serviceId) : null,
        rule.medicalCenterId ? storage.getMedicalCenterById(rule.medicalCenterId) : null,
        this.getScaleRules(ruleId),
        this.getScheduleDetails(ruleId),
        rule.serviceId ? this.getServiceExtension(rule.serviceId) : null
      ]);
      
      return {
        extension,
        doctor,
        specialty,
        service,
        medicalCenter,
        branch: extension ? { name: extension.branch_name } : null,
        serviceGroup: extension ? { name: extension.service_group_name } : null,
        insurancePlan: extension ? { name: extension.insurance_plan_name } : null,
        patientAgreement: extension ? { name: extension.patient_agreement_name } : null,
        scaleRules,
        scheduleDetails,
        serviceExtension
      };
    } catch (error) {
      console.error('Error getting convention details:', error);
      return { extension: null };
    }
  }

  /**
   * Gets scale rules for a convention
   */
  async getScaleRules(ruleId: string): Promise<any[]> {
    try {
      const query = `
        SELECT * FROM scale_rules 
        WHERE rule_id = $1 
        ORDER BY min_quantity ASC
      `;
      return await storage.query(query, [ruleId]);
    } catch (error) {
      console.error('Error getting scale rules:', error);
      return [];
    }
  }

  /**
   * Gets schedule details for a convention
   */
  async getScheduleDetails(ruleId: string): Promise<any[]> {
    try {
      const query = `
        SELECT * FROM schedule_details 
        WHERE rule_id = $1 AND is_active = true
        ORDER BY specific_day
      `;
      return await storage.query(query, [ruleId]);
    } catch (error) {
      console.error('Error getting schedule details:', error);
      return [];
    }
  }

  /**
   * Gets service extension details
   */
  async getServiceExtension(serviceId: string): Promise<any> {
    try {
      const query = `
        SELECT * FROM service_extensions 
        WHERE service_id = $1 
        LIMIT 1
      `;
      const result = await storage.query(query, [serviceId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting service extension:', error);
      return null;
    }
  }

  /**
   * Gets weekday from date
   */
  getWeekdayFromDate(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Detects conflicts between rules
   */
  async detectConflicts(): Promise<RuleConflictError[]> {
    const rawRules = await storage.getCalculationRules({ isActive: true });
    const allRules: CalculationRule[] = rawRules.map(rule => ({
      ...rule,
      applicableDays: Array.isArray(rule.applicableDays) ? rule.applicableDays as string[] : null
    }));
    const conflicts: RuleConflictError[] = [];
    
    for (let i = 0; i < allRules.length; i++) {
      for (let j = i + 1; j < allRules.length; j++) {
        const ruleA = allRules[i];
        const ruleB = allRules[j];
        
        const conflict = this.findRuleConflict(ruleA, ruleB);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Finds conflicts between two specific rules
   */
  findRuleConflict(ruleA: CalculationRule, ruleB: CalculationRule): RuleConflictError | null {
    // Skip if different specialties - no conflict
    if (ruleA.specialtyId !== ruleB.specialtyId) return null;
    
    // Skip if date ranges don't overlap
    if (new Date(ruleA.validTo) < new Date(ruleB.validFrom) ||
        new Date(ruleB.validTo) < new Date(ruleA.validFrom)) {
      return null;
    }
    
    const conflictingFields: string[] = [];
    
    // Check overlapping criteria
    if (this.criteriaOverlap(ruleA, ruleB, 'doctorId')) conflictingFields.push('doctor');
    if (this.criteriaOverlap(ruleA, ruleB, 'serviceId')) conflictingFields.push('service');
    if (this.criteriaOverlap(ruleA, ruleB, 'participationType')) conflictingFields.push('participation');
    if (this.criteriaOverlap(ruleA, ruleB, 'scheduleType')) conflictingFields.push('schedule');
    
    if (conflictingFields.length > 0) {
      return {
        code: "RULE_CONFLICT",
        conflicts: [
          {
            ruleId: ruleA.id,
            reason: `Conflicts with ${ruleB.code}`,
            fields: conflictingFields
          },
          {
            ruleId: ruleB.id,
            reason: `Conflicts with ${ruleA.code}`,
            fields: conflictingFields
          }
        ]
      };
    }
    
    return null;
  }

  /**
   * Checks if two rules have overlapping criteria
   */
  criteriaOverlap(ruleA: CalculationRule, ruleB: CalculationRule, field: keyof CalculationRule): boolean {
    const valueA = ruleA[field];
    const valueB = ruleB[field];
    
    // If either is null/undefined, they don't conflict (one is more general)
    if (!valueA || !valueB) return false;
    
    // For arrays (like applicable days)
    if (Array.isArray(valueA) && Array.isArray(valueB)) {
      return valueA.some(item => valueB.includes(item));
    }
    
    // For simple values
    return valueA === valueB;
  }
}

// Export singleton instance
export const ruleEngine = new IntelligentRuleEngine();