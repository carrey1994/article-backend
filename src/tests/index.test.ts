import { describe } from "bun:test";
import "./config";

// Import all test files
import "./articles.test";
import "./tags.test";
import "./comments.test";

describe("API Tests", () => {
  // Tests are organized in their respective files
  // This file serves as the main entry point for running all tests
  
  // The beforeAll in config.ts will run first to set up the test environment
  // Each test file has its own beforeAll/afterAll hooks for database setup/cleanup
  
  // To run tests:
  // bun test          -> runs all tests
  // bun test:watch   -> runs tests in watch mode
});

// Test organization:
// 1. config.ts - Sets up test environment and provides common utilities
// 2. setupTestDb.ts - Handles database setup and cleanup
// 3. articles.test.ts - Tests article-related endpoints
// 4. tags.test.ts - Tests tag-related endpoints
// 5. comments.test.ts - Tests comment-related endpoints