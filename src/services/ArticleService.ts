import { ArticleDto } from "../dtos/ArticleDto";
import { NewArticleDto } from "../dtos/NewArticleDto";
import { UpdateArticleDto } from "../dtos/UpdateArticleDto";
import { IArticleRepository } from "../repositories/interfaces/IArticleRepository";

export class ArticleService {
    private articleRepository: IArticleRepository

    constructor(articleRepository: IArticleRepository){
        this.articleRepository = articleRepository;
    }

    async GetArticle(articleId:number): Promise<ArticleDto | null> {
        return await this.articleRepository.GetArticle(articleId)
    }

    async GetArticles(): Promise<ArticleDto[]> {
        return await this.articleRepository.GetArticles();
    }

    async CreateArticle(newArticle: NewArticleDto): Promise<void> {
        await this.articleRepository.SaveArticle(newArticle);
    }

    async UpdateArticle(updateArticle: UpdateArticleDto): Promise<void> {
        await this.articleRepository.UpdateArticle(updateArticle);
    }

    async RateArticle(authorId: number, articleId: number, rate?: number, comment?: string): Promise<void> {
        await this.articleRepository.RateArticle(authorId, articleId, rate, comment);
    }

    async RemoveRate(authorId: number, articleId: number): Promise<void> {
        await this.articleRepository.RemoveRate(authorId, articleId);
    }

    async DeleteArticle(authorId: number, articleId: number): Promise<void> {
        await this.articleRepository.DeleteArticle(authorId, articleId);
    }
}