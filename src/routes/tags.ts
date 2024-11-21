import { Elysia, t } from 'elysia';
import { tagController } from '../controllers/tagController';

export const tagRoutes = new Elysia({ prefix: '/tags' })
  .get('/', tagController.getAllTags)
  .get('/:name/articles', tagController.getArticlesByTag, {
    params: t.Object({
      name: t.String()
    }),
    query: t.Object({
      page: t.Optional(t.Number()),
      limit: t.Optional(t.Number())
    })
  })
  .post('/', tagController.createTag, {
    body: t.Object({
      name: t.String()
    })
  })
  .delete('/:name', tagController.deleteTag, {
    params: t.Object({
      name: t.String()
    })
  });