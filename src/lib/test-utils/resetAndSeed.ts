  // src/lib/test-utils/resetAndSeed.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { TestApiClient } from "./api-client";

const testUsers = [
  { id: "11111111-1111-1111-1111-111111111111", email: 'alice@test.com', password: 'password123', username: 'alice' },
  { id: "22222222-2222-2222-2222-222222222222", email: 'bob@test.com', password: 'password123', username: 'bob' }
];

async function resetData(supabase: SupabaseClient<Database>) {
  // Delete data in correct order to respect foreign key constraints:
  // 1. Delete votes (references prompts and users, but has CASCADE so deleting prompts will handle it)
  // 2. Delete prompt_tags (references prompts and tags, but has CASCADE so deleting prompts will handle it)
  // 3. Delete prompts (references profiles)
  // 4. Delete profiles (references auth.users)
  // 5. Delete users from auth.users

  // Delete all prompts (this will cascade to prompt_tags and votes due to ON DELETE CASCADE)
  // Also cascades to flags due to ON DELETE CASCADE
  await supabase.from("prompts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  
  // Delete analytics_events (references prompts/users but has SET NULL, so safe to delete all)
  // Note: id is bigserial (number), not UUID
  await supabase.from("analytics_events").delete().gt("id", 0);
  
  // Delete tags (no longer referenced by prompt_tags after prompts are deleted)
  await supabase.from("tags").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Delete profiles (must be deleted before users)
  for (const user of testUsers) {
    await supabase.from("profiles").delete().eq("id", user.id);
  }

  // Finally, delete users from auth.users
  for (const user of testUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error && error.message !== 'User not found') {
      // Log but don't throw - this is cleanup and some errors are expected
      console.error(`Error deleting user ${user.id}:`, error);
    }
  }
}

async function seedData(supabase: SupabaseClient<Database>) {
  for (const user of testUsers) {
    const { error } = await supabase.auth.admin.createUser({
        id: user.id,
        email: user.email,
        password: user.password,
        email_confirm: true,
    });
    if (error) {
        console.error(`Error creating user ${user.email}:`, error);
    }
  }

  const profiles = testUsers.map(u => ({ id: u.id, username: u.username }));
  const { error: profileError } = await supabase.from("profiles").upsert(profiles);
  if (profileError) console.error("Error seeding profiles:", profileError);

  const tags = [
    { id: "t-astro", name: "astro" },
    { id: "t-dev", name: "dev" },
    { id: "t-react", name: "react" },
  ];
  const { error: tagsError } = await supabase.from("tags").upsert(tags);
  if (tagsError) console.error("Error seeding tags:", tagsError);

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
    const votes = [
      { id: "v-1", prompt_id: astroPromptId, user_id: profiles[0].id, vote_value: 1 },
      { id: "v-2", prompt_id: reactPromptId, user_id: profiles[1].id, vote_value: -1 },
    ];
    const { error: votesError } = await supabase.from("votes").upsert(votes);
    if (votesError) console.error("Error seeding votes:", votesError);
  }
}

export async function resetAndSeed(supabase: SupabaseClient<Database>) {
  await resetData(supabase);
  await seedData(supabase);
}
