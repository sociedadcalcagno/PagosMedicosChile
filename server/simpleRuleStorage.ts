// Temporary methods for rule operations until full storage integration is complete
import { db } from "./db.js";
import { ruleVersions, ruleAlerts, ruleScopeGroups } from "../shared/schema.js";
import { eq, desc, asc } from "drizzle-orm";
import type { RuleVersion, InsertRuleVersion, RuleAlert, InsertRuleAlert, RuleScopeGroup, InsertRuleScopeGroup } from "../shared/schema.js";

export class SimpleRuleStorage {
  // Rule version operations (audit trail)
  async getRuleVersions(ruleId: string): Promise<RuleVersion[]> {
    return await db.select()
      .from(ruleVersions)
      .where(eq(ruleVersions.ruleId, ruleId))
      .orderBy(desc(ruleVersions.createdAt));
  }

  async createRuleVersion(version: Partial<InsertRuleVersion>): Promise<RuleVersion> {
    const [result] = await db.insert(ruleVersions)
      .values(version as InsertRuleVersion)
      .returning();
    return result;
  }

  // Rule alert operations
  async getRuleAlerts(ruleId?: string): Promise<RuleAlert[]> {
    const query = db.select().from(ruleAlerts);
    
    if (ruleId) {
      return await query.where(eq(ruleAlerts.ruleId, ruleId))
        .orderBy(desc(ruleAlerts.createdAt));
    }
    
    return await query.orderBy(desc(ruleAlerts.createdAt));
  }

  async createRuleAlert(alert: Partial<InsertRuleAlert>): Promise<RuleAlert> {
    const [result] = await db.insert(ruleAlerts)
      .values(alert as InsertRuleAlert)
      .returning();
    return result;
  }

  async deleteRuleAlert(id: string): Promise<void> {
    await db.delete(ruleAlerts)
      .where(eq(ruleAlerts.id, id));
  }

  // Rule scope group operations
  async getRuleScopeGroups(type?: string): Promise<RuleScopeGroup[]> {
    const query = db.select().from(ruleScopeGroups);
    
    if (type) {
      return await query.where(eq(ruleScopeGroups.type, type))
        .orderBy(asc(ruleScopeGroups.name));
    }
    
    return await query.orderBy(asc(ruleScopeGroups.name));
  }

  async getRuleScopeGroupById(id: string): Promise<RuleScopeGroup | undefined> {
    const [result] = await db.select()
      .from(ruleScopeGroups)
      .where(eq(ruleScopeGroups.id, id));
    return result;
  }

  async createRuleScopeGroup(group: Partial<InsertRuleScopeGroup>): Promise<RuleScopeGroup> {
    const [result] = await db.insert(ruleScopeGroups)
      .values(group as InsertRuleScopeGroup)
      .returning();
    return result;
  }

  async updateRuleScopeGroup(id: string, group: Partial<InsertRuleScopeGroup>): Promise<RuleScopeGroup> {
    const [result] = await db.update(ruleScopeGroups)
      .set(group)
      .where(eq(ruleScopeGroups.id, id))
      .returning();
    return result;
  }

  async deleteRuleScopeGroup(id: string): Promise<void> {
    await db.delete(ruleScopeGroups)
      .where(eq(ruleScopeGroups.id, id));
  }
}

export const simpleRuleStorage = new SimpleRuleStorage();