import { Pool } from "pg";
import { IUserRepository } from "../interfaces/IUserRepository";
import { UserDto } from "../../dtos/UserDto";
import { DatabaseConfigDto } from "../../dtos/DatabaseConfigDto";
import { OPERATION_FAILED } from "../../constants/Constants";
import { NewUserDto } from "../../dtos/NewUserDto";
import { UpdateUserDto } from "../../dtos/UpdateUserDto";

export class UserRepository implements IUserRepository {
  private GET_USER_BY_EMAIL: string = `
    SELECT id, last_name, first_name, user_name, email, password, bio, role, avatar_url, created_at, updated_at
    FROM users
    WHERE email = $1
  `;

  private GET_USER_BY_USER_NAME: string = `
    SELECT last_name, first_name, user_name, email, password, bio, role, avatar_url, created_at, updated_at
    FROM users
    WHERE user_name = $1
  `;

  private SAVE_USER: string = `
    INSERT INTO users (last_name, first_name, user_name, email, password, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id
  `;

  private GET_USER: string = `
    SELECT id, last_name, first_name, user_name, email, bio, role, avatar_url, created_at, updated_at
    FROM users
    WHERE id = $1
  `;

  private UPDATE_USER: string = `
    UPDATE users
    SET last_name = $1,
        first_name = $2,
        user_name = $3,
        email = $4,
        password = $5,
        bio = $6,
        avatar_url = $7,
        updated_at = NOW()
    WHERE id = $8
  `;

  private DELETE_USER: string = `
    DELETE FROM users
    WHERE id = $1
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
        userId: row.id,
        lastName: row.last_name,
        firstName: row.first_name,
        userName: row.user_name,
        email: row.email,
        password: row.password,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      throw new Error(OPERATION_FAILED);
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
        password: row.password,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      throw new Error(OPERATION_FAILED);
    }
  }
  
  async SaveUser(newUser: NewUserDto): Promise<number> {
    try {
      const values = [newUser.lastName, newUser.firstName, newUser.userName, newUser.email, newUser.password];
      const result = await this.pool.query(this.SAVE_USER, values);
      const userId = result.rows[0].id;
      return userId;
    } catch (error) {
      console.log(error);
      throw new Error(OPERATION_FAILED);
    }
  }

  async GetUser(userId: number): Promise<UserDto | null> {
    try {
      const result = await this.pool.query(this.GET_USER, [userId]);
      if (result.rowCount === 0)
        throw new Error("User not found");

      const row = result.rows[0];
      return {
        userId: row.id,
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
      throw new Error(OPERATION_FAILED);
    }
  }

  async UpdateUser(userDto: UpdateUserDto): Promise<void> {
    try {
      const values = [
        userDto.lastName,
        userDto.firstName,
        userDto.userName,
        userDto.email,
        userDto.password,
        userDto.bio,
        userDto.avatarUrl
      ];
      await this.pool.query(this.UPDATE_USER, values);
    } catch (error) {
      throw new Error(OPERATION_FAILED);
    }
  }

  async DeleteUser(userId: number): Promise<void> {
    try {
      await this.pool.query(this.DELETE_USER, [userId]);
    } catch (error) {
      throw new Error(OPERATION_FAILED);
    }
  }
}
