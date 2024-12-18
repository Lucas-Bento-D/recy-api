export interface CaptchaProtectedReturn {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}
export interface TokenResponse {
  body: {
    token: string;
  };
}
