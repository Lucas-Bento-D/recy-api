export class MailDto {
  from: string;
  to: string;
  subject: string;
  html?: string;
  react: JSX.Element;
}
