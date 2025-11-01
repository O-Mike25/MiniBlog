import { Router, Request, Response } from "express";
import { Container } from "./src/Container";
import { VerifyToken } from "./src/Middlewares/authentication";

const router: Router = Router();
const { userController } = Container.controllers;

router.get("/", (req: Request, res: Response) => {
  res.send("Welcome on mini blog 👋");
});

router.post("/users/signup", (req, res) => userController.SignUpUser(req, res));
router.post("/users/signin", (req, res) => userController.SignInUser(req, res));
router.post("/users/signout", VerifyToken(), (req, res) => userController.SignOutUser(req, res));

export default router;
