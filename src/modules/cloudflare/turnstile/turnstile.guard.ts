import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

import { TurnstileOptions } from './interfaces/turnstile-options.interface';
import { TurnstileService } from './turnstile.service';

export enum Messages {
  FAIL = 'Failed turnstile verification.',
  MISSING = 'Missing turnstile verification code.',
  INVALID = 'Invalid turnstile verification code.',
}

@Injectable()
export class TurnstileGuard implements CanActivate {
  constructor(
    private readonly turnstileService: TurnstileService,
    @Inject('TurnstileServiceOptions')
    private readonly options: TurnstileOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const responseToken = this.options.tokenResponse(request);

    if (!responseToken) throw new BadRequestException(Messages.MISSING);

    const { success } = await this.turnstileService.validateToken(
      responseToken,
    );

    if (!success) throw new BadRequestException(Messages.INVALID);
    return success;
  }
}
