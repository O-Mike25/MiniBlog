export interface ITokenBlacklistRepository {
    SaveToken(token: string, expireAt: Date): Promise<void>
    IsBlacklisted(token: string): Promise<boolean>
    RemoveExpired(): Promise<void>
}