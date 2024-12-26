import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import { TurnstileOptions } from './interfaces/turnstile-options.interface';
import { TurnstileVerificationResponse } from './types';

@Injectable()
export class TurnstileService {
  constructor(
    @Inject('TurnstileServiceOptions')
    private readonly options: TurnstileOptions,
  ) {}

  async turnstileValidateTokenApi(
    token: string,
    secretKey: string,
  ): Promise<TurnstileVerificationResponse> {
    const formData = new FormData();
    const hostVerificationUrl = this.options.host;

    if (!secretKey || !hostVerificationUrl) {
      throw new InternalServerErrorException(
        'CAPTCHA environment variables are not configured properly.',
      );
    }

    formData.append('secret', secretKey);
    formData.append('response', token);

    try {
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

      const data = (await result.json()) as TurnstileVerificationResponse;

      if (!data.success) {
        throw new Error(
          `CAPTCHA verification error: ${
            data['error-codes']?.join(', ') || 'Unknown error'
          }`,
        );
      }

      return data;
    } catch (error) {
      throw new BadRequestException(
        `Error occurred during CAPTCHA verification: ${error}`,
      );
    }
  }

  async validateToken(
    token: string,
  ): Promise<{ success: boolean; error?: string }> {
    const validationResponse = await this.turnstileValidateTokenApi(
      token,
      this.options.secretKey,
    );

    if (!validationResponse.success) {
      return { success: false, error: 'Invalid token' };
    }
    return { success: true };
  }
}
