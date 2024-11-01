import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import CalculatorSupportEmail from '@/emails';
import { MailService } from '@/modules/mail/mail.service';
import { ZodValidationPipe } from '@/shared/utils/zod-validation.pipe';

import { AuthorizationGuard } from '../authorization/authorization.guard';
import { MailDto } from '../mail/dtos/mail.dto';
import { CalculatorService } from './calculator.service';
import {
  ResultDto,
  ResultDtoSchema,
  SupportDto,
  SupportDtoSchema,
} from './dtos';
@ApiTags('calculator')
@Controller({ path: 'calculator', version: '1' })
export class CalculatorController {
  constructor(
    private readonly calculatorService: CalculatorService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(AuthorizationGuard)
  @Post('contact')
  @ApiOperation({
    summary: 'Request support',
    description: 'Returns contact information',
  })
  @ApiOkResponse({
    description: 'Returns created email response',
  })
  @UsePipes(new ZodValidationPipe(SupportDtoSchema))
  async contact(@Body() supportDto: SupportDto) {
    await this.calculatorService.saveContactInfo(supportDto);

    const mail: MailDto = {
      to: supportDto.email,
      from: 'no-reply@app.recy.life',
      subject: 'Contact Information',
      react: CalculatorSupportEmail({
        companyType: supportDto.companyType,
        employeesQuantity: supportDto.employeesQuantity,
        wasteFootPrint: supportDto.wasteFootPrint,
      }),
    };

    try {
      const { data, error } = await this.mailService.sendEmail(mail);

      if (error) {
        return { message: 'Failed to send email', error };
      }

      return { message: 'Email sent successfully', data };
    } catch (error) {
      return { message: 'Failed to send email', error };
    }
  }

  @UseGuards(AuthorizationGuard)
  @Post('result')
  @ApiOperation({
    summary: 'Save result',
    description: 'Save result of the calculator',
  })
  @ApiResponse({
    status: 201,
    description: 'The audit has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @UsePipes(new ZodValidationPipe(ResultDtoSchema))
  async result(@Body() resultDto: ResultDto) {
    await this.calculatorService.saveResultInfo(resultDto);

    return { message: 'Result saved successfully' };
  }
}
