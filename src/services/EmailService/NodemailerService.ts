import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { IEmailService } from "./IEmailService";
import { MailConfigDto } from "../../dtos/MailConfigDto";

export class NodemailerService implements IEmailService {
  private from: string;
  private transporter;

  constructor(mailConfig: MailConfigDto) {
    this.from = mailConfig.from;
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.password
      }
    } as SMTPTransport.Options)
  }

  async SendUserRegistrationMail(userMail: string, userFirstName: string, userLastName: string): Promise<void> {
    try {
      const templatePath = path.join(__dirname, "../../template/mail_confirmation.html");
      let htmlTemplate = fs.readFileSync(templatePath, "utf-8");
      htmlTemplate = htmlTemplate.replace("{FIRST_NAME}", userFirstName);
      htmlTemplate = htmlTemplate.replace("{LAST_NAME}", userLastName);
      const text = `Hello ${userFirstName} ${userLastName},\n\nWelcome to MiniBlog! We're thrilled to have you with us.`;
      await this.transporter.sendMail({
        from: `"MiniBlog" <${this.from}>`,
        to: userMail,
        subject: "Welcome on MiniBlog 🎉",
        text,
        html: htmlTemplate,
      });
    } catch (error) {
      console.error("An error occured when sending email: ", error);
      throw new Error("An error occured when sending email: ");
    }
  }
}