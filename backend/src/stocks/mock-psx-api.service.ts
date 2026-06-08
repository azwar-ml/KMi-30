import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface PSXPrice {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
  change: number;
  changePercent: number;
}

@Injectable()
export class MockPSXApiService {
  private logger = new Logger('MockPSXApiService');
  private psxApiUrl: string;

  // Mock live prices updated daily
  private mockLivePrices: Map<string, PSXPrice> = new Map([
    [
      'PSEL',
      {
        symbol: 'PSEL',
        open: 452.5,
        high: 465.0,
        low: 450.0,
        close: 463.0,
        volume: 156500,
        timestamp: new Date(),
        change: 10.5,
        changePercent: 2.32,
      },
    ],
    [
      'UNITY',
      {
        symbol: 'UNITY',
        open: 312.0,
        high: 318.5,
        low: 308.0,
        close: 314.5,
        volume: 245600,
        timestamp: new Date(),
        change: 2.5,
        changePercent: 0.8,
      },
    ],
    [
      'HBL',
      {
        symbol: 'HBL',
        open: 87.5,
        high: 89.2,
        low: 86.8,
        close: 88.7,
        volume: 8756400,
        timestamp: new Date(),
        change: 1.2,
        changePercent: 1.37,
      },
    ],
    [
      'SBL',
      {
        symbol: 'SBL',
        open: 24.1,
        high: 24.8,
        low: 23.9,
        close: 24.5,
        volume: 12854000,
        timestamp: new Date(),
        change: 0.4,
        changePercent: 1.66,
      },
    ],
    [
      'TRG',
      {
        symbol: 'TRG',
        open: 98.2,
        high: 102.5,
        low: 97.5,
        close: 101.5,
        volume: 245600,
        timestamp: new Date(),
        change: 3.3,
        changePercent: 3.36,
      },
    ],
    [
      'LUCK',
      {
        symbol: 'LUCK',
        open: 680.0,
        high: 695.0,
        low: 678.0,
        close: 690.5,
        volume: 156200,
        timestamp: new Date(),
        change: 10.5,
        changePercent: 1.54,
      },
    ],
    [
      'PPL',
      {
        symbol: 'PPL',
        open: 189.5,
        high: 194.2,
        low: 188.5,
        close: 192.8,
        volume: 567800,
        timestamp: new Date(),
        change: 3.3,
        changePercent: 1.74,
      },
    ],
    [
      'OGDC',
      {
        symbol: 'OGDC',
        open: 128.5,
        high: 132.0,
        low: 127.8,
        close: 131.2,
        volume: 432100,
        timestamp: new Date(),
        change: 2.7,
        changePercent: 2.1,
      },
    ],
    [
      'MCB',
      {
        symbol: 'MCB',
        open: 312.5,
        high: 318.5,
        low: 311.0,
        close: 316.8,
        volume: 234500,
        timestamp: new Date(),
        change: 4.3,
        changePercent: 1.38,
      },
    ],
    [
      'SNGPL',
      {
        symbol: 'SNGPL',
        open: 612.0,
        high: 625.5,
        low: 610.5,
        close: 621.8,
        volume: 165400,
        timestamp: new Date(),
        change: 9.8,
        changePercent: 1.6,
      },
    ],
  ]);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.psxApiUrl = this.configService.get<string>('PSX_API_URL', 'http://localhost:8000/api/prices');
  }

  /**
   * Fetch live prices from PSX API or mock data
   * Falls back to mock data if actual API is unavailable
   */
  async fetchLivePrices(): Promise<PSXPrice[]> {
    try {
      this.logger.log('📈 Fetching live prices from PSX...');

      // Try to fetch from actual PSX API
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${this.psxApiUrl}?symbols=PSEL,UNITY,HBL,SBL,TRG,LUCK,PPL,OGDC,MCB,SNGPL`, {
            timeout: 5000,
          }),
        );

        if (response.data && Array.isArray(response.data)) {
          this.logger.log(`✓ Fetched ${response.data.length} live prices from PSX API`);
          return response.data;
        }
      } catch (apiError) {
        this.logger.warn('PSX API unavailable, using mock data with real-time simulation');
      }

      // Return mock data with real-time simulation
      return this.getMockLivePrices();
    } catch (error) {
      this.logger.error('Failed to fetch live prices', error);
      return this.getMockLivePrices();
    }
  }

  /**
   * Get mock live prices with real-time price movements
   */
  private getMockLivePrices(): PSXPrice[] {
    return Array.from(this.mockLivePrices.values()).map((price) => {
      // Simulate real-time price movement (±0.5% from close)
      const movement = (Math.random() - 0.5) * 0.01; // ±0.5%
      const simulatedClose = price.close * (1 + movement);
      const changeFromOpen = simulatedClose - price.open;
      const changePercent = (changeFromOpen / price.open) * 100;

      return {
        ...price,
        close: parseFloat(simulatedClose.toFixed(2)),
        change: parseFloat(changeFromOpen.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        timestamp: new Date(),
      };
    });
  }

  /**
   * Get price for specific symbol
   */
  async getPriceForSymbol(symbol: string): Promise<PSXPrice | null> {
    const prices = await this.fetchLivePrices();
    return prices.find((p) => p.symbol === symbol) || null;
  }

  /**
   * Get all KMI-30 prices
   */
  async getKMI30Prices(): Promise<PSXPrice[]> {
    return this.fetchLivePrices();
  }
}
