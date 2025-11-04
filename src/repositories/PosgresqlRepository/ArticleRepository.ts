import { Pool } from "pg";
import { IArticleRepository } from "../interfaces/IArticleRepository";
import { DatabaseConfigDto } from "../../dtos/DatabaseConfigDto";
import { ArticleDto } from "../../dtos/ArticleDto";
import { NewArticleDto } from "../../dtos/NewArticleDto";
import { UpdateArticleDto } from "../../dtos/UpdateArticleDto";
import { OPERATION_FAILED } from "../../constants/Constants";

export class ArticleRepository implements IArticleRepository {
  private SAVE_ARTICLE = `
        INSERT INTO articles author_id, title, slug, content, cover_image, tags, status
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

  private GET_ARTICLE = `
    SELECT a.id, a.title, a.slug, a.content, a.cover_image, a.tags, a.status, a.created_at AS article_created_at,
           a.updated_at AS article_updated_at, ua.user_name AS author_username, ur.user_name AS rating_author_username,
           r.rate, r.comment, r.created_at AS rating_created_at, r.updated_at AS rating_updated_at
    FROM articles AS a
    LEFT JOIN users AS ua ON ua.id = a.author_id
    LEFT JOIN ratings AS r ON r.article_id = a.id
    LEFT JOIN users AS ur ON ur.id = r.user_id   
    WHERE a.id = $1
    ORDER BY r.created_at DESC;
  `;

  private UPDATE_ARTICLE = `
    UPDATE articles
    SET title = $1, slug = $2, content = $3, cover_image = $4, tags = $5, status = $6, updated_at = NOW()
    WHERE id = $7 AND author_id = $8
    RETURNING id, title, slug, content, cover_image, tags, status, updated_at;
  `
  private RATE_ARTICLE = `
    INSERT INTO ratings (user_id, article_id, rate, comment, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    ON CONFLICT (user_id, article_id)
    DO UPDATE SET
      rate = EXCLUDED.rate,
      comment = EXCLUDED.comment,
      updated_at = NOW();
  `
  private REMOVE_RATE = `
    DELETE FROM ratings
    WHERE user_id = $1 AND article_id = $2;
  `;

  private DELETE_ARTICLE = `
    DELETE FROM articles
    WHERE id = $1 AND author_id = $2;
  `;

  private DELETE_RATINGS = `
    DELETE FROM ratings 
    WHERE article_id = $1;
  `

  private pool: Pool;

  constructor(dbConfigs: DatabaseConfigDto) {
    this.pool = new Pool(dbConfigs);
  }

  async SaveArticle(newArticle: NewArticleDto): Promise<void> {
    try {
      const values = [
        newArticle.authorId,
        newArticle.title,
        newArticle.slug,
        newArticle.content,
        newArticle.coverImage,
        newArticle.status,
      ];
      await this.pool.query(this.SAVE_ARTICLE, values);
    } catch (error) {
      throw new Error(OPERATION_FAILED);
    }
  }

  async GetArticle(articleId: number): Promise<ArticleDto | null> {
    try {
     const { rows } = await this.pool.query(this.GET_ARTICLE, [articleId]);
     if(rows.length === 0) return null;
     
     const articleRow = rows[0];
     const article: ArticleDto = {
        authorUserName: articleRow.author_username,
        title: articleRow.title,
        slug: articleRow.slug,
        content: articleRow.content,
        coverImage: articleRow.cover_image,
        tags: articleRow.tags,
        status: articleRow.status,
        createdAt: articleRow.article_created_at,
        updatedAt: articleRow.article_updated_at,
        ratings: [],
      };

      const ratings = rows.filter(r => r.rate !== null || r.comment !== null).map((r) => ({
        username: r.rating_author_username,
          rate: r.rate,
          comment: r.comment,
          createdAt: r.rating_created_at,
          updatedAt: r.rating_updated_at,
      }))

      article.ratings = ratings;

      if (ratings.length > 0) {
        const validRates = ratings.filter(r => typeof r.rate === "number");
        article.averageRate = validRates.length > 0 ? validRates.reduce((sum, r) => sum + (r.rate ?? 0), 0) / validRates.length : undefined;
      }
      else article.averageRate = undefined;
      return article;
    } catch (error) {
      throw new Error(OPERATION_FAILED);
    }
  }

  async UpdateArticle(updateArticle: UpdateArticleDto): Promise<void> {
    try {
      const values = [
        updateArticle.title,
        updateArticle.slug,
        updateArticle.content,
        updateArticle.coverImage,
        updateArticle.tags,
        updateArticle.status,
        updateArticle.articleId,
        updateArticle.authorId
      ];
      await this.pool.query(this.UPDATE_ARTICLE, values);
    } catch (error) {
      throw new Error(OPERATION_FAILED);
    }
  }

  async RateArticle( userId: number, articleId: number, rate: number, comment: string ): Promise<void> {
    try {
        await this.pool.query(this.RATE_ARTICLE, [userId, articleId, rate, comment]);
    } catch (error) {
        console.error("Erreur lors de la notation :", error);
        throw new Error(OPERATION_FAILED);
    }
  }

  async RemoveRate(userId: number, articleId: number): Promise<void> {
    try {
        await this.pool.query(this.REMOVE_RATE, [userId, articleId]);
    } catch (error) {
        throw new Error(OPERATION_FAILED);
    }
  }

  async DeleteArticle(userId: number, articleId: number): Promise<void> {
    const client = await this.pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(this.DELETE_RATINGS, [articleId]);
        await client.query(this.DELETE_ARTICLE, [articleId, userId]);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(OPERATION_FAILED);
    } finally {
        client.release();
    }
 }
}
