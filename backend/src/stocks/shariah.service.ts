import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 2026 SECP Shariah Compliance Criteria:
 * 1. Debt/Total Assets < 33%
 * 2. Non-Halal Income < 5% of revenue
 * 3. Illiquid Assets > 25% (buffer for compliance)
 */

@Injectable()
export class ShariaService {
  private logger = new Logger('ShariaService');

  // Thresholds (Hard Gates)
  private DEBT_ASSETS_THRESHOLD = 0.33; // 33%
  private NON_HALAL_INCOME_THRESHOLD = 0.05; // 5%
  private ILLIQUID_ASSETS_THRESHOLD = 0.25; // 25%

  constructor(private prisma: PrismaService) {}

  /**
   * Audit Shariah compliance for a company
   * Returns 5-star rating and compliance status
   */
  async auditCompliance(companyId: string): Promise<any> {
    try {
      this.logger.log(`🕌 Auditing Shariah compliance for company ${companyId}...`);

      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        include: { fundamentals: true },
      });

      if (!company) {
        throw new Error(`Company not found: ${companyId}`);
      }

      const fundamental = company.fundamentals;
      if (!fundamental) {
        this.logger.warn(`No fundamentals found for ${company.symbol}`);
        return this.createDefaultCompliance(companyId);
      }

      // Check each criterion
      const debtAssetsRatio = fundamental.totalDebt && fundamental.totalAssets 
        ? fundamental.totalDebt / fundamental.totalAssets 
        : null;

      const nonHalalIncomeRatio = fundamental.nonHalalIncome && fundamental.revenue
        ? fundamental.nonHalalIncome / fundamental.revenue
        : null;

      const illiquidAssetsRatio = fundamental.illiquidAssets && fundamental.totalAssets
        ? fundamental.illiquidAssets / fundamental.totalAssets
        : null;

      // Determine failures
      const failingCriteria: string[] = [];
      let complianceRating = 5; // Start with perfect rating

      // Criterion 1: Debt/Assets < 33%
      const criterion1Pass = debtAssetsRatio === null || debtAssetsRatio <= this.DEBT_ASSETS_THRESHOLD;
      if (!criterion1Pass) {
        failingCriteria.push('DEBT_THRESHOLD');
        complianceRating -= 2; // Heavy penalty
      }

      // Criterion 2: Non-Halal Income < 5%
      const criterion2Pass = nonHalalIncomeRatio === null || nonHalalIncomeRatio <= this.NON_HALAL_INCOME_THRESHOLD;
      if (!criterion2Pass) {
        failingCriteria.push('HALAL_INCOME');
        complianceRating -= 1;
      }

      // Criterion 3: Illiquid Assets > 25% (compliance buffer)
      const criterion3Pass = illiquidAssetsRatio === null || illiquidAssetsRatio >= this.ILLIQUID_ASSETS_THRESHOLD;
      if (!criterion3Pass) {
        failingCriteria.push('LIQUIDITY_BUFFER');
        complianceRating -= 1;
      }

      const isCompliant = failingCriteria.length === 0;
      complianceRating = Math.max(0, complianceRating);

      // Calculate margin of safety
      const marginOfSafety = this.calculateMarginOfSafety(
        debtAssetsRatio,
        nonHalalIncomeRatio,
      );

      // Create or update compliance record
      const compliance = await this.prisma.shariaCompliance.upsert({
        where: { companyId },
        update: {
          debtAssetsRatio,
          nonHalalIncomeRatio,
          illiquidAssetsRatio,
          isCompliant,
          complianceRating,
          marginOfSafety,
          failingCriteria,
          flaggedForReview: !isCompliant,
          lastAuditedAt: new Date(),
        },
        create: {
          companyId,
          debtAssetsRatio,
          nonHalalIncomeRatio,
          illiquidAssetsRatio,
          isCompliant,
          complianceRating,
          marginOfSafety,
          failingCriteria,
          flaggedForReview: !isCompliant,
          lastAuditedAt: new Date(),
        },
      });

      // Log the audit
      if (!isCompliant) {
        this.logger.warn(`🔴 ${company.symbol} FAILED Shariah compliance: ${failingCriteria.join(', ')}`);
      } else {
        this.logger.log(`✓ ${company.symbol} PASSED Shariah compliance with ${complianceRating}/5 rating`);
      }

