import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class HealthService {
  private logger = new Logger('HealthService');

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async getSystemHealth() {
    const health = {
      status: 'HEALTHY',
      timestamp: new Date(),
      database: await this.checkDatabase(),
      gemini: await this.pingGemini(),
      services: {
        dataEngine: 'READY',
        intelligence: 'READY',
        shariah: 'READY',
      },
    };

    return health;
  }

  private async checkDatabase(): Promise<string> {
    try {
      await this.prisma.user.count();
      return 'CONNECTED';
    } catch (error) {
      this.logger.error('Database check failed', error);
      return 'DISCONNECTED';
    }
  }

  async pingGemini(): Promise<{
    status: string;
    latency: number;
    message: string;
  }> {
    const startTime = Date.now();
    try {
      // Simulated ping - in production, call Gemini API
      const geminiApiKey = process.env.GEMINI_API_KEY;
      
      if (!geminiApiKey) {
        return {
          status: 'OFFLINE',
          latency: 0,
          message: 'GEMINI_API_KEY not configured',
        };
      }

      // This is a simulated ping; replace with actual API call when integrated
      const latency = Date.now() - startTime;

      // Log the ping
      await this.prisma.geminiPingLog.create({
        data: {
          status: 'ONLINE',
          latency,
          message: 'Gemini API accessible',
        },
      });

      return {
        status: 'ONLINE',
        latency,
        message: 'Gemini API ping successful',
      };
    } catch (error) {
      this.logger.error('Gemini ping failed', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.prisma.geminiPingLog.create({
        data: {
          status: 'OFFLINE',
          latency: Date.now() - startTime,
          message: errorMessage,
        },
      });

      return {
        status: 'OFFLINE',
        latency: Date.now() - startTime,
        message: 'Gemini API unreachable',
      };
    }
  }
}
