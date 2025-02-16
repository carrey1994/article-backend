import { prisma } from '../utils/db';

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
  // Get all articles with optional tag filtering
  getAllArticles: async ({ query }: { query: { page?: number, limit?: number, tags?: string } }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const tags = query.tags ? query.tags.split(',') : undefined;

    const where = tags ? {
      tags: {
        some: {
          name: {
            in: tags
          }
        }
      }
    } : {};

    const articles = await prisma.article.findMany({
      where,
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

    const total = await prisma.article.count({ where });

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
          id
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

      // Return the article with original content formatting
      return article;
      
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

      // Return related articles with original content formatting
      return relatedArticles;
    } catch (error) {
      console.error('Error in getRelatedArticles:', error);
      throw error;
    }
  },
  
};

export { NotFoundError, ValidationError };
