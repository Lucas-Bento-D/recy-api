import { TokenResponse } from '../../captcha/types';

export abstract class TurnstileOptions {
  abstract secretKey: string;
  abstract host: string;
  abstract tokenResponse(request: TokenResponse): string;
}
