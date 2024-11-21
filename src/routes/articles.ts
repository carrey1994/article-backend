import { Elysia, t } from 'elysia';
import { articleController } from '../controllers/articleController';

export const articleRoutes = new Elysia({ prefix: '/articles' })
  .get('/', articleController.getAllArticles, {
    query: t.Object({
      page: t.Optional(t.Number()),
      limit: t.Optional(t.Number())
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