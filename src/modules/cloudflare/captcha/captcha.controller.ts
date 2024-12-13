import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodValidationPipe } from '@/shared/utils/zod-validation.pipe';

import { CaptchaService } from './captcha.service';
import { TokenSchema, TokenSchemaDto } from './dtos/token.dto';
@ApiTags('captcha')
@Controller({ path: 'captcha', version: '1' })
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(TokenSchema))
  async captcha(@Body() TokenSchemaDto: TokenSchemaDto): Promise<any> {
    return await this.captchaService.captchaVerification(TokenSchemaDto);
  }
}
