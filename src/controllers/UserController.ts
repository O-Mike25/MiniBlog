import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { NewUserDto } from "../dtos/NewUserDto";
import { Utils } from "../utils";
import { tokenService } from "../Container";
import { JwtPayload } from "jsonwebtoken";
import { ArticleService } from "../services/ArticleService";
import { NewArticleDto } from "../dtos/NewArticleDto";
import slugify from "slugify";
import path from "path";
import fs from "fs";
import { UpdateArticleDto } from "../dtos/UpdateArticleDto";
import { ArticleDto } from "../dtos/ArticleDto";
import { ACCESS_DENIED } from "../constants/Constants";
import { UpdateUserDto } from "../dtos/UpdateUserDto";

export class UserController {
    private userService: UserService;
    private articleService: ArticleService;

    constructor(userService: UserService, articleService: ArticleService) {
        this.userService = userService;
        this.articleService = articleService;
    }

    async SignUpUser(req: Request, res: Response): Promise<void> {
        try {
            const newUser: NewUserDto = req.body;
            this.ValidateRequiredField(newUser, ["lastName", "firstName", "userName", "email", "password"]);
            this.ValidateEmail(newUser.email);
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
            this.ValidateRequiredField(req.body, ["email", "password"])
            this.ValidateEmail(req.body.email);
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

    async ObtainUser(req: Request, res: Response): Promise<void> {
        const user = await this.userService.GetUserProfile(parseInt(req.params.id));
        if (!user) res.status(404).json({ message: "This user doesn't exist." });
        else res.status(200).json({ message: "User retrieved successfully.", user });
    }

    async UpdateUser(req: Request, res: Response): Promise<void> {
        const decoded = this.ExtractJwtPayload(req);
        if(decoded.role === "admin" || decoded.userId === parseInt(req.params.userId)){
            const avatarImagePath = await this.HandleCoverImage(req);
            this.ValidateEmail(req.body.email);
            const newInfos: UpdateUserDto = {
                lastName: req.body.lastName,
                firstName: req.body.firstName,
                userName: req.body.userName,
                email: req.body.email,
                password: req.body.password,
                avatarUrl: avatarImagePath,
                bio: req.body.bio || []
            };
            await this.userService.UpdateUserProfile(parseInt(req.params.userId), newInfos);
            res.status(200).json({ message: "User updated successfully." });
        } else
            res.status(400).json({ message: ACCESS_DENIED });
    }

    async RemoveUser(req: Request, res: Response): Promise<void> {
        const decoded = this.ExtractJwtPayload(req);
        if(decoded.role === "admin" || decoded.userId === parseInt(req.params.userId)){
            await this.userService.DeleteUser(parseInt(req.params.userId));
            res.status(200).json({ message: "User removed successfully." });
        }
        else {
          res.status(400).json({ message: ACCESS_DENIED });
        }
    }

    async ObtainArticle(req: Request, res: Response): Promise<void> {
        const article = await this.articleService.GetArticle(parseInt(req.params.id));
        if (!article) res.status(404).json({ message: "This article doesn't exist." });
        else res.status(200).json({ message: "Article retrieved successfully.", article });
    }

    async ObtainArticles(req: Request, res: Response): Promise<void> {
        const article = await this.articleService.GetArticles();
        res.status(200).json({ message: "Articles retrieved successfully.", article });
    }
    
    async AddArticle(req: Request, res: Response): Promise<void> {
      const authHeader = req.headers["authorization"];
      const token = authHeader!.split(" ")[1];
      const decoded = tokenService.VerifyToken(token) as JwtPayload;
      if(decoded.role === "admin" || decoded.userId === parseInt(req.params.id)){
          this.ValidateRequiredField(req.body, ["title", "content"]);
          const coverImagePath = await this.HandleCoverImage(req);
          const newArticle: NewArticleDto = {
            authorId: parseInt(req.params.id),
            title: req.body.title,
            slug: this.GenerateUniqueSlug(req.body.title),
            content: req.body.content,
            coverImage: coverImagePath,
            tags: req.body.tags || [],
            status: req.body.status || "draft"
          };
          this.articleService.CreateArticle(newArticle);
          res.status(201).json({ message: "Article created successfully." });
      } else {
          res.status(400).json({ message: ACCESS_DENIED });
      }
            
    }

    async UpdateArticle(req: Request, res: Response): Promise<void> {
        const authHeader = req.headers["authorization"];
        const token = authHeader!.split(" ")[1];
        const decoded = tokenService.VerifyToken(token) as JwtPayload;

        if(decoded.role === "admin" || decoded.userId === parseInt(req.params.authorId)){
            const coverImagePath = await this.HandleCoverImage(req);
            const updateArticle: UpdateArticleDto = {
                articleId: parseInt(req.params.articleId),
                authorId: parseInt(req.params.authorId),
                title: req.body.title,
                content: req.body.content,
                coverImage: coverImagePath,
                tags: req.body.tags || [],
                status: req.body.status || "draft"
            };
            await this.articleService.UpdateArticle(updateArticle);
            res.status(200).json({ message: "Article updated successfully." });
        } else
            res.status(400).json({ message: ACCESS_DENIED });
    }

    async DeleteArticle(req: Request, res: Response): Promise<void> {
        const authHeader = req.headers["authorization"];
        const token = authHeader!.split(" ")[1];
        const decoded = tokenService.VerifyToken(token) as JwtPayload;
        if(decoded.role === "admin" || decoded.userId == parseInt(req.params.authorId)){
            await this.articleService.DeleteArticle(parseInt(req.params.authorId), parseInt(req.params.articleId));
            res.status(200).json({ message: "Article deleted successfully." });
        }
        else
            res.status(400).json({ message: ACCESS_DENIED });
    } 

    async RateArticle(req: Request, res: Response): Promise<void> {
        const authHeader = req.headers["authorization"];
        const token = authHeader!.split(" ")[1];
        const decoded = tokenService.VerifyToken(token) as JwtPayload;
        if(decoded.role === "admin" || decoded.userId === parseInt(req.params.authorId)){
            await this.articleService.RateArticle(parseInt(req.params.authorId), parseInt(req.params.articleId), req.body.rate, req.body.comment);
            res.status(200).json({ message: "Article rated successfully." });
        }
        else {
          res.status(400).json({ message: ACCESS_DENIED });
        }
    }

    async RemoveRate(req: Request, res: Response): Promise<void> {
        const authHeader = req.headers["authorization"];
        const token = authHeader!.split(" ")[1];
        const decoded = tokenService.VerifyToken(token) as JwtPayload;
        if(decoded.role === "admin" || decoded.userId === parseInt(req.params.authorId)){
            await this.articleService.RemoveRate(parseInt(req.params.authorId), parseInt(req.params.articleId));
            res.status(200).json({ message: "Rating removed successfully." });
        }
        else {
          res.status(400).json({ message: ACCESS_DENIED });
        }
    }

    private ValidateEmail(email: string) {
        let isValidEmail = Utils.isValidEmail(email);
        if (!isValidEmail) 
            throw new Error("The email format is not valid."); 
    }

    private ValidateRequiredField<T extends object>(obj: T, properties: (keyof T)[]): void {
        const missingFields: string[] = [];
        for (const prop of properties) {
            const value = obj[prop];
            if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
            missingFields.push(String(prop));
            }
        }
        if (missingFields.length > 0) 
            throw new Error(`The fields ${missingFields.join(", ")} ${missingFields.length===1 ? "is" : "are"} required.`);
    }

    private GenerateUniqueSlug(title: string): string {
        const baseSlug = slugify(title, { lower: true, strict: true });
        const now = new Date();
        const uniqueSuffix = `${now.getFullYear()}${(now.getMonth() + 1)
            .toString()
            .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
            .getHours()
            .toString()
            .padStart(2, "0")}${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;
        return `${baseSlug}-${uniqueSuffix}`;
    }

    private async HandleCoverImage(req: Request): Promise<string | undefined> {
        if (!req.file) return undefined;
        const uploadDir = path.join(__dirname, "../../assets/images");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const ext = path.extname(req.file.originalname);
        const fileName = `${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, req.file.buffer);
        return `/assets/images/${fileName}`; 
    }

    private ExtractJwtPayload(req: Request): JwtPayload {
        const authHeader = req.headers["authorization"];
        if (!authHeader) throw new Error("Missing Authorization header");

        const token = authHeader.split(" ")[1];
        if (!token) throw new Error("Invalid Authorization header");

        const decoded = tokenService.VerifyToken(token) as JwtPayload;
        return decoded;
    }
}