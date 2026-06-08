import { Injectable, Logger } from '@nestjs/common';
import { DataEngineService } from './data-engine.service';
import { IntelligenceService } from './intelligence.service';
import { ShariaService } from './shariah.service';
import { DataSourcesService } from './data-sources.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StocksService {
  private logger = new Logger('StocksService');

  constructor(
    private dataEngine: DataEngineService,
    private intelligence: IntelligenceService,
    private sharia: ShariaService,
    private dataSources: DataSourcesService,
    private prisma: PrismaService,
  ) {}

  /**
   * Get all KMI-30 companies with latest data
   */
  async getKMI30Companies(): Promise<any[]> {
    try {
      const companies = await this.prisma.kMI30Index.findMany({
        include: {
          company: {
            include: {
              prices: { orderBy: { date: 'desc' }, take: 2 }, // ✅ Changed from 1 to 2 to calculate change
              shariah: true,
            },
          },
        },
        orderBy: { ranking: 'asc' },
      });

      return companies.map((index) => ({
        ranking: index.ranking,
        symbol: index.company.symbol,
        name: index.company.name,
        sector: index.company.sector,
        weight: index.weight,
        price: index.company.prices[0]?.close,
        volume: index.company.prices[0]?.volume ? Number(index.company.prices[0].volume) : 0,
        change: this.calculateChange(index.company.prices),
        shariaStatus: index.company.shariah?.isCompliant ? '✓' : '🔴',
        rating: index.company.shariah?.complianceRating || 0,
      }));
    } catch (error) {
      this.logger.error('Failed to get KMI-30 companies', error);
      throw error;
    }
  }

  /**
   * Get all companies with pagination and search
   */
  async getAllCompaniesWithPagination(
    skip: number = 0,
    take: number = 20,
    search: string = '',
  ): Promise<any> {
    try {
      const where = search
        ? {
            OR: [
              { symbol: { contains: search } },
              { name: { contains: search } },
            ],
          }
        : {};

      const [companies, total] = await Promise.all([
        this.prisma.company.findMany({
          where,
          include: {
            prices: { orderBy: { date: 'desc' }, take: 2 },
            shariah: true,
            kmi30Index: true,
          },
          skip,
          take,
          orderBy: { symbol: 'asc' },
        }),
        this.prisma.company.count({ where }),
      ]);

      return {
        data: companies.map((company: any) => ({
          ranking: company.kmi30Index?.ranking || null,
          symbol: company.symbol,
          name: company.name,
          sector: company.sector,
          weight: company.kmi30Index?.weight || 0,
          price: company.prices[0]?.close,
          volume: company.prices[0]?.volume ? Number(company.prices[0].volume) : 0,
          change: this.calculateChange(company.prices),
          shariaStatus: company.shariah?.isCompliant ? '✓' : '🔴',
          rating: company.shariah?.complianceRating || 0,
        })),
        total,
        skip,
        take,
        hasMore: skip + take < total,
      };
    } catch (error) {
      this.logger.error('Failed to get all companies', error);
      throw error;
    }
  }

  /**
   * Get detailed stock information
   */
  async getStockDetails(symbol: string): Promise<any> {
    try {
      const company = await this.prisma.company.findUnique({
        where: { symbol },
        include: {
          fundamentals: true,
          shariah: true,
          prices: { orderBy: { date: 'desc' }, take: 30 },
          kmi30Index: true,
        },
      });

      if (!company) {
        throw new Error(`Company not found: ${symbol}`);
      }

      return {
        symbol: company.symbol,
        name: company.name,
        sector: company.sector,
        ranking: company.kmi30Index?.ranking,
        weight: company.kmi30Index?.weight,
        fundamentals: company.fundamentals,
        shariah: {
          isCompliant: company.shariah?.isCompliant,
          rating: company.shariah?.complianceRating,
          debtRatio: company.shariah?.debtAssetsRatio,
          halalIncome: company.shariah?.nonHalalIncomeRatio,
          status: company.shariah?.isCompliant ? '✓ COMPLIANT' : '🔴 NON-COMPLIANT',
        },
        priceHistory: company.prices.map(price => ({
          ...price,
          volume: Number(price.volume),
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get stock details for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Get AI memo for stock
   */
  async getMemoForStock(symbol: string): Promise<any> {
    try {
      return this.intelligence.getMemoOrGenerate(symbol);
    } catch (error) {
      this.logger.error(`Failed to get memo for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Sync live prices (Path A)
   */
  async syncLivePrices(): Promise<any> {
    try {
      this.logger.log('🔄 Starting live price sync (Path A)...');
      const prices = await this.dataEngine.fetchLivePrices();
      await this.dataEngine.storePrices(prices);
      return { status: 'SUCCESS', recordsFetched: prices.length };
    } catch (error) {
      this.logger.error('Live price sync failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { status: 'FAILED', error: errorMessage };
    }
  }

  /**
   * Sync historical data (Path B)
   */
  async syncHistoricalData(symbols?: string[]): Promise<any> {
    try {
      this.logger.log('🔄 Starting historical data sync (Path B)...');

      if (!symbols) {
        // Fetch for all KMI-30 companies
        const companies = await this.prisma.kMI30Index.findMany({
          include: { company: true },
        });
        symbols = companies.map((c) => c.company.symbol);
      }

      let totalRecords = 0;
      for (const symbol of symbols) {
        const prices = await this.dataEngine.fetchHistoricalData(symbol, 365);
        await this.dataEngine.storePrices(prices);
        totalRecords += prices.length;
      }

      return { status: 'SUCCESS', recordsFetched: totalRecords };
    } catch (error) {
      this.logger.error('Historical data sync failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { status: 'FAILED', error: errorMessage };
    }
  }

  /**
   * Crawl PSX Header ZIP (Path C)
   */
  async syncPSXHeader(): Promise<any> {
    try {
      this.logger.log('🔄 Starting PSX Header crawl (Path C)...');
      const constituents = await this.dataEngine.fetchPSXHeaderZip();
      await this.dataEngine.seedKMI30Companies(constituents);
      return { status: 'SUCCESS', companiesSeeded: constituents.length };
    } catch (error) {
      this.logger.error('PSX Header crawl failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { status: 'FAILED', error: errorMessage };
    }
  }

  /**
   * Audit all companies for Shariah compliance
   */
  async auditAllShariah(): Promise<any> {
    try {
      await this.sharia.auditAllKMI30();
      const summary = await this.sharia.getComplianceSummary();
      return { status: 'SUCCESS', summary };
    } catch (error) {
      this.logger.error('Shariah audit failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { status: 'FAILED', error: errorMessage };
    }
  }

  /**
   * Get Shariah compliance status
   */
  async getShariaStatus(): Promise<any> {
    try {
      return this.sharia.getComplianceSummary();
    } catch (error) {
      this.logger.error('Failed to get Shariah status', error);
      throw error;
    }
  }

  /**
   * Get non-compliant companies
   */
  async getNonCompliantCompanies(): Promise<any[]> {
    try {
      return this.sharia.getNonCompliantCompanies();
    } catch (error) {
      this.logger.error('Failed to get non-compliant companies', error);
      throw error;
    }
  }

  /**
   * Get scraper logs (Superadmin only)
   */
  async getScraperLogs(): Promise<any[]> {
    try {
      return this.prisma.scraperLog.findMany({
        orderBy: { startTime: 'desc' },
        take: 50,
      });
    } catch (error) {
      this.logger.error('Failed to get scraper logs', error);
      throw error;
    }
  }

  /**
   * Get API latency logs (Admin only)
   */
  async getLatencyLogs(): Promise<any[]> {
    try {
      return this.prisma.aPILog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 50,
      });
    } catch (error) {
      this.logger.error('Failed to get latency logs', error);
      throw error;
    }
  }

  /**
   * Calculate daily change percentage
   */
  private calculateChange(prices: any[]): number {
    if (prices.length < 2) return 0;

    const today = prices[0].close;
    const yesterday = prices[1].close;

    return ((today - yesterday) / yesterday) * 100;
  }

  /**
   * Get PSX market news
   */
  async getMarketNews(): Promise<any[]> {
    try {
      this.logger.log('📰 Fetching PSX market news...');
      const news = await this.dataSources.fetchPSXNews();
      return news;
    } catch (error) {
      this.logger.error('Failed to fetch market news', error);
      throw error;
    }
  }

  /**
   * Get IMF macro indicators for Pakistan
   */
  async getMacroIndicators(): Promise<any[]> {
    try {
      this.logger.log('📊 Fetching IMF macro indicators...');
      const indicators = await this.dataSources.fetchIMFIndicators();
      return indicators;
    } catch (error) {
      this.logger.error('Failed to fetch macro indicators', error);
      throw error;
    }
  }
}
