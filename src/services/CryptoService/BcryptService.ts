import bcrypt from "bcrypt";
import { ICryptoService } from "./ICryptoService";

export class BcryptCryptoService implements ICryptoService {
    private readonly saltRound: number;

    constructor(saltRound: number){
        this.saltRound = saltRound;
    }

    async Hash(plainText: string): Promise<string> {
        return await bcrypt.hash(plainText, this.saltRound);
    }

    async Compare(plainText: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(plainText, hash);
    }
}