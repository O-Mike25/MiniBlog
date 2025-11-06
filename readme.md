# 📰 Mini Blog API

A minimal blogging platform built with **Node.js**, **Express**, and **PostgreSQL**, featuring user authentication (JWT), article management, and article rating.

---

## 🚀 Overview

Mini Blog provides a simple REST API that allows users to:

- Sign up and sign in using JWT authentication  
- Create, update, and delete articles    
- Rate and unrate articles  
- Fetch specific articles with ratings and author details  
- Manage actions based on **user roles** (`admin`, `user`)
  
---

## ⚙️ Tech Stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** PostgreSQL  
- **Auth:** JSON Web Tokens (JWT)  

---

## 🏗️ Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/O-Mike25/MiniBlog.git
cd mini-blog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/miniblog
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=token_expiration_time_in_seconds
```

### 4. Run the application

```bash
npm run dev
```

By default, the server runs on **http://localhost:3000**

---

## 🔐 Authentication

All routes requiring authentication use a **Bearer Token**.

### Example Header

```
Authorization: Bearer <your_token_here>
```

Tokens are obtained through the `/users/signin` endpoint.

---

## 📘 API Documentation

### Base URL

```
http://localhost:3000
```

---

### 🏠 Root Endpoint

**GET /**  
Returns a simple welcome message.

#### Response
```json
"Welcome on mini blog 👋"
```

---

### 👤 User Endpoints

#### 1. **POST /users/signup**

Create a new user account.

**Body (JSON)**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "MyStrongPass123!"
}
```

**Response:**
```json
{ "message": "User registered successfully." }
```

---

#### 2. **POST /users/signin**

Authenticate a user and return a JWT token.

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "MyStrongPass123!"
}
```

**Response:**
```json
{
  "message": "User logged successfully.",
  "token": "<jwt_token>",
}
```

---

### 📝 Article Endpoints

#### 4. **POST /users/:id/article**

Requires: 🔐 Token  
Creates a new article for the given user.

**Form-Data:**

| Key          | Value Example                        | Type                   |
|--------------|--------------------------------------|------------------------|
| title        | My First Article                     | Text                   |
| content      | Hello world!                         | Text                   |
| tags         | tech                                 | Text (can be multiple) |
| coverImage   | (upload file)                        | File                   |
| status       | "draft" or "published" or "archived" | Text                   |

**Response:**
```json
{ "message": "Article created successfully." }
```

---

#### 5. **PUT /users/:authorId/article/:articleId**

Requires: 🔐 Token  
Updates an article’s content or cover image.

**Form-Data:**

| Key          | Value Example             | Type   |
|--------------|---------------------------|--------|
| title        | Updated Article Title     | Text   |
| content      | Updated content...        | Text   |
| tags         | updated,tech,blog         | Text   |
| coverImage   | (optional file)           | File   |

**Response:**
```json
{ "message": "Article updated successfully." }
```

---

#### 6. **GET /article/:id**

Fetch a specific article with its ratings and author.

**Response:**
```json
{
  "authorId": 1,
  "title": "My First Article",
  "slug": "mon-premier-article",
  "coverImage": "",
  "content": "Hello world!",
  "tags": ["tech"],
  "status": "published",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:45:00Z",
  "ratings": [
    {
      "username": "janedoe",
      "rate": 5,
      "comment": "Loved it!",
      "createdAt": "2025-01-16T09:20:00Z",
      "updatedAt": "2025-01-16T09:20:00Z"
    }
  ]
}
```

---

#### 7. **DELETE /users/:authorId/article/:articleId**

Requires: 🔐 Token  
Deletes an article owned by the given author.

**Response:**
```json
{ "message": "Article deleted successfully." }
```

---

### ⭐ Article Ratings

#### 8. **POST /users/:authorId/article/:articleId/rate**

Requires: 🔐 Token  
Rate an article.

**Body (JSON):**
```json
{
  "rate": 4,
  "comment": "Very informative post!"
}
```

**Response:**
```json
{ "message": "Article rated successfully." }
```

---

#### 9. **DELETE /users/:authorId/article/:articleId/rate**

Requires: 🔐 Token  
Removes your rating for an article.

**Response:**
```json
{ "message": "Rating removed successfully." }
```

---

## 🧪 Example curl commands

**Sign in:**
```bash
curl -X POST http://localhost:3000/users/signin   -H "Content-Type: application/json"   -d '{"email":"john@example.com","password":"MyStrongPass123!"}'
```

**Create an article (form-data):**
```bash
curl -X POST http://localhost:3000/users/1/article   -H "Authorization: Bearer <token>"   -F "title=My new post"   -F "content=This is my first blog post."   -F "tags=tech"   -F "coverImage=@/path/to/image.jpg"
```
---

## 🛠️ Support

If you encounter any issues, you can get support via:

- **GitHub Issues:** [https://github.com/O-Mike25/MiniBlog/issues](https://github.com/O-Mike25/MiniBlog/issues)

---

## 📄 License

MIT License © 2025 Mini Blog Project

---

## ✨ Author

Developed with ❤️ by **[O-Mike25]**
