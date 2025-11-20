import { Pool } from "pg";
import { IArticleRepository } from "../interfaces/IArticleRepository";
import { DatabaseConfigDto } from "../../dtos/DatabaseConfigDto";
import { ArticleDto } from "../../dtos/ArticleDto";
import { NewArticleDto } from "../../dtos/NewArticleDto";
import { UpdateArticleDto } from "../../dtos/UpdateArticleDto";
import { OPERATION_FAILED } from "../../constants/Constants";

export class ArticleRepository implements IArticleRepository {
  private SAVE_ARTICLE = `
        INSERT INTO articles (author_id, title, slug, content, cover_image, tags, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

  private GET_ARTICLE = `
    SELECT a.author_id, a.id, a.title, a.slug, a.content, a.cover_image, a.tags, a.status, a.created_at AS article_created_at,
           a.updated_at AS article_updated_at, ua.user_name AS author_username, ur.user_name AS rating_author_username,
           r.rate, r.comment, r.created_at AS rating_created_at, r.updated_at AS rating_updated_at
    FROM articles AS a
    LEFT JOIN users AS ua ON ua.id = a.author_id
    LEFT JOIN ratings AS r ON r.article_id = a.id
    LEFT JOIN users AS ur ON ur.id = r.author_id   
    WHERE a.id = $1
    ORDER BY r.created_at DESC;
  `;

  private GET_ARTICLES = `
    SELECT a.author_id, a.id, a.title, a.slug, a.content, a.cover_image, a.tags, a.status, a.created_at AS article_created_at,
           a.updated_at AS article_updated_at, ua.user_name AS author_username, ur.user_name AS rating_author_username,
           r.rate, r.comment, r.created_at AS rating_created_at, r.updated_at AS rating_updated_at
    FROM articles AS a
    LEFT JOIN users AS ua ON ua.id = a.author_id
    LEFT JOIN ratings AS r ON r.article_id = a.id
    LEFT JOIN users AS ur ON ur.id = r.author_id   
    ORDER BY r.created_at DESC;
  `

  private UPDATE_ARTICLE = `
    UPDATE articles
    SET title = $1, content = $2, cover_image = $3, tags = $4, status = $5, updated_at = NOW()
    WHERE id = $6 AND author_id = $7
    RETURNING id, title, content, cover_image, tags, status, updated_at;
  `
  private RATE_ARTICLE = `
    INSERT INTO ratings (author_id, article_id, rate, comment, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    ON CONFLICT (author_id, article_id)
    DO UPDATE SET
      rate = EXCLUDED.rate,
      comment = EXCLUDED.comment,
      updated_at = NOW();
  `
  private REMOVE_RATE = `
    DELETE FROM ratings
    WHERE author_id = $1 AND article_id = $2;
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
        Array.isArray(newArticle.tags) ? newArticle.tags : [newArticle.tags],
        newArticle.tags,
        newArticle.status,
      ];
      await this.pool.query(this.SAVE_ARTICLE, values);
    } catch (error) {
      console.log(error)
      throw new Error(OPERATION_FAILED);
    }
  }

  async GetArticles(): Promise<ArticleDto[]> {
    try {
      const { rows } = await this.pool.query(this.GET_ARTICLES);
      if (rows.length === 0) return [];
      const articlesMap = new Map<number, ArticleDto>();

      for (const row of rows) {
        if (!articlesMap.has(row.id)) {
          articlesMap.set(row.id, {
            authorId: row.author_id,
            id: row.id,
            title: row.title,
            slug: row.slug,
            content: row.content,
            coverImage: row.cover_image,
            tags: row.tags,
            status: row.status,
            createdAt: row.article_created_at,
            updatedAt: row.article_updated_at,
            ratings: [],
            averageRate: undefined,
          });
        }
        const article = articlesMap.get(row.id)!;

        if (row.rate !== null || row.comment !== null) {
          article.ratings!.push({
            username: row.rating_author_username,
            rate: row.rate,
            comment: row.comment,
            createdAt: row.rating_created_at,
            updatedAt: row.rating_updated_at,
          });
        }
      }

      for (const article of articlesMap.values()) {
        if (article.ratings!.length > 0) {
          const validRates = article.ratings!.filter(r => typeof r.rate === "number");
          article.averageRate =
            validRates.length > 0
              ? validRates.reduce((sum, r) => sum + (r.rate ?? 0), 0) / validRates.length
              : undefined;
        } else {
          article.averageRate = undefined;
        }
      }

      return Array.from(articlesMap.values());
    } catch (error) {
      console.error(error);
      throw new Error(OPERATION_FAILED);
    }
  }

  async GetArticle(articleId: number): Promise<ArticleDto | null> {
    try {
     const { rows } = await this.pool.query(this.GET_ARTICLE, [articleId]);
     if(rows.length === 0) return null;
     
     const articleRow = rows[0];
     const article: ArticleDto = {
        authorId: articleRow.author_id,
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
      console.log(error)
      throw new Error(OPERATION_FAILED);
    }
  }

  async UpdateArticle(updateArticle: UpdateArticleDto): Promise<void> {
    try {
      const values = [
        updateArticle.title,
        updateArticle.content,
        updateArticle.coverImage,
        Array.isArray(updateArticle.tags) ? updateArticle.tags : [updateArticle.tags],
        updateArticle.status,
        updateArticle.articleId,
        updateArticle.authorId
      ];
      const result = await this.pool.query(this.UPDATE_ARTICLE, values);
      if (result.rowCount === 0) 
        throw new Error("Article not found.");      
    } catch (error) {
      if(error instanceof Error && error.message === "Article not found.") throw new Error("Article not found.");
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
