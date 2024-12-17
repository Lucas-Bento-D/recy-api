import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodValidationPipe } from '@/shared/utils/zod-validation.pipe';

import { CaptchaService } from './captcha.service';
import { TokenSchema, TokenSchemaDto } from './dtos/token.dto';
import { ICaptchaProtectedReturn } from './types';
import { TurnstileGuard } from '../turnstile/turnstile.guard';
@ApiTags('captcha')
@Controller({ path: 'captcha', version: '1' })
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}
  
  @UseGuards(TurnstileGuard)
  @Post('protected')
  @UsePipes(new ZodValidationPipe(TokenSchema))
  async captchaProtected(@Body() body: TokenSchemaDto): Promise<ICaptchaProtectedReturn> {
    return { success: true, message: 'Captcha validation successful! You accessed a protected route.', data: body };
  }

  @Post('validate-captcha')
  async validateCaptcha(@Body() body: TokenSchemaDto): Promise<Omit<ICaptchaProtectedReturn, 'data'>> {
    const result = await this.captchaService.captchaVerification(body);
    return {
      message: 'Captcha verification completed.',
      success: result.success,
    };
  }
}
