import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.ts";

describe("Supabase Integration Test", () => {
  let supabase: ReturnType<typeof createClient<Database>>;

  beforeAll(() => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing required environment variables: SUPABASE_URL and SUPABASE_KEY must be set");
    }

    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  });

  it("should connect to the database and query the tags table", async () => {
    const { data, error } = await supabase.from("tags").select("*").limit(10);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data && data.length === 0).toBe(true);
  });

  it("should query the profiles table", async () => {
    const { data, error } = await supabase.from("profiles").select("*").limit(10);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data && data.length === 0).toBe(true);
  });

  it("should query the prompts table", async () => {
    const { data, error } = await supabase.from("prompts").select("*").limit(10);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);

    expect(data && data.length === 0).toBe(true);
  });

  it("should handle empty result sets gracefully", async () => {
    const { data, error } = await supabase.from("tags").select("*").eq("name", "non-existent-tag-12345");

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data && data.length === 0).toBe(true);
  });
});
