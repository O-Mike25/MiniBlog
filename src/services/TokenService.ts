import Jwt, { JwtPayload, SignOptions } from "jsonwebtoken"

export class TokenService {
    private readonly secretKey: string;
    private readonly options: SignOptions;

    constructor(secretKey: string, options: SignOptions) {
        this.secretKey = secretKey; 
        this.options = options;
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
            console.error("An error occured during token verification", error);
            throw new Error("An error occured during token verification");
        }
    }
}