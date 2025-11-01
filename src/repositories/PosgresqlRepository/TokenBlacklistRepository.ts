import { Pool } from "pg";
import { ITokenBlacklistRepository } from "../interfaces/ITokenBlacklistRepository";
import { DatabaseConfigDto } from "../../dtos/DatabaseConfigDto";
import { OPERATION_FAILED } from "../../constants/Constants";

export class TokenBlacklistRepository implements ITokenBlacklistRepository {
    private SAVE_TOKEN = `
        INSERT INTO token_blacklist (token, expire_at)
        VALUES ($1, $2)
    `;
    private GET_TOKEN = `
        SELECT * 
        FROM token_blacklist
        WHERE token = $1;
    `;
    private DELETE_EXPIRED_TOKEN = `
        DELETE FROM token_blacklist
        WHERE expire_at <= now();
    `;
    private pool:Pool

    constructor(dbConfig: DatabaseConfigDto){
        this.pool = new Pool(dbConfig);
    }

    async SaveToken(token: string, expireAt: Date): Promise<void> {
        try {
            await this.pool.query(this.SAVE_TOKEN, [token, expireAt]);
        } catch (error) {
            console.log(error);
            throw new Error(OPERATION_FAILED);
        }
    }

    async IsBlacklisted(token: string): Promise<boolean>
    {
        try {
            const {rows} = await this.pool.query(this.GET_TOKEN, [token]);
            return rows.length > 0;  
        } catch (error) {
            console.log(error);
            throw new Error(OPERATION_FAILED);
        }
    }

    async RemoveExpired(): Promise<void> {
        try {
            await this.pool.query(this.DELETE_EXPIRED_TOKEN);
        } catch (error) {
            console.log(error);
            throw new Error(OPERATION_FAILED);
        }
    }
}