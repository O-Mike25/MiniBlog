export type UpdateUserDto = {
    lastName: string;
    firstName: string;
    userName: string;
    email: string;
    password: string;
    avatarUrl?: string;
    bio?: string;
}