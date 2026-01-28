  // src/lib/test-utils/resetAndSeed.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { TestApiClient } from "./api-client";
import { beforeEach, describe, expect, it } from "vitest";
const testUsers = [
  { id: "11111111-1111-1111-1111-111111111111", email: 'alice@test.com', password: 'password123', username: 'alice' },
  { id: "22222222-2222-2222-2222-222222222222", email: 'bob@test.com', password: 'password123', username: 'bob' }
];

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

function assertNoSupabaseError(
  operation: string,
  error: unknown
): asserts error is null | undefined {
  if (!error) return;
  const message =
    typeof error === "object" && error && "message" in error
      ? String((error as any).message)
      : String(error);
  throw new Error(`${operation} failed: ${message}`);
}

async function deleteAllUuid(
  supabase: SupabaseClient<Database>,
  table:
    | "prompts"
    | "tags"
    | "votes"
    | "flags"
    | "profiles"
    | "prompt_tags",
  column: "id" | "prompt_id" | "tag_id" = "id"
) {
  // PostgREST requires a filter for DELETE; use an always-true filter.
  const { error } = await supabase.from(table).delete().neq(column as any, ZERO_UUID as any);
  assertNoSupabaseError(`delete all from ${table}`, error);
}

async function deleteAllAnalyticsEvents(supabase: SupabaseClient<Database>) {
  // PostgREST requires a filter for DELETE; for numeric PK, use gte(0) as always-true.
  const { error } = await supabase.from("analytics_events").delete().gte("id", 0);
  assertNoSupabaseError("delete all from analytics_events", error);
}

async function deleteTestAuthUsers(supabase: SupabaseClient<Database>) {
  // Auth users live in a separate schema. Clean up by BOTH id and email to avoid collisions
  // from prior runs where a user with the same email was created with a different id.
  const wantedEmails = new Set(testUsers.map((u) => u.email.toLowerCase()));
  const wantedIds = new Set(testUsers.map((u) => u.id));

  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  assertNoSupabaseError("auth.admin.listUsers", error);

  const users = data?.users ?? [];
  const toDelete = users.filter((u) => {
    const email = (u.email ?? "").toLowerCase();
    return wantedIds.has(u.id) || (email && wantedEmails.has(email));
  });

  for (const u of toDelete) {
    const { error: delError } = await supabase.auth.admin.deleteUser(u.id);
    // If deletion fails, bail loudly—tests must be deterministic.
    assertNoSupabaseError(`auth.admin.deleteUser(${u.id})`, delError);
  }
}

