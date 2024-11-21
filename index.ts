import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

// Import routes
import { articleRoutes } from './src/routes/articles';
import { tagRoutes } from './src/routes/tags';
import { commentRoutes } from './src/routes/comments';
import { healthRoutes } from './src/routes/health';

// Import middleware
import { errorHandler } from './src/middleware/errorHandler';

const app = new Elysia()
  .use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'Blog API Documentation',
        version: '1.0.0',
        description: 'API documentation for the blog backend'
      },
      tags: [
        { name: 'articles', description: 'Article management endpoints' },
        { name: 'tags', description: 'Tag management endpoints' },
        { name: 'comments', description: 'Comment management endpoints' },
        { name: 'health', description: 'Health check endpoints' }
      ]
    }
  }))
  .use(errorHandler)
  .use(healthRoutes)
  .group('/api', app => app
    .use(articleRoutes)
    .use(tagRoutes)
    .use(commentRoutes)
  )
  .get('/', () => ({
    message: 'Blog API is running!',
    documentation: '/swagger',
    health: '/health'
  }))
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Server is running at ${app.server?.hostname}:${app.server?.port}
📝 REST API documentation available at /swagger
💓 Health check available at /health`
);
