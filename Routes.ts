import { Router, Request, Response } from "express";
import { Container } from "./src/Container";
import { VerifyToken } from "./src/Middlewares/authentication";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router: Router = Router();
const userController = Container.controllers.userController;

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Returns a welcome message
 */
router.get("/", (req: Request, res: Response) => {
  res.send("Welcome on mini blog 👋");
});

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully created
 *       400:
 *         description: Validation error
 */
router.post("/users/signup", (req, res) =>
  userController.SignUpUser(req, res)
);

/**
 * @swagger
 * /users/signin:
 *   post:
 *     summary: Login and retrieve JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post("/users/signin", (req, res) =>
  userController.SignInUser(req, res)
);

router.post(
  "/users/signout",
  VerifyToken(),
  (req, res) => userController.SignOutUser(req, res)
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user's profile
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get(
  "/users/:id",
  (req, res) => userController.ObtainUser(req, res)
);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update a user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatarImage:
 *                 type: string
 *                 format: binary
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.put(
  "/users/:userId",
  VerifyToken(),
  upload.single("avatarImage"),
  (req, res) => userController.UpdateUser(req, res)
);

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User removed successfully
 *       400:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.delete(
  "/users/:userId",
  VerifyToken(),
  (req, res) => userController.RemoveUser(req, res)
);

/**
 * @swagger
 * /users/{id}/article:
 *   post:
 *     summary: Create a new article for a user
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the author creating the article
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Article created successfully
 *       400:
 *         description: Validation error or missing fields
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/users/:id/article",
  VerifyToken(),
  upload.single("coverImage"),
  (req, res) => userController.AddArticle(req, res)
);

/**
 * @swagger
 * /users/{authorId}/article/{articleId}:
 *   put:
 *     summary: Update an existing article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: authorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the article's author
 *       - name: articleId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the article to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       400:
 *         description: Validation error or access denied
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 */
router.put(
  "/users/:authorId/article/:articleId",
  VerifyToken(),
  upload.single("coverImage"),
  (req, res) => userController.UpdateArticle(req, res)
);

/**
 * @swagger
 * /article/{id}:
 *   get:
 *     summary: Get a single article with its average rating and comments
 *     tags: [Articles]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the article to retrieve
 *     responses:
 *       200:
 *         description: Article retrieved successfully
 *       404:
 *         description: Article not found
 */
router.get("/article/:id", (req, res) =>
  userController.ObtainArticle(req, res)
);

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Get list of all articles (minimal fields)
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: List of articles
 */
router.get("/articles", (req, res) =>
  userController.ObtainArticles(req, res)
);

/**
 * @swagger
 * /users/{authorId}/article/{articleId}:
 *   delete:
 *     summary: Delete an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: authorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the article's author
 *       - name: articleId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the article to delete
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 */
router.delete(
  "/users/:authorId/article/:articleId",
  VerifyToken(),
  (req, res) => userController.DeleteArticle(req, res)
);

/**
 * @swagger
 * /users/{authorId}/article/{articleId}/rate:
 *   post:
 *     summary: Add a new rating to an article
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: authorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the article's author
 *       - name: articleId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the article to rate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rate:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rating added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/users/:authorId/article/:articleId/rate",
  VerifyToken(),
  (req, res) => userController.RateArticle(req, res)
);

/**
 * @swagger
 * /users/{authorId}/article/{articleId}/rate:
 *   delete:
 *     summary: Remove the current user's rating from an article
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: authorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the article's author
 *       - name: articleId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id of the article whose rating should be removed
 *     responses:
 *       200:
 *         description: Rating removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Rating not found
 */
router.delete(
  "/users/:authorId/article/:articleId/rate",
  VerifyToken(),
  (req, res) => userController.RemoveRate(req, res)
);

export default router;
