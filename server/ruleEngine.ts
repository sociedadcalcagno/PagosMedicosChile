import { SimpleRuleStorage } from './simpleRuleStorage.js';

export interface CalculationRule {
  id: string;
  code: string;
  name: string;
  description?: string;
  validFrom: string;
  validTo: string;
  participationType: string;
  specialtyId?: string;
  serviceId?: string;
  doctorId?: string;
  societyId?: string;
  paymentType: string;
  paymentValue: number | string;
  scheduleType?: string;
  applicableDays?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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
        date,
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
      const explanation = this.generateExplanation(selectedRule, applicableRules, request.baseAmount);
      
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
  async getApplicableRules(request: RuleSimulationRequest & { date: Date; weekday: string }): Promise<CalculationRule[]> {
    const ruleStorage = new SimpleRuleStorage();
    const allRules = await ruleStorage.getAllRules();
    
    console.log(`[RuleEngine] Evaluating ${allRules.length} total rules`);
    console.log(`[RuleEngine] Request criteria:`, {
      specialtyId: request.specialtyId,
      doctorId: request.doctorId,
      serviceId: request.serviceId,
      scheduleType: request.scheduleType,
      date: request.date.toISOString().split('T')[0]
    });
    
    const applicableRules = allRules.filter(rule => {
      console.log(`[RuleEngine] Evaluating rule: ${rule.code} (${rule.name})`);
      
      // Check if rule is active
      if (!rule.isActive) {
        console.log(`  ❌ Rule inactive`);
        return false;
      }
      
      // Check valid date range
      const validFrom = new Date(rule.validFrom);
      const validTo = new Date(rule.validTo);
      if (validFrom > request.date) {
        console.log(`  ❌ Not yet valid (starts ${validFrom.toISOString().split('T')[0]})`);
        return false;
      }
      if (validTo < request.date) {
        console.log(`  ❌ Expired (ended ${validTo.toISOString().split('T')[0]})`);
        return false;
      }
      
      // INTELLIGENT MATCHING: Be more permissive with specialty matching
      if (request.specialtyId && rule.specialtyId) {
        if (rule.specialtyId !== request.specialtyId) {
          console.log(`  ❌ Specialty mismatch: rule=${rule.specialtyId}, request=${request.specialtyId}`);
          return false;
        }
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
      if (rule.applicableDays && Array.isArray(rule.applicableDays) && rule.applicableDays.length > 0) {
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
    if (rule.applicableDays && Array.isArray(rule.applicableDays) && rule.applicableDays.length > 0) {
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
    
    if (rule.paymentType === 'percentage') {
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
   * Generates intelligent, human-readable explanation of rule selection
   */
  generateExplanation(selectedRule: CalculationRule, allApplicableRules: CalculationRule[], baseAmount: number): string {
    const parts = [];
    const criteria = [];
    
    parts.push(`✅ Se aplicó la regla "${selectedRule.name}" (${selectedRule.code})`);
    
    // Explain why this rule was selected
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
    if (selectedRule.scheduleType && selectedRule.scheduleType !== 'all') {
      const scheduleNames = {
        'regular': 'horario regular',
        'night': 'horario nocturno',
        'irregular': 'horario irregular'
      };
      criteria.push(`para ${scheduleNames[selectedRule.scheduleType] || selectedRule.scheduleType}`);
    }
    if (selectedRule.applicableDays && selectedRule.applicableDays.length > 0 && selectedRule.applicableDays.length < 7) {
      const dayNames = {
        'monday': 'lunes', 'tuesday': 'martes', 'wednesday': 'miércoles',
        'thursday': 'jueves', 'friday': 'viernes', 'saturday': 'sábado', 'sunday': 'domingo'
      };
      const translatedDays = selectedRule.applicableDays.map(day => dayNames[day] || day);
      criteria.push(`para días específicos: ${translatedDays.join(', ')}`);
    }
    
    if (criteria.length > 0) {
      parts.push(`porque es ${criteria.join(', ')}`);
    }
    
    // Explain the payment calculation with visual indicators
    if (selectedRule.paymentType === 'percentage') {
      const percentage = parseFloat(selectedRule.paymentValue.toString());
      const calculatedAmount = Math.round((baseAmount * percentage) / 100);
      parts.push(`💰 Calcula ${percentage}% del monto base ($${baseAmount.toLocaleString('es-CL')}) = $${calculatedAmount.toLocaleString('es-CL')}`);
    } else {
      const fixedAmount = parseFloat(selectedRule.paymentValue.toString());
      parts.push(`💰 Monto fijo de $${fixedAmount.toLocaleString('es-CL')}`);
    }
    
    // Mention conflicts if any
    if (allApplicableRules.length > 1) {
      const conflictCount = allApplicableRules.length - 1;
      parts.push(`⚠️ Se encontraron ${allApplicableRules.length} reglas aplicables. Se seleccionó la más específica y beneficiosa.`);
      
      if (conflictCount <= 3) {
        const otherRules = allApplicableRules.filter(r => r.id !== selectedRule.id).map(r => r.name).join(', ');
        parts.push(`Otras reglas consideradas: ${otherRules}`);
      }
    } else {
      parts.push(`🎯 Regla única aplicable para estos criterios.`);
    }
    
    return parts.join('. ') + '.';
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
    const ruleStorage = new SimpleRuleStorage();
    const allRules = await ruleStorage.getAllRules();
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