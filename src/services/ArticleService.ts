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

    async CreateArticle(newArticle: NewArticleDto): Promise<void> {
        await this.articleRepository.SaveArticle(newArticle);
    }

    async UpdateArticle(updateArticle: UpdateArticleDto): Promise<void> {
        await this.articleRepository.UpdateArticle(updateArticle);
    }

    async RateArticle(authorId: number, articleId: number, rate?: number, comment?: string): Promise<void> {
        let article = await this.GetArticle(articleId);
        if(!article) throw new Error("Article not found");
        if(article.authorId === authorId) throw new Error("You cannot rate your own article");
        await this.articleRepository.RateArticle(authorId, articleId, rate, comment);
    }

    async RemoveRate(authorId: number, articleId: number): Promise<void> {
        await this.articleRepository.RemoveRate(authorId, articleId);
    }

    async DeleteArticle(authorId: number, articleId: number): Promise<void> {
        let article = await this.GetArticle(articleId);
        if(!article) throw new Error("Article not found");
        await this.articleRepository.DeleteArticle(authorId, articleId);
    }
}