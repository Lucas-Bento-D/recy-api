import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { TokenSchemaDto } from './dtos/token.dto';

@Injectable()
export class CaptchaService {
  async captchaVerification({ token }: TokenSchemaDto): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('secret', process.env.CAPTCHA_SECRET_KEY);
      formData.append('response', token);

      const url = `${process.env.CAPTCHA_HOST_VERIFICATION}/turnstile/v0/siteverify`;

      const result = await fetch(url, {
        body: formData,
        method: 'POST',
      });

      if (!result.ok){
        throw new Error(
          `CAPTCHA verification failed with status: ${result.status}`,
        );
      }

      const data = await result.json();
      if (!data.success){
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
