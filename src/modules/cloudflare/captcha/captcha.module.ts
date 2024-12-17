import { Module } from '@nestjs/common';

import { CaptchaController } from './captcha.controller';
import { CaptchaService } from './captcha.service';
import { TurnstileService } from '../turnstile/turnstile.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ITokenResponse } from './types';

@Module({
  imports: [ConfigModule],
  controllers: [CaptchaController],
  providers: [
    {
      provide: 'TurnstileServiceOptions',
      useFactory: (config: ConfigService) => {
          return {
            secretKey: config.get<string>('CAPTCHA_SECRET_KEY'),
            host: config.get<string>('CAPTCHA_HOST_VERIFICATION'),
            tokenResponse: (request: ITokenResponse) => {
              return request.body.token
            }
          }
      },
      inject: [ConfigService]
    },
    CaptchaService, TurnstileService]
})
export class CaptchaModule {}
