import { Controller, Get, Post, Param, UseGuards, Body, Logger, Query } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('stocks')
export class StocksController {
  private logger = new Logger('StocksController');

  constructor(private stocksService: StocksService) {}

  /**
   * Get all KMI-30 companies with latest prices
   */
  @Get('kmi-30')
  async getKMI30() {
    return this.stocksService.getKMI30Companies();
  }

  /**
   * Get all PSX companies with pagination
   */
  @Get('all/paginated')
  async getAllCompanies(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    return this.stocksService.getAllCompaniesWithPagination(
      parseInt(skip || '0'),
      parseInt(take || '20'),
      search || '',
    );
  }

  /**
   * Get detailed info for a specific stock
   */
  @Get(':symbol')
  async getStock(@Param('symbol') symbol: string) {
    return this.stocksService.getStockDetails(symbol);
  }

  /**
   * Get KMI-30 AI memo for a stock
   */
  @Get(':symbol/memo')
  @UseGuards(JwtAuthGuard)
  async getMemo(@Param('symbol') symbol: string) {
    return this.stocksService.getMemoForStock(symbol);
  }

  /**
   * Admin: Fetch and sync all live prices (Path A)
   */
  @Post('sync/live')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles(['ADMIN', 'SUPERADMIN'])
  async syncLivePrices() {
    return this.stocksService.syncLivePrices();
  }

  /**
   * Admin: Fetch and sync historical data (Path B)
   */
  @Post('sync/historical')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles(['ADMIN', 'SUPERADMIN'])
  async syncHistoricalData(@Body() body: { symbols?: string[] }) {
    return this.stocksService.syncHistoricalData(body.symbols);
  }

  /**
   * Admin: Crawl PSX Header ZIP (Path C)
   */
  @Post('sync/psx-header')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles(['ADMIN', 'SUPERADMIN'])
  async syncPSXHeader() {
    return this.stocksService.syncPSXHeader();
  }

  /**
   * Admin: Run Shariah compliance audit
   */
  @Post('audit/shariah')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles(['ADMIN', 'SUPERADMIN'])
  async auditShariah() {
    return this.stocksService.auditAllShariah();
  }

  /**
   * Get market news and analysis
   */
  @Get('market/news')
  async getMarketNews() {
    return this.stocksService.getMarketNews();
  }

  /**
   * Get IMF macro indicators
   */
  @Get('market/macro')
  async getMacroIndicators() {
    return this.stocksService.getMacroIndicators();
  }

  /**
   * Get non-compliant companies (🔴 Flagged)
   */
  @Get('shariah/non-compliant')
  @UseGuards(JwtAuthGuard)
  async getNonCompliant() {
    return this.stocksService.getNonCompliantCompanies();
  }

  /**
   * Superadmin: View scraper logs
   */
  @Get('admin/logs/scraper')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles(['SUPERADMIN'])
  async getScraperLogs() {
    return this.stocksService.getScraperLogs();
  }

  /**
   * Admin: View API latency logs
   */
  @Get('admin/logs/latency')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles(['ADMIN', 'SUPERADMIN'])
  async getLatencyLogs() {
    return this.stocksService.getLatencyLogs();
  }
}
