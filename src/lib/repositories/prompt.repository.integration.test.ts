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
  // Delete all rows by using a condition that matches everything
  // Use a valid UUID that won't match any real data (all zeros)
  const impossibleUuid = "00000000-0000-0000-0000-000000000000";
  const { error: error1 } = await supabase.from("prompt_tags").delete().neq("prompt_id", impossibleUuid);
  if (error1) throw error1;
  const { error: error2 } = await supabase.from("votes").delete().neq("prompt_id", impossibleUuid);
  if (error2) throw error2;
  const { error: error3 } = await supabase.from("prompts").delete().neq("id", impossibleUuid);
  if (error3) throw error3;
  const { error: error4 } = await supabase.from("profiles").delete().neq("id", impossibleUuid);
  if (error4) throw error4;
  const { error: error5 } = await supabase.from("tags").delete().neq("id", impossibleUuid);
  if (error5) throw error5;
}

async function seedData(supabase: SupabaseClient<Database>) {
  // Create auth users first (required for profiles foreign key)
  const authAdmin = supabase.auth.admin;
  const profileIds = [
    "11111111-1111-1111-1111-111111111111",
    "22222222-2222-2222-2222-222222222222",
  ];
  
  // Create auth users if they don't exist
  for (const userId of profileIds) {
    try {
      await authAdmin.createUser({
        id: userId,
        email: `${userId}@test.local`,
        email_confirm: true,
      });
    } catch (error: any) {
      // User might already exist, which is fine
      if (!error.message?.includes("already registered")) {
        throw error;
      }
    }
  }

  const profiles = [
    { id: profileIds[0], username: "alice" },
    { id: profileIds[1], username: "bob" },
  ];
  const { error: error1 } = await supabase.from("profiles").upsert(profiles);
  if (error1) throw error1;

  const tags = [
    { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", name: "astro" },
    { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", name: "dev" },
    { id: "cccccccc-cccc-cccc-cccc-cccccccccccc", name: "react" },
  ];
  const { error: error2 } = await supabase.from("tags").upsert(tags);
  if (error2) throw error2;

  const prompts = [
    {
      id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      author_id: profileIds[0],
      title: "Astro Prompt",
      description: "Astro starter prompt",
      content: "Astro content",
    },
    {
      id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      author_id: profileIds[1],
      title: "React Prompt",
      description: "React starter prompt",
      content: "React content",
    },
  ];
  const { error: error3 } = await supabase.from("prompts").upsert(prompts);
  if (error3) throw error3;

  const promptTags = [
    { prompt_id: prompts[0].id, tag_id: tags[0].id },
    { prompt_id: prompts[0].id, tag_id: tags[1].id },
    { prompt_id: prompts[1].id, tag_id: tags[2].id },
  ];
  const { error: error4 } = await supabase.from("prompt_tags").upsert(promptTags);
  if (error4) throw error4;

  const votes = [
    { id: "ffffffff-ffff-ffff-ffff-ffffffffffff", prompt_id: prompts[0].id, user_id: profileIds[0], vote_value: 1 },
    { id: "11111110-1111-1111-1111-111111111111", prompt_id: prompts[1].id, user_id: profileIds[1], vote_value: -1 },
  ];
  const { error: error5 } = await supabase.from("votes").upsert(votes);
  if (error5) throw error5;
}

