import type { APIRoute } from 'astro';
import { createSupabaseServerInstance, supabaseClient } from '../../../db/supabase.client'; // Adjusted path

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password, displayName } = await request.json();

  // Basic server-side validation (more robust validation should be added)
  if (!email || !password || !displayName) {
    return new Response(JSON.stringify({ error: "Email, password, and display name are required." }), {
      status: 400,
    });
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  // 1. Sign up the user with Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return new Response(JSON.stringify({ error: signUpError.message }), {
      status: 400,
    });
  }

  // Ensure user is returned from signUp, and then insert into profiles table
  const user = signUpData.user;
  if (!user) {
    // This case should ideally not happen if signUpData is successful but user is null
    return new Response(JSON.stringify({ error: "User not returned after sign up." }), {
      status: 500,
    });
  }

  // 2. Insert user profile into public.profiles table
  // Use the client-side supabaseClient for this insertion for simplicity,
  // or a service role key if this needs to bypass RLS, but for now client-side is fine.
  // NOTE: This insertion needs to be done with an authenticated session or RLS bypass.
  // For now, assuming RLS allows this based on 'auth.uid() = id' policy on profiles table
  // for the signed-up user.
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: user.id, display_name: displayName });

  if (profileError) {
    // If profile creation fails, you might want to consider rolling back the user creation
    // (e.g., deleting the user from auth.users), but that's complex for an MVP.
    console.error("Error creating user profile:", profileError.message);
    return new Response(JSON.stringify({ error: "Registration successful, but profile creation failed. Please contact support." }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ user: signUpData.user }), {
    status: 200,
  });
};
