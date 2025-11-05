import Jwt, { JwtPayload, SignOptions } from "jsonwebtoken"
import { ITokenBlacklistRepository } from "../repositories/interfaces/ITokenBlacklistRepository";

export class TokenService {
    private readonly secretKey: string;
    private readonly options: SignOptions;
    private blacklistRepository: ITokenBlacklistRepository;

    constructor(secretKey: string, options: SignOptions, blacklistRepository: ITokenBlacklistRepository) {
        this.secretKey = secretKey; 
        this.options = options;
        this.blacklistRepository = blacklistRepository;
        console.log(options)
    }

    GenerateToken(payload: JwtPayload): string {
        try {
            return Jwt.sign(payload, this.secretKey, this.options)
        } catch (error) {
            console.error("An error occured during token generation", error);
            throw new Error("An error occured during token generation");
        }
    }

    VerifyToken(token: string): JwtPayload | string{
        try {
            return Jwt.verify(token, this.secretKey);
        } catch (error) {
            console.error("An error has occured during token verification", error);
            throw new Error("An error has occured during token verification");
        }
    }

    async IsBlacklisted(token: string): Promise<boolean>{
        return await this.blacklistRepository.IsBlacklisted(token);
    } 

    async SaveToken(token: string): Promise<void> {
        const decoded = this.VerifyToken(token);
        if (decoded && typeof decoded === "object" && "exp" in decoded) {
            const exp = (decoded as JwtPayload).exp;
            if (!exp)  throw new Error("The Token doesn't contain expiration date");
            const expireAt = new Date(exp * 1000);
            await this.blacklistRepository.SaveToken(token, expireAt);
        } else {
            throw new Error("The Token is not a valid Token");
        }
    }
}