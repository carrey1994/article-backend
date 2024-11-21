import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { articleRoutes } from "../routes/articles";
import { setupTestDb, cleanupTestDb } from "./setupTestDb";

describe("Article Routes", () => {
  let app: Elysia;
  let testData: any;

  beforeAll(async () => {
    app = new Elysia().use(articleRoutes);
    testData = await setupTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  const articleSchema = {
    id: "number",
    title: "string",
    slug: "string",
    content: "string",
    createdAt: "string",
    updatedAt: "string"
  };

  it("should get all articles", async () => {
    const response = await app
      .handle(new Request("http://localhost/articles"));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.articles).toBeDefined();
    expect(Array.isArray(data.articles)).toBe(true);
    expect(data.articles.length).toBe(5); // We seeded 5 articles
    expect(data.meta.total).toBe(5);
  });

  it("should get article by slug", async () => {
    const testArticle = testData.articles[0];
    const response = await app
      .handle(new Request(`http://localhost/articles/${testArticle.slug}`));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.title).toBe(testArticle.title);
    expect(data.slug).toBe(testArticle.slug);
  });

  it("should create a new article", async () => {
    const newArticle = {
      title: "Test New Article",
      content: "This is a test article content",
      excerpt: "Test excerpt",
      tags: ["test-tag"]
    };

    const response = await app
      .handle(new Request("http://localhost/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newArticle),
      }));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.title).toBe(newArticle.title);
    expect(data.slug).toBe("test-new-article");
  });

  it("should update an article", async () => {
    const testArticle = testData.articles[0];
    const updateData = {
      title: "Updated Article Title",
      content: "Updated content"
    };

    const response = await app
      .handle(new Request(`http://localhost/articles/${testArticle.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.title).toBe(updateData.title);
    expect(data.content).toBe(updateData.content);
  });

  it("should delete an article", async () => {
    const testArticle = testData.articles[1];
    const response = await app
      .handle(new Request(`http://localhost/articles/${testArticle.slug}`, {
        method: "DELETE",
      }));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.message).toBe("Article deleted successfully");

    // Verify article is deleted
    const getResponse = await app
      .handle(new Request(`http://localhost/articles/${testArticle.slug}`));
    expect(getResponse.status).toBe(500); // or 404 depending on your error handling
  });

  it("should handle article not found", async () => {
    const response = await app
      .handle(new Request("/articles/non-existent-article"));
    
    expect(response.status).toBe(500); // or 404 depending on your error handling
  });

  it("should handle invalid article data", async () => {
    const response = await app
      .handle(new Request("http://localhost/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Missing required fields
          content: "This should fail"
        }),
      }));

    expect(response.status).toBe(400);
  });
});
