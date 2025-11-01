export interface ICryptoService {
    Hash(plainText: string): Promise<string>;
    Compare(plainText: string, hash: string): Promise<boolean>;
}