import { ArticleDto } from "../../dtos/ArticleDto";
import { NewArticleDto } from "../../dtos/NewArticleDto";
import { UpdateArticleDto } from "../../dtos/UpdateArticleDto";

export interface  IArticleRepository {
    SaveArticle(newArticleDto: NewArticleDto) :Promise<void>;
    GetArticle(articleId: number): Promise<ArticleDto | null>;
    UpdateArticle(updateArticleDto: UpdateArticleDto): Promise<void>;
    RateArticle(authorId: number, articleId: number, rate?: number, comment?: string): Promise<void>;
    RemoveRate(authorId: number, articleId: number): Promise<void>;
    DeleteArticle(authorId: number, articleId: number): Promise<void>;
}