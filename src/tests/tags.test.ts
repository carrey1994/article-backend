import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { tagRoutes } from "../routes/tags";
import { setupTestDb, cleanupTestDb } from "./setupTestDb";

describe("Tag Routes", () => {
  let app: Elysia;
  let testData: any;

  beforeAll(async () => {
    app = new Elysia().use(tagRoutes);
    testData = await setupTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  it("should get all tags", async () => {
    const response = await app
      .handle(new Request("http://localhost/tags"));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('_count');
  });

  it("should create a new tag", async () => {
    const response = await app
      .handle(new Request("http://localhost/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "new-test-tag"
        }),
      }));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.name).toBe("new-test-tag");
    expect(data._count.articles).toBe(0);
  });

  it("should get articles by tag", async () => {
    const testTag = testData.tags[0];
    const response = await app
      .handle(new Request(`http://localhost/tags/${testTag.name}/articles`));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.tag).toBe(testTag.name);
    expect(Array.isArray(data.articles)).toBe(true);
    expect(data.meta).toBeDefined();
  });

  it("should delete a tag", async () => {
    const testTag = testData.tags[1];
    const response = await app
      .handle(new Request(`http://localhost/tags/${testTag.name}`, {
        method: "DELETE",
      }));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.message).toBe("Tag deleted successfully");

    // Verify tag is deleted
    const getResponse = await app
      .handle(new Request(`http://localhost/tags/${testTag.name}/articles`));
    expect(getResponse.status).toBe(500); // or 404 depending on your error handling
  });

  it("should handle non-existent tag", async () => {
    const response = await app
      .handle(new Request("/tags/non-existent-tag/articles"));
    
    expect(response.status).toBe(500); // or 404 depending on your error handling
  });

  it("should handle duplicate tag creation", async () => {
    const existingTag = testData.tags[0];
    const response = await app
      .handle(new Request("http://localhost/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: existingTag.name
        }),
      }));

    expect(response.status).toBe(409); // Conflict error
  });

  it("should handle pagination for articles by tag", async () => {
    const testTag = testData.tags[0];
    const response = await app
      .handle(new Request(`http://localhost/tags/${testTag.name}/articles?page=1&limit=2`));

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.articles.length).toBeLessThanOrEqual(2);
    expect(data.meta.page).toBe(1);
    expect(data.meta.limit).toBe(2);
  });
});
