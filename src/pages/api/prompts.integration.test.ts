import { beforeEach, describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { SupabaseClient } from "../../db/supabase.client";
import type { APIContext } from "astro";
import { GET, POST } from "./prompts";
import type { CreatePromptCommand } from "../../types";
import { resetAndSeed } from "../../lib/test-utils/resetAndSeed";

const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const describeFn = missingEnv.length > 0 ? describe.skip : describe;

describeFn("Prompts API integration (local Supabase)", () => {
  let supabase: SupabaseClient<Database>;
  const baseUrl = "http://localhost:3000";

  beforeEach(async () => {
    supabase = createClient<Database>(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );
    await resetAndSeed(supabase);
  });

  describe("GET /api/prompts", () => {
    it("should return a list of prompts with pagination", async () => {
      const request = new Request(`${baseUrl}/api/prompts`);
      const context: APIContext = {
        request,
        locals: { supabase },
        params: {},
        props: {},
        site: undefined,
        generator: "test",
        url: new URL(`${baseUrl}/api/prompts`),
        redirect: () => new Response(),
        cookies: {} as any,
      };

      const response = await GET(context);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("pagination");
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination.total).toBe(2);
      expect(body.pagination.limit).toBe(10);
      expect(body.pagination.offset).toBe(0);
    });

    it("should filter prompts by tag", async () => {
      const request = new Request(`${baseUrl}/api/prompts?tag=astro`);
      const context: APIContext = {
        request,
        locals: { supabase },
        params: {},
        props: {},
        site: undefined,
        generator: "test",
        url: new URL(`${baseUrl}/api/prompts?tag=astro`),
        redirect: () => new Response(),
        cookies: {} as any,
      };

      const response = await GET(context);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(3);
      expect(body.data[0].title).toBe("Astro Prompt");
      expect(body.data[0].tags).toContain("astro");
    });

    it("should support pagination with limit and offset", async () => {
      const request = new Request(`${baseUrl}/api/prompts?limit=1&offset=0`);
      const context: APIContext = {
        request,
        locals: { supabase },
        params: {},
        props: {},
        site: undefined,
        generator: "test",
        url: new URL(`${baseUrl}/api/prompts?limit=1&offset=0`),
        redirect: () => new Response(),
        cookies: {} as any,
      };

      const response = await GET(context);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(1);
      expect(body.pagination.limit).toBe(1);
      expect(body.pagination.offset).toBe(0);
    });

    it("should return 400 for invalid query parameters", async () => {
      const request = new Request(`${baseUrl}/api/prompts?limit=invalid`);
      const context: APIContext = {
        request,
        locals: { supabase },
        params: {},
        props: {},
        site: undefined,
        generator: "test",
        url: new URL(`${baseUrl}/api/prompts?limit=invalid`),
        redirect: () => new Response(),
        cookies: {} as any,
      };

      const response = await GET(context);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty("message", "Validation Error");
      expect(body).toHaveProperty("errors");
    });

    it("should include author_username in response", async () => {
      const request = new Request(`${baseUrl}/api/prompts`);
      const context: APIContext = {
        request,
        locals: { supabase },
        params: {},
        props: {},
        site: undefined,
        generator: "test",
        url: new URL(`${baseUrl}/api/prompts`),
        redirect: () => new Response(),
        cookies: {} as any,
      };

      const response = await GET(context);
      const body = await response.json();

      expect(response.status).toBe(200);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("author_username");
        expect(typeof body.data[0].author_username).toBe("string");
      }
    });
  });

  describe("POST /api/prompts", () => {
    it("should create a new prompt with tags", async () => {
      const promptData: CreatePromptCommand = {
        title: "Test Prompt Title",
        description: "Test description",
        content: "Test content",
        tags: ["test", "integration"],
      };

      const request = new Request(`${baseUrl}/api/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promptData),
      });

      const context: APIContext = {
        request,
        locals: { supabase },
        params: {},
        props: {},
        site: undefined,
        generator: "test",
        url: new URL(`${baseUrl}/api/prompts`),
        redirect: () => new Response(),
        cookies: {} as any,
      };

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("author_id");
      expect(body.title).toBe(promptData.title);
      expect(body.description).toBe(promptData.description);
      expect(body.content).toBe(promptData.content);
      expect(body.tags).toEqual(promptData.tags);
      expect(body.vote_score).toBe(0);
      expect(body).toHaveProperty("created_at");

      // Verify total prompts increased (2 from seed + 1 newly created = 3)
      const getResponse = await GET({
        request: new Request(`${baseUrl}/api/prompts`),
        locals: { supabase },
        params: {},
        props: {},
        site: undefined,
        generator: "test",
        url: new URL(`${baseUrl}/api/prompts`),
        redirect: () => new Response(),
        cookies: {} as any,
      });
      const getBody = await getResponse.json();
      expect(getBody.pagination.total).toBe(3);
    });

    it("should return 400 for invalid JSON body", async () => {
      const request = new Request(`${baseUrl}/api/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      });

      const context: APIContext = {
        request,
        locals: { supabase },
        params: {},
        props: {},
        site: undefined,
        generator: "test",
        url: new URL(`${baseUrl}/api/prompts`),
        redirect: () => new Response(),
        cookies: {} as any,
      };

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty("message", "Invalid JSON body");
    });

    it("should return 400 for validation errors (title too short)", async () => {
      const promptData = {
        title: "Short", // Less than 6 characters
        description: "Test description",
        content: "Test content",
        tags: ["test"],
      };

      const request = new Request(`${baseUrl}/api/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promptData),
      });

      const context: APIContext = {
        request,
        locals: { supabase },
        params: {},
        props: {},
        site: undefined,
        generator: "test",
        url: new URL(`${baseUrl}/api/prompts`),
        redirect: () => new Response(),
        cookies: {} as any,
      };

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty("message", "Validation Error");
      expect(body).toHaveProperty("errors");
    });

    it("should create prompt without tags when tags array is empty", async () => {
      const promptData: CreatePromptCommand = {
        title: "Prompt Without Tags",
        description: "No tags here",
        content: "Content without tags",
        tags: [],
      };

      const request = new Request(`${baseUrl}/api/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promptData),
      });

      const context: APIContext = {
        request,
        locals: { supabase },
        params: {},
        props: {},
        site: undefined,
        generator: "test",
        url: new URL(`${baseUrl}/api/prompts`),
        redirect: () => new Response(),
        cookies: {} as any,
      };

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.tags).toEqual([]);
    });
  });
});
