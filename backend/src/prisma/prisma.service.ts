import { Global, Injectable, Logger, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
@Global()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new Logger('PrismaService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async enableShutdownHooks(app: INestApplication) {
    // Disconnect on app close
    process.on('SIGINT', async () => {
      this.logger.log('Disconnecting from database...');
      await this.$disconnect();
      await app.close();
    });
  }
}
