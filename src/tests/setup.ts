import { beforeAll, afterAll } from "bun:test";
import { prisma } from "../utils/db";

// Global test setup
beforeAll(async () => {
  // Ensure we're using test database
  if (!process.env.DATABASE_URL?.includes('test.db')) {
    process.env.DATABASE_URL = 'file:./test.db';
  }

  // Reset database before all tests
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
});

// Global test teardown
afterAll(async () => {
  // Clean up after all tests
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
  
  // Close Prisma connection
  await prisma.$disconnect();
});

// Test utilities
export const createTestArticle = async (data = {}) => {
  return await prisma.article.create({
    data: {
      title: "Test Article",
      content: "Test content",
      slug: "test-article",
      ...data
    }
  });
};

export const createTestTag = async (data = {}) => {
  return await prisma.tag.create({
    data: {
      name: "test-tag",
      ...data
    }
  });
};

export const createTestComment = async (articleId: number, data = {}) => {
  return await prisma.comment.create({
    data: {
      content: "Test comment",
      author: "Test User",
      email: "test@example.com",
      articleId,
      ...data
    }
  });
};

// Helper function to create test request
export const createTestRequest = (
  path: string,
  method = 'GET',
  body?: any,
  headers: Record<string, string> = {}
) => {
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new Request(`http://localhost${path}`, requestInit);
};

// Helper function to check if response matches expected schema
export const validateResponseSchema = (data: any, schema: Record<string, any>) => {
  for (const [key, type] of Object.entries(schema)) {
    if (!(key in data)) {
      throw new Error(`Missing key "${key}" in response`);
    }
    if (typeof data[key] !== type) {
      throw new Error(`Invalid type for key "${key}". Expected ${type}, got ${typeof data[key]}`);
    }
  }
  return true;
};