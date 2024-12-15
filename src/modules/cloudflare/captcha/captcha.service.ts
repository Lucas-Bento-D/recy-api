import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { TokenSchemaDto } from './dtos/token.dto';
import { CaptchaVerificationResponse } from './types';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class CaptchaService {
  constructor(private configService: ConfigService) {}

  async captchaVerification({
    token,
  }: TokenSchemaDto): Promise<CaptchaVerificationResponse> {
    try {
      const formData = new FormData();

      const secretKey = this.configService.get<string>('CAPTCHA_SECRET_KEY');
      const hostVerificationUrl = this.configService.get<string>(
        'CAPTCHA_HOST_VERIFICATION',
      );

      if (!secretKey || !hostVerificationUrl){
        throw new Error(
          'CAPTCHA environment variables are not configured properly.',
        );
      }

      formData.append('secret', secretKey);
      formData.append('response', token);

      const url = `${hostVerificationUrl}/turnstile/v0/siteverify`;

      const result = await fetch(url, {
        body: formData,
        method: 'POST',
      });

      if (!result.ok) {
        throw new Error(
          `CAPTCHA verification failed with status: ${result.status}`,
        );
      }

      const data = (await result.json()) as CaptchaVerificationResponse;

      if (!data.success) {
        throw new Error(
          `CAPTCHA verification error: ${
            data['error-codes']?.join(', ') || 'Unknown error'
          }`,
        );
      }

      return data;
    } catch (error) {
      // TODO:  Log the detailed error for internal debugging
      throw new InternalServerErrorException('Failed turnstile verification.');
    }
  }
}
