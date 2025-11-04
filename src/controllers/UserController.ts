import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { NewUserDto } from "../dtos/NewUserDto";
import { Utils } from "../utils";

export class Controller {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async SignUpUser(req: Request, res: Response): Promise<void> {
        try {
            const newUser: NewUserDto = req.body;
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

    async SignInUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            console.log("BODY", req.body)
            this.ValidateEmail(email);
            this.ValidateRequiredField(password, "password");
            const token = await this.userService.Login(email, password);
            res.status(201).json({
                message: "User logged successfully.",
                token
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "An error occured when logging in an user";
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
        const requiredFields: (keyof NewUserDto)[] = [ "lastName", "firstName", "userName", "email", "password" ];
        for (const field of requiredFields) {
            const value = newUser[field];
            this.ValidateRequiredField(value, field)
        }
        this.ValidateEmail(newUser.email);
    }

    private ValidateEmail(email: string) {
        let isValidEmail = Utils.isValidEmail(email);
        if (!isValidEmail) 
            throw new Error("The email format is not valid."); 
    }

    private ValidateRequiredField(value: string, fieldName: string): void {
        if (!value || value.trim() === "") {
            throw new Error(`The field "${fieldName}" is required.`);
        }
    }

}