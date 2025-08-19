import type { CalculationRule, RuleAlert, RuleVersion, RuleScopeGroup } from "../shared/schema.js";
import { storage } from "./storage.js";
import { simpleRuleStorage } from "./simpleRuleStorage.js";

// Types for the rule engine
export interface RuleSimulationRequest {
  date: string;
  doctorId?: string;
  societyId?: string;
  specialtyId: string;
  serviceId?: string;
  branchId?: string;
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
   * Simulates rule application for given criteria
   */
  async simulateRule(request: RuleSimulationRequest): Promise<RuleSimulationResponse> {
    const date = new Date(request.date);
    const weekday = request.weekday || this.getWeekdayFromDate(date);
    
    try {
      // Get applicable rules
      const applicableRules = await this.getApplicableRules({
        ...request,
        date,
        weekday
      });
      
      if (applicableRules.length === 0) {
        return {
          selectedRuleId: null,
          applied: null,
          calculatedPayment: 0,
          explanation: "No se encontraron reglas aplicables para los criterios especificados."
        };
      }
      
      // Sort by specificity and resolve conflicts
      const selectedRule = this.resolveRuleConflicts(applicableRules);
      const conflictingRules = applicableRules.filter(rule => rule.id !== selectedRule.id);
      
      // Calculate payment
      const calculatedPayment = this.calculatePayment(request.baseAmount, selectedRule);
      
      // Generate explanation
      const explanation = this.generateExplanation(selectedRule, applicableRules);
      
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
        explanation: `Error al simular reglas: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }
  
  /**
   * Detects conflicts when creating or updating a rule
   */
  async detectConflicts(rule: Partial<CalculationRule>, excludeRuleId?: string): Promise<RuleConflict[]> {
    const conflicts: RuleConflict[] = [];
    
    try {
      // Get all active rules in the same scope
      const existingRules = await storage.getCalculationRules({
        specialtyId: rule.specialtyId,
        isActive: true
      });
      
      const relevantRules = existingRules.filter(r => 
        r.id !== excludeRuleId && 
        this.rulesOverlap(rule, r)
      );
      
      for (const existingRule of relevantRules) {
        // Check for overlapping criteria
        if (this.hasOverlappingCriteria(rule, existingRule)) {
          conflicts.push({
            ruleId: existingRule.id,
            reason: 'overlap',
            fields: this.getOverlappingFields(rule, existingRule)
          });
        }
        
        // Check for percentage sum > 100%
        if (rule.paymentType === 'percentage' && existingRule.paymentType === 'percentage') {
          const totalPercentage = (parseFloat(rule.paymentValue?.toString() || '0') + 
                                 parseFloat(existingRule.paymentValue.toString()));
          if (totalPercentage > 100) {
            conflicts.push({
              ruleId: existingRule.id,
              reason: 'sum_gt_100',
              fields: ['paymentValue']
            });
          }
        }
      }
      
      // Check for invalid date ranges
      if (rule.validFrom && rule.validTo && rule.validFrom > rule.validTo) {
        conflicts.push({
          ruleId: 'self',
          reason: 'invalid_range',
          fields: ['validFrom', 'validTo']
        });
      }
      
      return conflicts;
      
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      return [];
    }
  }
  
  /**
   * Creates a rule version for audit trail
   */
  async createRuleVersion(ruleId: string, snapshot: any, createdBy: string): Promise<void> {
    try {
      const version: Partial<RuleVersion> = {
        ruleId,
        snapshot,
        createdBy
      };
      
      await simpleRuleStorage.createRuleVersion(version);
    } catch (error) {
      console.error('Error creating rule version:', error);
      throw error;
    }
  }
  
  /**
   * Creates rule alerts
   */
  async createRuleAlert(ruleId: string, type: string, message: string, details: any): Promise<void> {
    try {
      const alert: Partial<RuleAlert> = {
        ruleId,
        type,
        message,
        details
      };
      
      await simpleRuleStorage.createRuleAlert(alert);
      
      // Send webhook if configured
      await this.sendWebhookAlert(alert);
      
    } catch (error) {
      console.error('Error creating rule alert:', error);
      throw error;
    }
  }
  
  // Private helper methods
  
  private async getApplicableRules(criteria: RuleSimulationRequest & { date: Date; weekday: string }): Promise<CalculationRule[]> {
    const allRules = await storage.getCalculationRules({ 
      specialtyId: criteria.specialtyId,
      isActive: true 
    });
    
    return allRules.filter(rule => {
      // Check validity period
      const validFrom = rule.validFrom ? new Date(rule.validFrom) : null;
      const validTo = rule.validTo ? new Date(rule.validTo) : null;
      
      if (!validFrom || !validTo) {
        return false; // Rule without valid dates is not applicable
      }
      
      if (criteria.date < validFrom || criteria.date > validTo) {
        return false;
      }
      
      // Check service match (null service means applies to all services)
      if (rule.serviceId && criteria.serviceId && rule.serviceId !== criteria.serviceId) {
        return false;
      }
      
      // Check doctor/society match
      if (rule.participationType === 'individual' && rule.doctorId !== criteria.doctorId) {
        return false;
      }
      
      if (rule.participationType === 'society' && rule.societyId !== criteria.societyId) {
        return false;
      }
      
      // Check branch match
      if (rule.medicalCenterId && criteria.branchId && rule.medicalCenterId !== criteria.branchId) {
        return false;
      }
      
      // Check schedule type
      if (rule.scheduleType && rule.scheduleType !== 'all' && rule.scheduleType !== criteria.scheduleType) {
        return false;
      }
      
      // Check applicable days
      if (rule.applicableDays && Array.isArray(rule.applicableDays) && rule.applicableDays.length > 0) {
        if (!rule.applicableDays.includes(criteria.weekday)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  private resolveRuleConflicts(rules: CalculationRule[]): CalculationRule {
    if (rules.length === 1) {
      return rules[0];
    }
    
    // Sort by specificity (most specific first)
    const sortedRules = rules.sort((a, b) => {
      const specificityA = this.calculateSpecificity(a);
      const specificityB = this.calculateSpecificity(b);
      
      if (specificityA !== specificityB) {
        return specificityB - specificityA; // Higher specificity first
      }
      
      // If same specificity, prefer most recent
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime(); // More recent first
      }
      
      // If same date, prefer percentage with lower value to avoid overpayment
      if (a.paymentType === 'percentage' && b.paymentType === 'percentage') {
        return parseFloat(a.paymentValue.toString()) - parseFloat(b.paymentValue.toString());
      }
      
      return 0;
    });
    
    return sortedRules[0];
  }
  
  private calculateSpecificity(rule: CalculationRule): number {
    let specificity = 0;
    
    // Branch + Doctor + Service = highest specificity
    if (rule.medicalCenterId) specificity += 100;
    if (rule.doctorId) specificity += 50;
    if (rule.serviceId) specificity += 25;
    if (rule.societyId) specificity += 40; // Society slightly less specific than doctor
    if (rule.scheduleType && rule.scheduleType !== 'all') specificity += 10;
    if (rule.applicableDays && Array.isArray(rule.applicableDays) && rule.applicableDays.length > 0) {
      specificity += 5;
    }
    
    return specificity;
  }
  
  private calculatePayment(baseAmount: number, rule: CalculationRule): number {
    if (rule.paymentType === 'percentage') {
      const percentage = parseFloat(rule.paymentValue.toString());
      return Math.round(baseAmount * (percentage / 100));
    } else if (rule.paymentType === 'fixed_amount') {
      return parseFloat(rule.paymentValue.toString());
    }
    
    return 0;
  }
  
  private generateExplanation(selectedRule: CalculationRule, allApplicableRules: CalculationRule[]): string {
    const specificity = this.calculateSpecificity(selectedRule);
    let explanation = `Se eligió la regla "${selectedRule.name}" (${selectedRule.code})`;
    
    if (allApplicableRules.length > 1) {
      explanation += ` entre ${allApplicableRules.length} reglas aplicables`;
    }
    
    const reasons = [];
    if (selectedRule.medicalCenterId) reasons.push("sucursal específica");
    if (selectedRule.doctorId) reasons.push("doctor específico");
    if (selectedRule.serviceId) reasons.push("servicio específico");
    if (selectedRule.societyId) reasons.push("sociedad específica");
    if (selectedRule.scheduleType && selectedRule.scheduleType !== 'all') reasons.push(`horario ${selectedRule.scheduleType}`);
    
    if (reasons.length > 0) {
      explanation += ` por tener criterios específicos: ${reasons.join(", ")}`;
    }
    
    explanation += ` y estar vigente en la fecha consultada.`;
    
    if (selectedRule.paymentType === 'percentage') {
      explanation += ` Se aplicó un ${selectedRule.paymentValue}% del monto base.`;
    } else {
      explanation += ` Se aplicó un monto fijo de $${parseFloat(selectedRule.paymentValue.toString()).toLocaleString('es-CL')}.`;
    }
    
    return explanation;
  }
  
  private getWeekdayFromDate(date: Date): string {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return weekdays[date.getDay()];
  }
  
  private rulesOverlap(rule1: Partial<CalculationRule>, rule2: CalculationRule): boolean {
    // Check if rules have overlapping scope
    if (rule1.specialtyId !== rule2.specialtyId) return false;
    
    // Check participation type compatibility
    if (rule1.participationType === 'individual' && rule2.participationType === 'individual') {
      return rule1.doctorId === rule2.doctorId;
    }
    
    if (rule1.participationType === 'society' && rule2.participationType === 'society') {
      return rule1.societyId === rule2.societyId;
    }
    
    return true;
  }
  
  private hasOverlappingCriteria(rule1: Partial<CalculationRule>, rule2: CalculationRule): boolean {
    // Check date overlap
    if (rule1.validFrom && rule1.validTo) {
      const rule1Start = new Date(rule1.validFrom);
      const rule1End = new Date(rule1.validTo);
      const rule2Start = new Date(rule2.validFrom);
      const rule2End = new Date(rule2.validTo);
      
      const hasDateOverlap = rule1Start <= rule2End && rule1End >= rule2Start;
      if (!hasDateOverlap) return false;
    }
    
    // Check service overlap (null means applies to all services)
    if (rule1.serviceId && rule2.serviceId && rule1.serviceId !== rule2.serviceId) {
      return false;
    }
    
    // Check branch overlap
    if (rule1.medicalCenterId && rule2.medicalCenterId && rule1.medicalCenterId !== rule2.medicalCenterId) {
      return false;
    }
    
    return true;
  }
  
  private getOverlappingFields(rule1: Partial<CalculationRule>, rule2: CalculationRule): string[] {
    const fields = [];
    
    if (rule1.doctorId === rule2.doctorId) fields.push('doctorId');
    if (rule1.societyId === rule2.societyId) fields.push('societyId');
    if (rule1.serviceId === rule2.serviceId) fields.push('serviceId');
    if (rule1.medicalCenterId === rule2.medicalCenterId) fields.push('medicalCenterId');
    if (rule1.specialtyId === rule2.specialtyId) fields.push('specialtyId');
    
    fields.push('validFrom', 'validTo');
    
    return fields;
  }
  
  private async sendWebhookAlert(alert: Partial<RuleAlert>): Promise<void> {
    const webhookUrl = process.env.RULES_ALERT_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return; // Webhook not configured
    }
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'rule_alert',
          data: alert,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        console.error('Webhook failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }
}

// Export singleton instance
export const ruleEngine = new IntelligentRuleEngine();