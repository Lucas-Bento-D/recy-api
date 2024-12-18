import { Module } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { TurnstileService } from '../turnstile/turnstile.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenResponse } from './types';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'TurnstileServiceOptions',
      useFactory: (config: ConfigService) => {
        return {
          secretKey: config.get<string>('CAPTCHA_SECRET_KEY'),
          host: config.get<string>('CAPTCHA_HOST_VERIFICATION'),
          tokenResponse: (request: TokenResponse) => {
            return request.body.token;
          },
        };
      },
      inject: [ConfigService],
    },
    CaptchaService,
    TurnstileService,
  ],
})
export class CaptchaModule {}
