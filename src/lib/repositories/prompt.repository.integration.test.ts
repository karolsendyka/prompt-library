import { beforeAll, describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { SupabaseClient } from "../../db/supabase.client";
import { PromptRepository } from "./prompt.repository";

const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const describeFn = missingEnv.length > 0 ? describe.skip : describe;

describeFn("PromptRepository integration (local Supabase)", () => {
  let supabase: SupabaseClient<Database>;
  let repository: PromptRepository;

  beforeAll(async () => {
    supabase = createClient<Database>(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );
    repository = new PromptRepository(supabase);

    await resetData(supabase);
    await seedData(supabase);
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

async function resetData(supabase: SupabaseClient<Database>) {
  // Order matters due to foreign keys.
  await supabase.from("prompt_tags").delete().neq("prompt_id", "");
  await supabase.from("votes").delete().neq("prompt_id", "");
  await supabase.from("prompts").delete().neq("id", "");
  await supabase.from("profiles").delete().neq("id", "");
  await supabase.from("tags").delete().neq("id", "");
}

async function seedData(supabase: SupabaseClient<Database>) {
  const profiles = [
    { id: "11111111-1111-1111-1111-111111111111", username: "alice" },
    { id: "22222222-2222-2222-2222-222222222222", username: "bob" },
  ];
  await supabase.from("profiles").upsert(profiles);

  const tags = [
    { id: "t-astro", name: "astro" },
    { id: "t-dev", name: "dev" },
    { id: "t-react", name: "react" },
  ];
  await supabase.from("tags").upsert(tags);

  const prompts = [
    {
      id: "p-astro",
      author_id: profiles[0].id,
      title: "Astro Prompt",
      description: "Astro starter prompt",
      content: "Astro content",
    },
    {
      id: "p-react",
      author_id: profiles[1].id,
      title: "React Prompt",
      description: "React starter prompt",
      content: "React content",
    },
  ];
  await supabase.from("prompts").upsert(prompts);

  const promptTags = [
    { prompt_id: "p-astro", tag_id: "t-astro" },
    { prompt_id: "p-astro", tag_id: "t-dev" },
    { prompt_id: "p-react", tag_id: "t-react" },
  ];
  await supabase.from("prompt_tags").upsert(promptTags);

  const votes = [
    { id: "v-1", prompt_id: "p-astro", user_id: profiles[0].id, vote_value: 1 },
    { id: "v-2", prompt_id: "p-react", user_id: profiles[1].id, vote_value: -1 },
  ];
  await supabase.from("votes").upsert(votes);
}

