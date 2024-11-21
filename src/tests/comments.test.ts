import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { commentRoutes } from "../routes/comments";
import { setupTestDb, cleanupTestDb } from "./setupTestDb";

describe("Comment Routes", () => {
  let app: Elysia;
  let testData: any;

  beforeAll(async () => {
    app = new Elysia().use(commentRoutes);
    testData = await setupTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  it("should get comments for an article", async () => {
    const testArticle = testData.articles[0];
    const response = await app
      .handle(new Request(`http://localhost/comments/article/${testArticle.id}`));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.comments).toBeDefined();
    expect(Array.isArray(data.comments)).toBe(true);
    expect(data.comments.length).toBeGreaterThan(0);
    expect(data.meta).toBeDefined();
    expect(data.meta.total).toBeGreaterThan(0);

    // Verify comment structure
    const comment = data.comments[0];
    expect(comment).toHaveProperty('id');
    expect(comment).toHaveProperty('content');
    expect(comment).toHaveProperty('author');
    expect(comment).toHaveProperty('email');
    expect(comment).toHaveProperty('createdAt');
    expect(comment.articleId).toBe(testArticle.id);
  });

  it("should create a new comment", async () => {
    const testArticle = testData.articles[0];
    const newComment = {
      content: "New test comment",
      author: "Test Commenter",
      email: "test@example.com"
    };

    const response = await app
      .handle(new Request(`http://localhost/comments/article/${testArticle.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newComment),
      }));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.content).toBe(newComment.content);
    expect(data.author).toBe(newComment.author);
    expect(data.email).toBe(newComment.email);
    expect(data.articleId).toBe(testArticle.id);
  });

  it("should delete a comment", async () => {
    // Get a comment to delete
    const testArticle = testData.articles[0];
    const getResponse = await app
      .handle(new Request(`http://localhost/comments/article/${testArticle.id}`));
    const getData = await getResponse.json();
    const commentToDelete = getData.comments[0];

    const response = await app
      .handle(new Request(`http://localhost/comments/${commentToDelete.id}`, {
        method: "DELETE",
      }));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.message).toBe("Comment deleted successfully");

    // Verify comment is deleted
    const verifyResponse = await app
      .handle(new Request(`http://localhost/comments/article/${testArticle.id}`));
    const verifyData = await verifyResponse.json();
    const deletedComment = verifyData.comments.find((c: any) => c.id === commentToDelete.id);
    expect(deletedComment).toBeUndefined();
  });

  it("should handle pagination", async () => {
    const testArticle = testData.articles[0];
    const response = await app
      .handle(new Request(`http://localhost/comments/article/${testArticle.id}?page=1&limit=1`));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.comments.length).toBeLessThanOrEqual(1);
    expect(data.meta.page).toBe(1);
    expect(data.meta.limit).toBe(1);
  });

  it("should handle invalid comment data", async () => {
    const testArticle = testData.articles[0];
    const response = await app
      .handle(new Request(`http://localhost/comments/article/${testArticle.id}`, {
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

  it("should handle non-existent article", async () => {
    const response = await app
      .handle(new Request("/comments/article/99999"));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.comments).toHaveLength(0);
    expect(data.meta.total).toBe(0);
  });

  it("should handle invalid email format", async () => {
    const testArticle = testData.articles[0];
    const response = await app
      .handle(new Request(`http://localhost/comments/article/${testArticle.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Test comment",
          author: "Test User",
          email: "invalid-email" // Invalid email format
        }),
      }));

    expect(response.status).toBe(400);
  });
});
