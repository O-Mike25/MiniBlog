import { JwtPayload } from "jsonwebtoken";
import { tokenService } from "../Container";
import { Response, NextFunction } from "express";
import { CustomRequest } from "../types";

export function VerifyToken(checkBlacklist: boolean = true) {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers["authorization"];
            if (!authHeader) return res.status(401).json({ message: "Missing token" });
            const token = authHeader.split(" ")[1];
            if (!token) return res.status(401).json({ message: "Invalid token" });
            const decoded = tokenService.VerifyToken(token);
            if (checkBlacklist) {
                const isBlacklisted = await tokenService.IsBlacklisted(token);
                if (isBlacklisted) return res.status(401).json({ message: "Token has been blacklisted" });
            }
            req.user = decoded as JwtPayload;
            next();
        } catch (error) {
            console.error("Token verification error", error);
            return res.status(403).json({ message: "Token verification error" });
        }
    }
}

