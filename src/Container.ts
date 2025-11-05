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
import { TokenBlacklistRepository } from "./repositories/PosgresqlRepository/TokenBlacklistRepository";
import { ICryptoService } from "./services/CryptoService/ICryptoService";
import { BcryptCryptoService } from "./services/CryptoService/BcryptService";
import { IArticleRepository } from "./repositories/interfaces/IArticleRepository";
import { ArticleRepository } from "./repositories/PosgresqlRepository/ArticleRepository";
import { ArticleService } from "./services/ArticleService";

dotenv.config();
const SALT_ROUND = 5; 

// === Configuration des environnements ===
export const dbConfig: DatabaseConfigDto = {
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
const tokenBlacklistRepository: TokenBlacklistRepository = new TokenBlacklistRepository(dbConfig);
export const tokenService = new TokenService(
  process.env.JWT_SECRET!,
  { expiresIn: parseInt(process.env.JWT_EXPIRES_IN!) },
  tokenBlacklistRepository
);
const cryptoService: ICryptoService = new BcryptCryptoService(SALT_ROUND);
const userService = new UserService(userRepository, emailService, tokenService, cryptoService);
const articleRepository: IArticleRepository = new ArticleRepository(dbConfig);
export const articleService: ArticleService = new ArticleService(articleRepository);
const userController = new UserController(userService, articleService);

// === Export centralisé (type singleton) ===
export const Container = {
  dbConfig,
  mailConfig,
  services: {
    userRepository,
    emailService,
    tokenService,
    cryptoService,
    userService,
    articleService,
  },
  controllers: {
    userController
  }
  
};
