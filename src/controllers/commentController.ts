import { prisma } from '../utils/db';

export const commentController = {
  // Get comments for an article
  getArticleComments: async ({ 
    params: { articleId },
    query 
  }: { 
    params: { articleId: string },
    query: { page?: number, limit?: number }
  }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: {
        articleId: Number(articleId)
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.comment.count({
      where: {
        articleId: Number(articleId)
      }
    });

    return {
      comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Create new comment
  createComment: async ({ 
    params: { articleId }, 
    body 
  }: { 
    params: { articleId: string }, 
    body: { content: string, author: string, email: string } 
  }) => {
    const comment = await prisma.comment.create({
      data: {
        ...body,
        articleId: Number(articleId)
      }
    });

    return comment;
  },

  // Delete comment
  deleteComment: async ({ 
    params: { id } 
  }: { 
    params: { id: string } 
  }) => {
    await prisma.comment.delete({
      where: { id: Number(id) }
    });

    return { message: 'Comment deleted successfully' };
  }
};
