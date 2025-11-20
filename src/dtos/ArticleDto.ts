import { RatingDto } from "./RatingDto";

export enum Status {
    draft = "draft",
    published = "published",
    archived = "archived"
}

export type ArticleDto = {
    authorId?: number;
    id?: number;
    title?: string;
    slug?: string;
    content?: string;
    coverImage?: string;
    tags?: string[];
    status?: Status;
    createdAt?: Date;
    updatedAt?: Date;
    averageRate?: number;
    ratings?: RatingDto[];
}