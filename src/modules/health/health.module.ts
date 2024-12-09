import { RedisHealthModule } from '@liaoliaots/nestjs-redis-health';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { PrismaModule } from '@/modules/prisma/prisma.module';

import { HealthController } from './health.controller';

@Module({
  imports: [PrismaModule, TerminusModule, RedisHealthModule],
  controllers: [HealthController],
})
export class HealthModule {}
