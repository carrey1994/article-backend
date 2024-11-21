import { Elysia, t } from 'elysia';
import { articleController } from '../controllers/articleController';

export const articleRoutes = new Elysia({ prefix: '/articles' })
  .get('/', articleController.getAllArticles, {
    query: t.Object({
      page: t.Optional(t.Number()),
      limit: t.Optional(t.Number())
    })
  })
  .get('/id/:id', async ({ params, set }) => {
    try {
      // Convert id to number here
      const id = parseInt(params.id, 10);
      if (isNaN(id) || id <= 0) {
        set.status = 400;
        return {
          error: 'Invalid article ID format',
          details: 'Article ID must be a positive integer'
        };
      }

      // Pass the converted number ID
      const result = await articleController.getArticleById({ 
        params: { id: id.toString() } 
      });
      return result;
    } catch (error) {
      console.error('Route error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Invalid article ID') {
          set.status = 400;
          return {
            error: 'Invalid article ID format',
            details: 'Article ID must be a positive integer'
          };
        }
        if (error.message === 'Article not found') {
          set.status = 404;
          return {
            error: 'Article not found',
            details: `No article found with ID ${params.id}`
          };
        }
      }

      set.status = 500;
      return {
        error: 'Internal server error',
        details: 'An unexpected error occurred while fetching the article'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .get('/id/:id/related', async ({ params, set }) => {
    try {
      const result = await articleController.getRelatedArticles({ params });
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid article ID') {
          set.status = 400;
          return {
            error: 'Invalid article ID format',
            details: 'Article ID must be a positive integer'
          };
        }
        if (error.message === 'Article not found') {
          set.status = 404;
          return {
            error: 'Article not found',
            details: `No article found with ID ${params.id}`
          };
        }
      }
      set.status = 500;
      return {
        error: 'Internal server error',
        details: 'An unexpected error occurred while fetching related articles'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .get('/:slug', articleController.getArticleBySlug, {
    params: t.Object({
      slug: t.String()
    })
  })
  .post('/', articleController.createArticle, {
    body: t.Object({
      title: t.String(),
      content: t.String(),
      excerpt: t.Optional(t.String()),
      coverImage: t.Optional(t.String()),
      published: t.Optional(t.Boolean()),
      tags: t.Optional(t.Array(t.String()))
    })
  })
  .put('/:slug', articleController.updateArticle, {
    params: t.Object({
      slug: t.String()
    }),
    body: t.Object({
      title: t.Optional(t.String()),
      content: t.Optional(t.String()),
      excerpt: t.Optional(t.String()),
      coverImage: t.Optional(t.String()),
      published: t.Optional(t.Boolean()),
      tags: t.Optional(t.Array(t.String()))
    })
  })
  .delete('/:slug', articleController.deleteArticle, {
    params: t.Object({
      slug: t.String()
    })
  });
