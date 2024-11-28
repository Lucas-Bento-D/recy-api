import { BullModule, BullModule as BullMQModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuditModule } from './modules/audits/audit.module';
import { QUEUE_NAME } from './modules/bullmq/bullmq.constants';
import { BullMQEventsListener } from './modules/bullmq/bullmq.eventsListener';
import { BullMQProcessor } from './modules/bullmq/bullmq.processor';
import { FootprintModule } from './modules/footprint';
import { HealthModule } from './modules/health/health.module';
import { RecyclingReportModule } from './modules/recycling-reports';
import { UserModule } from './modules/users/user.module';
import { Web3Module } from './modules/web3/web3.module';
import { LoggerModule } from './shared/modules/logger/logger.module';
import { MailModule } from './shared/modules/mail/mail.module';
import { UploadModule } from './shared/modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
    }),
    BullMQModule.registerQueueAsync({
      name: QUEUE_NAME,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
    }),
    Web3Module,
    UploadModule,
    LoggerModule,
    FootprintModule,
    MailModule,
    RecyclingReportModule,
    AuditModule,
    UserModule,
    HealthModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    BullMQEventsListener,
    BullMQProcessor,
  ],
})
export class AppModule {}
