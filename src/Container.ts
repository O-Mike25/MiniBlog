import dotenv from "dotenv";
import { DatabaseConfigDto } from "./dtos/DatabaseConfigDto";
import { MailConfigDto } from "./dtos/MailConfigDto";
import { IUserRepository } from "./repositories/interfaces/IUserRepository";
import { UserRepository } from "./repositories/PosgresqlRepository/UserRepository";
import { IEmailService } from "./services/EmailService/IEmailService";
import { NodemailerService } from "./services/EmailService/NodemailerService";
import { TokenService } from "./services/TokenService";
import { UserService } from "./services/UserService";
import { UserController } from "./controllers/UserController";

dotenv.config();

// === Configuration des environnements ===
const dbConfig: DatabaseConfigDto = {
  user: process.env.DB_USER!,
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  password: process.env.DB_PASSWORD!,
  port: parseInt(process.env.DB_PORT!),
};

const mailConfig: MailConfigDto = {
  host: process.env.MAIL_HOST!,
  port: parseInt(process.env.MAIL_PORT!),
  user: process.env.MAIL_USER!,
  password: process.env.MAIL_PASSWORD!,
  secure: process.env.MAIL_SECURE === "true",
  from: process.env.MAIL_FROM!,
};

// === Instanciation des services et dépendances ===
const userRepository: IUserRepository = new UserRepository(dbConfig);
const emailService: IEmailService = new NodemailerService(mailConfig);
const tokenService = new TokenService(process.env.JWT_SECRET!, {
  expiresIn: parseInt(process.env.JWT_EXPIRES_IN!),
});
const userService = new UserService(userRepository, emailService, tokenService);
const userController = new UserController(userService);

// === Export centralisé (type singleton) ===
export const Container = {
  dbConfig,
  mailConfig,
  services: {
    userRepository,
    emailService,
    tokenService,
    userService,
  },
  controllers: {
    userController,
  },
};
