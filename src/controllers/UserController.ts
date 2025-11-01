import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { NewUserDto } from "../dtos/NewUserDto";
import { Utils } from "../utils";
import bcrypt from "bcrypt";

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async SignUpUser(req: Request, res: Response): Promise<void> {
        try {
            const newUser: NewUserDto = req.body;
            const saltRound = 5;
            newUser.password = await bcrypt.hash(newUser.password, saltRound);
            this.ValidateNewUserData(newUser);
            const token = await this.userService.RegisterNewUser(newUser);
            res.status(201).json({
                message: "User registered successfully.",
                token
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "An error occured when registering a new user";
            res.status(400).json({ message });
        }
    }

    async SignOutUser(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers["authorization"]!.split(' ')[1];
            await this.userService.Logout(token!);
            res.status(200).json({ message: "Successfully disconnected" });
        } catch (error) {
            const message = error instanceof Error ? error.message : "An error occured when disconnecting the user";
            res.status(400).json({ message });
        }
    }

    private ValidateNewUserData(newUser: NewUserDto): void {
        const requiredFields: (keyof NewUserDto)[] = [ "lastName", "firstName", "userName", "email", "password", ];
        for (const field of requiredFields) {
            const value = newUser[field];
            if (!value || value.trim() === "") {
                throw new Error(`The field "${field}" is required.`);
            }
        }
        if (!Utils.isValidEmail(newUser.email)) 
            throw new Error("The email format is not valid.");     
    }
}