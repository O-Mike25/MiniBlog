export type MailOptions = {
  from?: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface IEmailService {
  SendUserRegistrationMail(userMail: string, userFirstName: string, userLastName: string): Promise<void>;
}