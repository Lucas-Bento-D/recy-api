import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuditModule } from './modules/audits/audit.module';
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
  ],
})
export class AppModule {}
