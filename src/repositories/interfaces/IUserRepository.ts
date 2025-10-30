import { NewUserDto } from "../../dtos/NewUserDto"
import { UserDto } from "../../dtos/UserDto"

export interface IUserRepository {
    FindUserByEmail(email: string) : Promise<UserDto | null>
    FindUserByUserName(userName: string): Promise<UserDto | null>
    SaveUser(newUser: NewUserDto): Promise<void>
}