async function resetData(supabase: SupabaseClient<Database>) {
  // Delete data in correct order to respect foreign key constraints:
  // 1. Delete votes (references prompts and users, but has CASCADE so deleting prompts will handle it)
  // 2. Delete prompt_tags (references prompts and tags, but has CASCADE so deleting prompts will handle it)
  // 3. Delete prompts (references profiles)
  // 4. Delete profiles (references auth.users)
  // 5. Delete users from auth.users

  // Delete all prompts (this will cascade to prompt_tags and votes due to ON DELETE CASCADE)
  // Also cascades to flags due to ON DELETE CASCADE
  await deleteAllUuid(supabase, "prompts", "id");
  
  
  const { data, error } = await supabase.from("prompts").select("*").limit(10);
  assertNoSupabaseError("select prompts after delete", error);
  expect(data?.length).toBe(0);

  // Delete analytics_events (references prompts/users but has SET NULL, so safe to delete all)
  // Note: id is bigserial (number), not UUID
  await deleteAllAnalyticsEvents(supabase);
  
  // Delete tags (no longer referenced by prompt_tags after prompts are deleted)
  await deleteAllUuid(supabase, "tags", "id");

  // Delete profiles (must be deleted before users)
  // Use always-true delete filter to clean up any leftover test data.
  // (We intentionally do NOT attempt to delete all auth.users; only the fixed test user ids below.)
  await deleteAllUuid(supabase, "profiles", "id");

  // Extra safety: remove any rows not covered by cascades (in case schema changes).
  await deleteAllUuid(supabase, "prompt_tags", "prompt_id");
  await deleteAllUuid(supabase, "votes", "id");
  await deleteAllUuid(supabase, "flags", "id");

  // Finally, delete users from auth.users (by id and by email to avoid collisions).
  await deleteTestAuthUsers(supabase);

  // // Fallback deletions for data that might not be covered by cascades.
  // await supabase.from("prompt_tags").delete().neq("prompt_id", "00000000-0000-0000-0000-000000000000");
  // await supabase.from("votes").delete().neq("prompt_id", "00000000-0000-0000-0000-000000000000");
  // await supabase.from("prompts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  // await supabase.from("tags").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}

async function seedData(supabase: SupabaseClient<Database>) {
  console.log("Seeding data...");
  const createdUserIdsByEmail = new Map<string, string>();

  // Create auth users (without forcing IDs) to avoid GoTrue/DB incompatibilities across versions.
  for (const user of testUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    // Some local GoTrue versions return a generic 500 ("Database error creating new user")
    // for duplicate emails instead of a 409/4xx. We'll treat any create error as non-fatal
    // and resolve the user id via listUsers below.

    const createdId = data?.user?.id;
    if (createdId) {
      createdUserIdsByEmail.set(user.email.toLowerCase(), createdId);
    }
  }

  // Resolve any missing user IDs by email (needed for profiles/votes FKs).
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  assertNoSupabaseError("auth.admin.listUsers (seed)", listError);
  const existingUsers = listData?.users ?? [];

  for (const user of testUsers) {
    const key = user.email.toLowerCase();
    if (createdUserIdsByEmail.has(key)) continue;
    const found = existingUsers.find((u) => (u.email ?? "").toLowerCase() === key);
    if (!found?.id) {
      throw new Error(`Failed to resolve auth user id for ${user.email}`);
    }
    createdUserIdsByEmail.set(key, found.id);
  }

  const profiles = testUsers.map((u) => ({
    id: createdUserIdsByEmail.get(u.email.toLowerCase()) as string,
    username: u.username,
  }));
  const { error: profileError } = await supabase.from("profiles").upsert(profiles);
  if (profileError) throw new Error(`Error seeding profiles: ${profileError.message}`);

  // Create prompts using REST API client instead of direct database manipulation
  const apiClient = new TestApiClient("http://localhost:3000", supabase);
  
  const createdPrompts = [];
  try {
    // Create Astro prompt via API
    const astroPrompt = await apiClient.createPrompt({
      title: "Astro Prompt",
      description: "Astro starter prompt",
      content: "Astro content",
      tags: ["astro", "dev"],
    });
    createdPrompts.push(astroPrompt);

    // Create React prompt via API
    const reactPrompt = await apiClient.createPrompt({
      title: "React Prompt",
      description: "React starter prompt",
      content: "React content",
      tags: ["react"],
    });
    createdPrompts.push(reactPrompt);
  } catch (error) {
    console.error("Error creating prompts via API:", error);
    throw error;
  }

  // Create votes for the prompts (no API endpoint for votes yet, so using direct DB)
  // Note: We need to find the prompt IDs from the created prompts
  const astroPromptId = createdPrompts.find(p => p.title === "Astro Prompt")?.id;
  const reactPromptId = createdPrompts.find(p => p.title === "React Prompt")?.id;

  if (astroPromptId && reactPromptId) {
    const aliceId = profiles.find((p) => p.username === "alice")?.id;
    const bobId = profiles.find((p) => p.username === "bob")?.id;
    if (!aliceId || !bobId) {
      throw new Error("Failed to resolve seeded profile IDs for votes.");
    }
    const votes = [
      { prompt_id: astroPromptId, user_id: aliceId, vote_value: 1 },
      { prompt_id: reactPromptId, user_id: bobId, vote_value: -1 },
    ];
    const { error: votesError } = await supabase
      .from("votes")
      .upsert(votes, { onConflict: "prompt_id,user_id" });
    if (votesError) throw new Error(`Error seeding votes: ${votesError.message}`);
  }

  const { data, error } = await supabase.from("prompts").select("*").limit(10);
  expect(data?.length).toBe(2);
}

export async function resetAndSeed(supabase: SupabaseClient<Database>) {
  await resetData(supabase);
  await seedData(supabase);
}
