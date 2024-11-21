import { Elysia, t } from 'elysia';
import { commentController } from '../controllers/commentController';

export const commentRoutes = new Elysia({ prefix: '/comments' })
  .get('/article/:articleId', commentController.getArticleComments, {
    params: t.Object({
      articleId: t.String()
    }),
    query: t.Object({
      page: t.Optional(t.Number()),
      limit: t.Optional(t.Number())
    })
  })
  .post('/article/:articleId', commentController.createComment, {
    params: t.Object({
      articleId: t.String()
    }),
    body: t.Object({
      content: t.String(),
      author: t.String(),
      email: t.String()
    })
  })
  .delete('/:id', commentController.deleteComment, {
    params: t.Object({
      id: t.String()
    })
  });