import { Module } from '@nestjs/common';

import { MailModule } from '@/modules/mail';

import { FootprintController } from './footprint.controller';
import { FootprintService } from './footprint.service';

@Module({
  imports: [FootprintModule, MailModule],
  controllers: [FootprintController],
  providers: [FootprintService],
})
export class FootprintModule {}
