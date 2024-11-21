import { prisma } from '../utils/db';
import { marked } from 'marked';

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
  }
};
