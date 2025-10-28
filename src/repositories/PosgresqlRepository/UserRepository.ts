import { Pool } from "pg";
import { IUserRepository } from "../interfaces/IUserRepository";
import { UserDto } from "../../dtos/UserDto";
import { DatabaseConfigDto } from "../../dtos/DatabaseConfigDto";
import { OperationFailed } from "../../Constants";

export class UserRepository implements IUserRepository {
  private GET_USER_BY_EMAIL: string = `
    SELECT last_name, first_name, user_name, email, bio, role, avatar_url, created_at, updated_at
    FROM users
    WHERE email = $1
  `;

  private GET_USER_BY_USER_NAME: string = `
    SELECT last_name, first_name, user_name, email, bio, role, avatar_url, created_at, updated_at
    FROM users
    WHERE user_name = $1
  `;

  private pool: Pool;

  constructor(dbConfigs: DatabaseConfigDto) {
    this.pool = new Pool(dbConfigs);
  }

  async FindUserByEmail(email: string): Promise<UserDto | null> {
    try {
      const result = await this.pool.query(this.GET_USER_BY_EMAIL, [email]);
      if (result.rowCount === 0) return null;
      const row = result.rows[0];
      return {
        lastName: row.last_name,
        firstName: row.first_name,
        userName: row.user_name,
        email: row.email,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      throw new Error(OperationFailed);
    }
  }

  async FindUserByUserName(userName: string): Promise<UserDto | null> {
    try {
      const result = await this.pool.query(this.GET_USER_BY_USER_NAME, [
        userName,
      ]);
      if (result.rowCount === 0) return null;
      const row = result.rows[0];
      return {
        lastName: row.last_name,
        firstName: row.first_name,
        userName: row.user_name,
        email: row.email,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      throw new Error(OperationFailed);
    }
  }
}
