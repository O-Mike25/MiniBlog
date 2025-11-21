import { NewUserDto } from "../../dtos/NewUserDto"
import { UpdateUserDto } from "../../dtos/UpdateUserDto"
import { UserDto } from "../../dtos/UserDto"

export interface IUserRepository {
    FindUserByEmail(email: string) : Promise<UserDto | null>
    FindUserByUserName(userName: string): Promise<UserDto | null>
    SaveUser(newUser: NewUserDto): Promise<number>
    GetUser(userId: number): Promise<UserDto | null>
    UpdateUser(userDto: UpdateUserDto): Promise<void>
    DeleteUser(userId: number): Promise<void>
}