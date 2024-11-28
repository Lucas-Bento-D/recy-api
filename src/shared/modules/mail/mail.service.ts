import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

import { MailDto } from './dtos/mail.dto';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(mail: MailDto) {
    return await this.resend.emails.send(mail);
  }
}
