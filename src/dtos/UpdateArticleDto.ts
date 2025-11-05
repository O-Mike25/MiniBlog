import { Status } from "./ArticleDto";

export type UpdateArticleDto = {
    articleId: number;
    authorId: number;
    title?: string;
    content?: string;
    coverImage?: string;
    tags?: string[];
    status?: Status;
}