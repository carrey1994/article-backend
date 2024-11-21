import { describe, expect, it, beforeAll } from "bun:test";
import { Elysia } from "elysia";
import { healthRoutes } from "../routes/health";

describe("Health Check Routes", () => {
  let app: Elysia;

  beforeAll(() => {
    app = new Elysia().use(healthRoutes);
  });

  it("should return healthy status", async () => {
    const response = await app
      .handle(new Request("http://localhost/health"));

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeDefined();
    expect(data.database).toBeDefined();
    expect(data.database.status).toBe("connected");
    expect(data.database.latency).toBeDefined();
    expect(data.memory).toBeDefined();
    expect(data.memory.heapUsed).toBeDefined();
    expect(data.memory.heapTotal).toBeDefined();
  });

  it("should include all required health metrics", async () => {
    const response = await app
      .handle(new Request("http://localhost/health"));

    const data = await response.json();
    
    // Check data structure
    const requiredFields = [
      'status',
      'timestamp',
      'uptime',
      'database',
      'memory'
    ];

    requiredFields.forEach(field => {
      expect(data).toHaveProperty(field);
    });

    // Check database metrics
    expect(data.database).toHaveProperty('status');
    expect(data.database).toHaveProperty('latency');
    
    // Check memory metrics
    expect(data.memory).toHaveProperty('heapUsed');
    expect(data.memory).toHaveProperty('heapTotal');

    // Validate types
    expect(typeof data.status).toBe('string');
    expect(typeof data.timestamp).toBe('string');
    expect(typeof data.uptime).toBe('string');
    expect(typeof data.database.latency).toBe('string');
    expect(typeof data.memory.heapUsed).toBe('string');
    expect(typeof data.memory.heapTotal).toBe('string');
  });

  // Add this test to index.test.ts to verify health check integration
  it("should be accessible through main API", async () => {
    const mainApp = new Elysia()
      .use(healthRoutes);

    const response = await mainApp
      .handle(new Request("http://localhost/health"));

    expect(response.status).toBe(200);
  });
});