import { prisma } from '../utils/db';

export const tagController = {
  // Get all tags with article count
  getAllTags: async () => {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    return tags;
  },

  // Get articles by tag
  getArticlesByTag: async ({ 
    params: { name },
    query 
  }: { 
    params: { name: string },
    query: { page?: number, limit?: number }
  }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const tag = await prisma.tag.findUnique({
      where: { name },
      include: {
        articles: {
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
        },
        _count: {
          select: { articles: true }
        }
      }
    });

    if (!tag) {
      throw new Error('Tag not found');
    }

    return {
      tag: tag.name,
      articles: tag.articles,
      meta: {
        total: tag._count.articles,
        page,
        limit,
        totalPages: Math.ceil(tag._count.articles / limit)
      }
    };
  },

  // Create new tag
  createTag: async ({ body }: { body: { name: string } }) => {
    const tag = await prisma.tag.create({
      data: body,
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    return tag;
  },

  // Delete tag
  deleteTag: async ({ params: { name } }: { params: { name: string } }) => {
    await prisma.tag.delete({
      where: { name }
    });

    return { message: 'Tag deleted successfully' };
  }
};
