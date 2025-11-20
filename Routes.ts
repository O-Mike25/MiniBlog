import { Router, Request, Response } from "express";
import { Container } from "./src/Container";
import { VerifyToken } from "./src/Middlewares/authentication";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router: Router = Router();
const userController = Container.controllers.userController;

router.get("/", (req: Request, res: Response) => {
  res.send("Welcome on mini blog 👋");
});

router.post("/users/signup", (req, res) => userController.SignUpUser(req, res));
router.post("/users/signin", (req, res) => userController.SignInUser(req, res));
router.post("/users/signout", VerifyToken(), (req, res) => userController.SignOutUser(req, res));

router.post(
  "/users/:id/article",
  VerifyToken(),
  upload.single("coverImage"),
  (req, res) => userController.AddArticle(req, res)
);

router.put(
  "/users/:authorId/article/:articleId",
  VerifyToken(),
  upload.single("coverImage"),
  (req, res) => userController.UpdateArticle(req, res)
);

router.get("/article/:id", (req, res) =>
  userController.ObtainArticle(req, res)
);

router.get("/articles", (req, res) =>
  userController.ObtainArticles(req, res)
);

router.delete(
  "/users/:authorId/article/:articleId",
  VerifyToken(),
  (req, res) => userController.DeleteArticle(req, res)
);

router.post(
  "/users/:authorId/article/:articleId/rate",
  VerifyToken(),
  (req, res) => userController.RateArticle(req, res)
);

router.delete(
  "/users/:authorId/article/:articleId/rate",
  VerifyToken(),
  (req, res) => userController.RemoveRate(req, res)
);
export default router;
