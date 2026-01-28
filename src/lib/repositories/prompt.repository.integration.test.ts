import { beforeEach, describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { SupabaseClient } from "../../db/supabase.client";
import { PromptRepository } from "./prompt.repository";
import { resetAndSeed } from "../test-utils/resetAndSeed";

const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const describeFn = missingEnv.length > 0 ? describe.skip : describe;

describeFn("PromptRepository integration (local Supabase)", () => {
  let supabase: SupabaseClient<Database>;
  let repository: PromptRepository;

  beforeEach(async () => {
    supabase = createClient<Database>(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );
    repository = new PromptRepository(supabase);

    await resetAndSeed(supabase);
  });

  it("lists prompts, includes author usernames, and filters by tag with vote scores", async () => {
    const result = await repository.listPrompts({
      limit: 10,
      offset: 0,
      order: "desc",
      sortBy: "created_at",
    });

    expect(result.pagination.total).toBe(2);
    expect(result.data).toHaveLength(2);
    const titles = result.data.map((p) => p.title).sort();
    expect(titles).toEqual(["Astro Prompt", "React Prompt"]);
    expect(result.data[0]).toHaveProperty("author_username");

    const tagFiltered = await repository.listPrompts({
      limit: 5,
      offset: 0,
      order: "desc",
      sortBy: "vote_score",
      tag: "astro",
    });

    expect(tagFiltered.pagination.total).toBe(1);
    expect(tagFiltered.data).toHaveLength(1);
    expect(tagFiltered.data[0].title).toBe("Astro Prompt");
    expect(tagFiltered.data[0].tags).toEqual(["astro", "dev"]);
    expect(tagFiltered.data[0].vote_score).toBe(1);
  });
});

