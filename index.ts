import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';

// Import routes
import { articleRoutes } from './src/routes/articles';
import { commentRoutes } from './src/routes/comments';
import { healthRoutes } from './src/routes/health';
import { tagRoutes } from './src/routes/tags';

// Import middleware
import { errorHandler } from './src/middleware/errorHandler';

const isDev = process.env.NODE_ENV !== 'production';

const app = new Elysia()
  .use(
    cors({
      origin: isDev ? '*' : ['http://localhost:3001'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      credentials: false,
      preflight: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Blog API Documentation',
          version: '1.0.0',
          description: 'API documentation for the blog backend',
        },
        tags: [
          { name: 'articles', description: 'Article management endpoints' },
          { name: 'tags', description: 'Tag management endpoints' },
          { name: 'comments', description: 'Comment management endpoints' },
          { name: 'health', description: 'Health check endpoints' },
        ],
      },
    })
  )
  .use(errorHandler)
  .use(healthRoutes)
  .group('/api', app => app.use(articleRoutes).use(tagRoutes).use(commentRoutes))
  .get('/', () => ({
    message: 'Blog API is running!',
    documentation: '/swagger',
    health: '/health',
  }))
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Server is running at ${app.server?.hostname}:${app.server?.port}
📝 REST API documentation available at /swagger
💓 Health check available at /health
🔒 CORS enabled for ${isDev ? 'all origins (development mode)' : 'http://localhost:3001'}`
);