      return compliance;
    } catch (error) {
      this.logger.error('Shariah audit failed', error);
      throw error;
    }
  }

  /**
   * Batch audit all KMI-30 companies
   */
  async auditAllKMI30(): Promise<void> {
    try {
      this.logger.log('🕌 Running batch Shariah audit for all KMI-30 companies...');

      const companies = await this.prisma.kMI30Index.findMany({
        include: { company: true },
        orderBy: { ranking: 'asc' },
      });

      let compliantCount = 0;
      let nonCompliantCount = 0;

      for (const index of companies) {
        try {
          const compliance = await this.auditCompliance(index.company.id);
          if (compliance.isCompliant) {
            compliantCount++;
          } else {
            nonCompliantCount++;
          }
        } catch (error) {
          this.logger.error(`Failed to audit ${index.company.symbol}`, error);
        }
      }

      this.logger.log(
        `✓ Batch audit complete: ${compliantCount} compliant, ${nonCompliantCount} non-compliant`,
      );
    } catch (error) {
      this.logger.error('Batch audit failed', error);
      throw error;
    }
  }

  /**
   * Get companies that failed Shariah compliance
   */
  async getNonCompliantCompanies(): Promise<any[]> {
    try {
      const nonCompliant = await this.prisma.shariaCompliance.findMany({
        where: { isCompliant: false },
        include: {
          company: true,
        },
        orderBy: { complianceRating: 'asc' },
      });

      return nonCompliant;
    } catch (error) {
      this.logger.error('Failed to fetch non-compliant companies', error);
      throw error;
    }
  }

  /**
   * Flag alert if company breaches Shariah threshold
   */
  async checkAndFlagThresholdBreach(symbol: string): Promise<boolean> {
    try {
      const company = await this.prisma.company.findUnique({
        where: { symbol },
        include: { shariah: true },
      });

      if (!company || !company.shariah) {
        return false;
      }

      const breached: boolean = !!(company.shariah.debtAssetsRatio 
        && company.shariah.debtAssetsRatio > this.DEBT_ASSETS_THRESHOLD);

      if (breached) {
        this.logger.warn(`🔴 THRESHOLD BREACH: ${symbol} Debt/Assets = ${company.shariah.debtAssetsRatio}`);
      }

      return breached;
    } catch (error) {
      this.logger.error(`Failed to check threshold for ${symbol}`, error);
      return false;
    }
  }

  /**
   * Calculate margin of safety (how far below threshold)
   */
  private calculateMarginOfSafety(
    debtAssetsRatio: number | null,
    nonHalalIncomeRatio: number | null,
  ): number {
    if (debtAssetsRatio === null) return 0;

    // Margin of safety = (Threshold - Actual) / Threshold * 100
    const debtMargin = ((this.DEBT_ASSETS_THRESHOLD - debtAssetsRatio) / this.DEBT_ASSETS_THRESHOLD) * 100;
    
    if (nonHalalIncomeRatio !== null) {
      const halalMargin = ((this.NON_HALAL_INCOME_THRESHOLD - nonHalalIncomeRatio) / this.NON_HALAL_INCOME_THRESHOLD) * 100;
      return Math.min(debtMargin, halalMargin); // Return most conservative margin
    }

    return debtMargin;
  }

  /**
   * Create default compliance record when fundamentals are missing
   */
  private async createDefaultCompliance(companyId: string): Promise<any> {
    return this.prisma.shariaCompliance.upsert({
      where: { companyId },
      update: {
        isCompliant: false,
        complianceRating: 0,
        flaggedForReview: true,
        failingCriteria: ['INSUFFICIENT_DATA'],
      },
      create: {
        companyId,
        isCompliant: false,
        complianceRating: 0,
        flaggedForReview: true,
        failingCriteria: ['INSUFFICIENT_DATA'],
      },
    });
  }

  /**
   * Get compliance summary for UI dashboard
   */
  async getComplianceSummary(): Promise<any> {
    try {
      const total = await this.prisma.shariaCompliance.count();
      const compliant = await this.prisma.shariaCompliance.count({
        where: { isCompliant: true },
      });
      const flagged = await this.prisma.shariaCompliance.count({
        where: { flaggedForReview: true },
      });

      return {
        total,
        compliant,
        nonCompliant: total - compliant,
        flagged,
        complianceRate: total > 0 ? (compliant / total * 100).toFixed(2) : 0,
      };
    } catch (error) {
      this.logger.error('Failed to get compliance summary', error);
      throw error;
    }
  }
}
