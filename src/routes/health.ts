import { Elysia } from 'elysia';
import { prisma } from '../utils/db';

export const healthRoutes = new Elysia({ prefix: '/health' })
  .get('/', async () => {
    const startTime = Date.now();
    
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      const uptime = process.uptime();
      const dbLatency = Date.now() - startTime;
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime / 60)} minutes, ${Math.floor(uptime % 60)} seconds`,
        database: {
          status: 'connected',
          latency: `${dbLatency}ms`
        },
        memory: {
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  });