import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { NewUserDto } from "../dtos/NewUserDto";
import { IEmailService } from "./EmailService/IEmailService";
import { TokenService } from "./TokenService";
import { ICryptoService } from "./CryptoService/ICryptoService";
import { UserDto } from "../dtos/UserDto";
import { INVALID_CREDENTIALS_EXCEPTION } from "../constants/Constants";

export class UserService {
    private userRepository: IUserRepository;
    private emailService: IEmailService;
    private tokenService: TokenService;
    private cryptoService: ICryptoService;

    constructor(userRepository: IUserRepository, emailService: IEmailService, tokenService: TokenService, cryptoService: ICryptoService){
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.tokenService = tokenService;
        this.cryptoService = cryptoService;
    }

    async RegisterNewUser (newUserDto: NewUserDto): Promise<string> {
        await this.verifyUserUniqueness(newUserDto.email, newUserDto.userName);
        newUserDto.password = await this.cryptoService.Hash(newUserDto.password);
        let userId = await this.userRepository.SaveUser(newUserDto);
        let token = this.tokenService.GenerateToken({userId: userId, username: newUserDto.userName, role: "user"});
        this.emailService.SendUserRegistrationMail(newUserDto.email, newUserDto.firstName, newUserDto.lastName);
        return token;
    }

    async Login(email: string, password: string): Promise<string>{
        let user = await this.verifyEmail(email);
        await this.ValidatePassword(password, user.password!);
        let token = this.tokenService.GenerateToken({userId: user.userId, username: user.userName, role: user.role});
        return token;
    }

    async Logout(token: string): Promise<void> {
        let isBlacklisted = await this.tokenService.IsBlacklisted(token);
        if(isBlacklisted) return;
        this.tokenService.SaveToken(token);
    }

    private async verifyUserUniqueness(email: string, userName: string): Promise<void> {
        const userByEmail = await this.userRepository.FindUserByEmail(email);
        if (userByEmail) {
            throw new Error("A user with this email already exists.");
        }
        const userByUsername = await this.userRepository.FindUserByUserName(userName);
        if (userByUsername) {
            throw new Error("A user with this username already exists.");
        }
    }

    private async verifyEmail(email: string): Promise<UserDto> {
        const user = await this.userRepository.FindUserByEmail(email);
        if(!user) throw new Error (INVALID_CREDENTIALS_EXCEPTION)
        return user;
    }

    private async ValidatePassword(password: string, hashedPassword: string): Promise<void> {
        const doesPasswordMatch = await this.cryptoService.Compare(password, hashedPassword);
        if (!doesPasswordMatch) {
            throw new Error(INVALID_CREDENTIALS_EXCEPTION);
        }
    }

}