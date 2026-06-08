import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-yet';

/**
 * Global Cache Module Configuration
 * Handles Redis connectivity with production-grade error handling
 */
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<any> => {
        const redisUrl = configService.get<string>('REDIS_URL');

        if (!redisUrl) {
          console.warn('⚠️  REDIS_URL not configured. Using in-memory cache.');
          return {
            isGlobal: true,
            ttl: 60 * 1000, // 60 seconds default
          };
        }

        return {
          isGlobal: true,
          store: redisStore,
          url: redisUrl,
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD,
          ttl: 60 * 1000, // 60 seconds default TTL
          max: 10000, // Max entries in cache
          // Connection pool settings
          connectionName: 'kmi-30-cache',
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        };
      },
    }),
  ],
})
export class CacheModule {}
