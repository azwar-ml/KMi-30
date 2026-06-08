import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getSystemHealth();
  }

  @Get('gemini-ping')
  @UseGuards(JwtAuthGuard)
  async pingGemini() {
    return this.healthService.pingGemini();
  }
}
