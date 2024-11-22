import { Elysia, t } from 'elysia';
import { tagController } from '../controllers/tagController';

export const tagRoutes = new Elysia({ prefix: '/tags' })
  .get('/topics', tagController.getTagsForTopics, {
    detail: {
      tags: ['tags'],
      description: 'Get tag list for topics with article counts and metadata',
      responses: {
        200: t.Array(t.Object({
          name: t.String(),
          articleCount: t.Number(),
          lastActive: t.Union([t.Number(), t.Null()])
        }))
      }
    }
  })
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
