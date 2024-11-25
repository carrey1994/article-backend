import { beforeAll } from "bun:test";

// Set up test environment
beforeAll(() => {
  // Use test database
  process.env.DATABASE_URL = "file:./test.db";
  
  // Set test environment
  process.env.NODE_ENV = "test";
  
  // Set test port
  process.env.PORT = "3001";
  
  // Set test frontend URL
  process.env.FRONTEND_URL = "http://localhost:3001";
  
  // Disable logging during tests
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  // Keep console.error for debugging test failures
});

// Test utilities
export const createTestHeaders = (headers: Record<string, string> = {}) => ({
  "Content-Type": "application/json",
  ...headers
});

export const createTestUrl = (path: string) => 
  `http://localhost${path.startsWith('/') ? path : `/${path}`}`;

// Common test data types
export interface TestContext {
  articles: any[];
  tags: any[];
  comments: any[];
}

// Common validation schemas
export const schemas = {
  article: {
    id: "number",
    title: "string",
    content: "string",
    createdAt: "string",
    updatedAt: "string"
  },
  tag: {
    id: "number",
    name: "string",
    _count: "object"
  },
  comment: {
    id: "number",
    content: "string",
    author: "string",
    email: "string",
    createdAt: "string",
    articleId: "number"
  }
};

// Helper function to validate response data against schema
export const validateSchema = (data: any, schema: Record<string, string>): boolean => {
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