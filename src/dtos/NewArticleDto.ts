import { Status } from "./ArticleDto";

export type NewArticleDto = {
    authorId: number;
    title: string;
    slug: string;
    content: string;
    coverImage?: string;
    tags: string[];
    status: Status;
}