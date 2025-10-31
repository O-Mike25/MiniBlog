import { Router, Request, Response } from "express";
import { Container } from "./src/Container";

const router: Router = Router();
const { userController } = Container.controllers;

router.get("/", (req: Request, res: Response) => {
  res.send("Welcome on mini blog 👋");
});

router.post("/users/signup", (req, res) => userController.SignUpUser(req, res));

export default router;
