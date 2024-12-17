import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import { TokenSchemaDto } from './dtos/token.dto';
import { TurnstileService } from '../turnstile/turnstile.service';
import { TurnstileOptions } from '../turnstile/interfaces/turnstile-options.interface';
import { ICaptchaProtectedReturn } from './types';
@Injectable()
export class CaptchaService {
  constructor(
    private readonly turnstileService: TurnstileService,
    @Inject('TurnstileServiceOptions')
    private readonly options: TurnstileOptions) {}

  async captchaVerification({
    token,
  }: TokenSchemaDto): Promise<Omit<ICaptchaProtectedReturn, "data">> {
    try {
      const { success, error } = await this.turnstileService.validateToken(token);

      if (!success) {
        throw new InternalServerErrorException(error || 'Captcha verification failed');
      }

      return { success: true, message: 'Captcha validated successfully' };
    } catch (error) {
      // TODO:  Log the detailed error for internal debugging
      throw new InternalServerErrorException('Failed turnstile verification.');
    }
  }
}