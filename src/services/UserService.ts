import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { NewUserDto } from "../dtos/NewUserDto";
import { IEmailService } from "./EmailService/IEmailService";
import { TokenService } from "./TokenService";

export class UserService {
    private userRepository: IUserRepository;
    private emailService: IEmailService;
    private tokenService: TokenService;

    constructor(userRepository: IUserRepository, emailService: IEmailService, tokenService: TokenService){
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.tokenService = tokenService;
    }

    async RegisterNewUser (newUserDto: NewUserDto): Promise<string> {
        await this.verifyUserUniqueness(newUserDto.email, newUserDto.userName);
        await this.userRepository.SaveUser(newUserDto);
        let token = this.tokenService.GenerateToken({email: newUserDto.email, role: "user"});
        this.emailService.SendUserRegistrationMail(newUserDto.email, newUserDto.firstName, newUserDto.lastName);
        return token;
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
}