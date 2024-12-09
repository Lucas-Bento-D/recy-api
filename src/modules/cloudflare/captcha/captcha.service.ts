import { Injectable } from '@nestjs/common';

@Injectable()
export class CaptchaService {
  captchaVerification() {
    console.log('Estou aqui');
  }
}
