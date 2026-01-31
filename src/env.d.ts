/// <reference types="astro/client" />

import type { Session, User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/ssr"; // Use SupabaseClient from @supabase/ssr
import type { Database } from "./db/database.types.ts";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>; // Type from @supabase/ssr
      user: User | null; // Middleware will set user directly
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
