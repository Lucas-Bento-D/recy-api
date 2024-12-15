import { Module } from '@nestjs/common';

import { CaptchaController } from './captcha.controller';
import { CaptchaService } from './captcha.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [CaptchaController],
  providers: [CaptchaService],
})
export class CaptchaModule {}
