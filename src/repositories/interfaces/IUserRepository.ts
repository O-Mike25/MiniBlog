import { UserDto } from "../../dtos/UserDto"

export interface IUserRepository {
    FindUserByEmail(email: string) : Promise<UserDto | null>
    FindUserByUserName(userName: string): Promise<UserDto | null>
}