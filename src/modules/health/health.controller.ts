import { Controller, Get, OnModuleDestroy } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from '@songkeys/nestjs-redis-health';
import Redis from 'ioredis';

import { PrismaService } from '@/modules/prisma/prisma.service';

@Controller('health')
export class HealthController implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(
    private healthCheckService: HealthCheckService,
    private prisma: PrismaService,
    private databaseIndicator: PrismaHealthIndicator,
    private redisIndicator: RedisHealthIndicator,
  ) {
    /**
     * TODO:
     * When there is a module for Redis, remove this initialization and use Nest Injection
     */
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
      retryStrategy: (times) => {
        if (times >= 3) return null;
        return 1000 * 10; // 10 sec
      },
    });
    /**
     * TODO: integrate with pino logger
     */
    this.redis.on('error', (err) => console.error(err));
  }

  @Get()
  @HealthCheck()
  async check() {
    const healthyResponse = await this.healthCheckService.check([
      () => this.checkDatabaseHealth(),
      () => this.checkRedisHealth(),
    ]);

    if (healthyResponse.status === 'ok') {
      return {
        status: healthyResponse.status,
        services: healthyResponse.info,
      };
    }

    return healthyResponse;
  }

  private checkDatabaseHealth() {
    return this.databaseIndicator.pingCheck('postgresql', this.prisma);
  }

  private checkRedisHealth() {
    return this.redisIndicator.checkHealth('redis', {
      client: this.redis,
      type: 'redis',
    });
  }

  onModuleDestroy() {
    this.redis.quit();
  }
}
