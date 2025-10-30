import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { IEmailService, MailOptions } from "./IEmailService";

export class NodemailerService implements IEmailService {
  private blogMail;
  private transporter;

  constructor(blogMail: string, password: string) {
    this.blogMail = blogMail;
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: blogMail,
        password: password
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
        from: `"MiniBlog" <${this.blogMail}>`,
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