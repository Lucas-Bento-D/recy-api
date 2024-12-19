export interface TurnstileVerificationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  metadata: { interactive: boolean };
}
export interface CaptchaProtectedReturn {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}
export interface TokenResponse {
  headers: {
    'x-recaptcha-token': string;
  };
}
