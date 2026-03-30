import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

test("GET /health returns ok when db is reachable", async () => {
  const app = createApp({
    query: async () => ({ rows: [] }),
    healthCheck: async () => {},
    allowedOrigin: "*"
  });

  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.service, "backend");
  assert.equal(typeof response.body.timestamp, "string");
});

test("GET /health returns 500 when db is unreachable", async () => {
  const app = createApp({
    query: async () => ({ rows: [] }),
    healthCheck: async () => {
      throw new Error("db down");
    },
    allowedOrigin: "*"
  });

  const response = await request(app).get("/health");

  assert.equal(response.status, 500);
  assert.deepEqual(response.body, { ok: false, error: "database_unreachable" });
});

test("GET /api/products returns products from query", async () => {
  const app = createApp({
    query: async () => ({
      rows: [
        {
          id: 1,
          name: "Coffee Mug",
          description: "Ceramic mug",
          category: "Kitchen",
          price: "9.99",
          image_url: "https://example.com/mug.png",
          inventory: 10
        }
      ]
    }),
    healthCheck: async () => {},
    allowedOrigin: "*"
  });

  const response = await request(app).get("/api/products");

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.body), true);
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].name, "Coffee Mug");
});
