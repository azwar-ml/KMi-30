import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { DataEngineService } from './data-engine.service';
import { IntelligenceService } from './intelligence.service';
import { ShariaService } from './shariah.service';
import { DataSourcesService } from './data-sources.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  providers: [StocksService, DataEngineService, IntelligenceService, ShariaService, DataSourcesService],
  controllers: [StocksController],
})
export class StocksModule {}
