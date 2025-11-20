import { ArticleService } from "../../../src/services/ArticleService";
import { IArticleRepository } from "../../../src/repositories/interfaces/IArticleRepository";
import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { Status } from "../../../src/dtos/ArticleDto";

describe("ArticleService", () => {
  const AUTHOR_ID = 1;
  const USER_NAME = "john.doe";
  const ARTICLE_ID = 1;
  const ARTICLE_TITLE = "Introduction to Functional Programming";
  const ARTICLE_SLUG = "introduction-functional-programming";
  const ARTICLE_CONTENT = `
        Functional programming is a paradigm based on the use of pure functions 
        and the absence of side effects. It promotes more predictable, testable, and maintainable code.
    `;
  const ARTICLE_COVER_IMAGE = "https://example.com/images/functional-cover.jpg";
  const ARTICLE_TAGS = ["programming", "functional", "typescript"];
  const ARTICLE_STATUS = Status.published;
  const ARTICLE_COMMENT = "nice article";
  const ARTICLE_RATE = 10;
  const ARTICLE_CREATED_AT = new Date("2025-01-10T09:00:00Z");
  const ARTICLE_UPDATED_AT = new Date("2025-01-12T15:30:00Z");
  const RATING_CREATED_AT = new Date("2025-01-12T16:00:00Z");
  const RATING_UPDATED_AT = new Date("2025-01-12T16:00:00Z");

  let articleRepository: jest.Mocked<IArticleRepository>;
  let articleService: ArticleService;

  beforeEach(() => {
    articleRepository = {
      SaveArticle: jest.fn(),
      GetArticle: jest.fn(),
      GetArticles: jest.fn(),
      UpdateArticle: jest.fn(),
      RateArticle: jest.fn(),
      RemoveRate: jest.fn(),
      DeleteArticle: jest.fn(),
    };
    articleService = new ArticleService(articleRepository);
  });

  describe("CreateArticle", () => {
    test("Given new article infos When Creating an article Then call persistance", async () => {
      const newArticle = {
        authorId: AUTHOR_ID,
        title: ARTICLE_TITLE,
        slug: ARTICLE_SLUG,
        content: ARTICLE_CONTENT,
        coverImage: ARTICLE_COVER_IMAGE,
        tags: ARTICLE_TAGS,
        status: ARTICLE_STATUS,
      };

      articleService.CreateArticle(newArticle);

      expect(articleRepository.SaveArticle).toHaveBeenCalledWith(newArticle);
    });
  });

  describe("UpdateArticle", () => {
    test("Given article infos When updating an article Then call persistance", async () => {
      const updateArticleInfos = {
        articleId: ARTICLE_ID,
        authorId: AUTHOR_ID,
        title: ARTICLE_TITLE,
        content: ARTICLE_CONTENT,
        coverImage: ARTICLE_COVER_IMAGE,
        tags: ARTICLE_TAGS,
        status: ARTICLE_STATUS,
      };

      articleService.UpdateArticle(updateArticleInfos);

      expect(articleRepository.UpdateArticle).toHaveBeenCalledWith(
        updateArticleInfos
      );
    });
  });

  describe("GetArticle", () => {
    test("Given articleId and authorId When fetching article Then call persistance", async () => {
      articleService.GetArticle(ARTICLE_ID);

      expect(articleRepository.GetArticle).toHaveBeenCalledWith(ARTICLE_ID);
    });

    test("Given existing article When fetching article Then return article", async () => {
      let expectedArticle = {
        authorId: AUTHOR_ID,
        title: ARTICLE_TITLE,
        slug: ARTICLE_SLUG,
        content: ARTICLE_CONTENT,
        coverImage: ARTICLE_COVER_IMAGE,
        tags: ARTICLE_TAGS,
        status: ARTICLE_STATUS,
        createdAt: ARTICLE_CREATED_AT,
        updatedAt: ARTICLE_UPDATED_AT,
        averageRate: ARTICLE_RATE,
        ratings: [
          {
            username: USER_NAME,
            rate: ARTICLE_RATE,
            comment: ARTICLE_COMMENT,
            createdAt: RATING_CREATED_AT,
            updatedAt: RATING_UPDATED_AT
          }
        ]
      }
      articleRepository.GetArticle.mockResolvedValue(expectedArticle)

      let obtainedArticle = await articleService.GetArticle(ARTICLE_ID);

      expect(obtainedArticle).toEqual(expectedArticle);
    });
  });

  describe("GetArticles", () => {
    test("When fetching articles Then call persistance", async () => {
      articleRepository.GetArticles.mockResolvedValue([]);
      
      articleService.GetArticles();

      expect(articleRepository.GetArticles).toHaveBeenCalled();
    });

    test("Given existing articles When fetching articles Then return articles", async () => {
      let article = {
        authorId: AUTHOR_ID,
        id: ARTICLE_ID,
        title: ARTICLE_TITLE,
        slug: ARTICLE_SLUG,
        content: ARTICLE_CONTENT,
        coverImage: ARTICLE_COVER_IMAGE,
        tags: ARTICLE_TAGS,
        status: ARTICLE_STATUS,
        createdAt: ARTICLE_CREATED_AT,
        updatedAt: ARTICLE_UPDATED_AT,
        averageRate: ARTICLE_RATE,
        ratings: [
          {
            username: USER_NAME,
            rate: ARTICLE_RATE,
            comment: ARTICLE_COMMENT,
            createdAt: RATING_CREATED_AT,
            updatedAt: RATING_UPDATED_AT
          }
        ]
      };

      let expectedArticle = {
        authorId: AUTHOR_ID,
        id: ARTICLE_ID,
        title: ARTICLE_TITLE,
        tags: ARTICLE_TAGS,
        averageRate: ARTICLE_RATE,
        coverImage: ARTICLE_COVER_IMAGE,
        createdAt: ARTICLE_CREATED_AT
      };

      articleRepository.GetArticles.mockResolvedValue([article]);

      let obtainedArticles = await articleService.GetArticles();

      expect(obtainedArticles).toEqual([expectedArticle]);
    });
  });

  describe("RateArticle", () => {
    test("Given userId, articleId, rate, and comment When rating article Then get article", async () => {
      articleRepository.GetArticle.mockResolvedValue({});

      await articleService.RateArticle(
        AUTHOR_ID,
        ARTICLE_ID,
        ARTICLE_RATE,
        ARTICLE_COMMENT
      );

      expect(articleRepository.GetArticle).toHaveBeenCalledWith(AUTHOR_ID);
    });

    test("Given userId, articleId, rate, and comment When rating article Then call persistence", async () => {
      articleRepository.GetArticle.mockResolvedValue({});
      
      await articleService.RateArticle(
        AUTHOR_ID,
        ARTICLE_ID,
        ARTICLE_RATE,
        ARTICLE_COMMENT
      );

      expect(articleRepository.RateArticle).toHaveBeenCalledWith(
        AUTHOR_ID,
        ARTICLE_ID,
        ARTICLE_RATE,
        ARTICLE_COMMENT
      );
    });
  });

  describe("RemoveRate", () => {
    test("Given userId and articleId When removing rate Then call persistence", async () => {
      await articleService.RemoveRate(AUTHOR_ID, ARTICLE_ID);

      expect(articleRepository.RemoveRate).toHaveBeenCalledWith(
        AUTHOR_ID,
        ARTICLE_ID
      );
    });
  });

  describe("DeleteArticle", () => {
    test("Given userId and articleId When deleting article Then get article", async () => {
      articleRepository.GetArticle.mockResolvedValue({});

      await articleService.DeleteArticle(AUTHOR_ID, ARTICLE_ID);

      expect(articleRepository.GetArticle).toHaveBeenCalledWith(ARTICLE_ID);
    })

    test("Given articleId and authorId When deleting article Then call persistance", async () => {
      articleRepository.GetArticle.mockResolvedValue({});

      await articleService.DeleteArticle(AUTHOR_ID, ARTICLE_ID);

      expect(articleRepository.DeleteArticle).toHaveBeenCalledWith(
        AUTHOR_ID,
        ARTICLE_ID
      );
    });
  });
});
