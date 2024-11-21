import { prisma } from '../utils/db';
import { marked } from 'marked';

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const articleController = {
  // Get all articles
  getAllArticles: async ({ query }: { query: { page?: number, limit?: number } }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const articles = await prisma.article.findMany({
      skip,
      take: limit,
      include: {
        tags: true,
        _count: {
          select: { comments: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.article.count();

    return {
      articles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Get article by ID
  getArticleById: async ({ params }: { params: { id: string } }) => {
    try {
      const id = parseInt(params.id, 10);
      
      if (isNaN(id) || id <= 0) {
        throw new Error('Invalid article ID');
      }

      const article = await prisma.article.findUnique({
        where: { 
          id // Prisma will handle the type conversion since id is now a number
        },
        include: {
          tags: true,
          comments: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!article) {
        throw new Error('Article not found');
      }

      // Convert markdown to HTML
      return {
        ...article,
        content: marked(article.content)
      };
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid article ID' || error.message === 'Article not found') {
          throw error;
        }
      }
      console.error('Error in getArticleById:', error);
      throw new Error('Failed to fetch article');
    }
  },

  // Get single article by slug
  getArticleBySlug: async ({ params: { slug } }: { params: { slug: string } }) => {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        tags: true,
        comments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!article) {
      throw new Error('Article not found');
    }

    // Convert markdown to HTML if needed
    article.content = marked(article.content);
    
    return article;
  },

  // Create new article
  createArticle: async ({ body }: { body: any }) => {
    const { title, content, tags = [], ...rest } = body;
    
    // Create URL-friendly slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-');

    const article = await prisma.article.create({
      data: {
        title,
        content,
        slug,
        ...rest,
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      },
      include: {
        tags: true
      }
    });

    return article;
  },

  // Update article
  updateArticle: async ({ params: { slug }, body }: { params: { slug: string }, body: any }) => {
    const { tags, ...rest } = body;

    const article = await prisma.article.update({
      where: { slug },
      data: {
        ...rest,
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag }
            }))
          }
        })
      },
      include: {
        tags: true
      }
    });

    return article;
  },

  // Delete article
  deleteArticle: async ({ params: { slug } }: { params: { slug: string } }) => {
    await prisma.article.delete({
      where: { slug }
    });

    return { message: 'Article deleted successfully' };
  },

  // Get related articles by tags
  getRelatedArticles: async ({ params }: { params: { id: string } }) => {
    try {
      const articleId = parseInt(params.id, 10);
      
      if (isNaN(articleId)) {
        throw new Error('Invalid article ID');
      }

      // Get the current article's tags
      const currentArticle = await prisma.article.findUnique({
        where: { id: articleId },
        include: { tags: true }
      });

      if (!currentArticle) {
        throw new Error('Article not found');
      }

      const tagIds = currentArticle.tags.map(tag => tag.id);

      // Find articles that share the same tags, excluding the current article
      const relatedArticles = await prisma.article.findMany({
        where: {
          AND: [
            { id: { not: articleId } },
            { tags: { some: { id: { in: tagIds } } } }
          ]
        },
        include: {
          tags: true
        },
        take: 4,
        orderBy: {
          createdAt: 'desc'
        }
      });

      return relatedArticles;
    } catch (error) {
      console.error('Error in getRelatedArticles:', error);
      throw error;
    }
  }
};

export { NotFoundError, ValidationError };
