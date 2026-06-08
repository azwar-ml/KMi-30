import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'KMI-30 Alpha v4.0 - High-Performance FinTech Engine Ready ✓';
  }
}
