import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CaptchaService } from './captcha.service';

@ApiTags('captcha')
@Controller({ path: 'captcha', version: '1' })
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}
  @Get('')
  async captcha() {
    return this.captchaService.captchaVerification();
  }
}
