import { defineMiddleware, sequence } from "astro/middleware";
import { supabaseClient } from "../db/supabase.client"; // Renamed to supabaseClient as per previous fix

const auth = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient; // Ensure supabase client is available

  // Set the Supabase client's auth cookie from the request
  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;

  if (accessToken && refreshToken) {
    const { data, error } = await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      // Handle error, e.g., clear cookies, redirect to login
      console.error("Supabase auth error in middleware:", error);
      context.cookies.delete("sb-access-token", { path: "/" });
      context.cookies.delete("sb-refresh-token", { path: "/" });
      context.locals.auth = { getSession: async () => ({ session: null, user: null }) }; // Provide a default null session
      return next();
    }

    context.locals.auth = {
      getSession: async () => ({ session: data.session, user: data.user }),
    };
  } else {
    // No tokens, provide a default null session
    context.locals.auth = { getSession: async () => ({ session: null, user: null }) };
  }

  return next();
});

// Use sequence to apply multiple middlewares if needed, or just export auth
export const onRequest = sequence(auth);
