export interface CaptchaVerificationResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    'error-codes'?: string[];
    metadata: { interactive: boolean}
}