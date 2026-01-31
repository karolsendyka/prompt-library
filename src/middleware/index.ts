import { createSupabaseServerInstance } from '../db/supabase.client';
import { defineMiddleware, sequence } from 'astro/middleware';

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages that do not require authentication
  "/login",
  "/register",
  "/forgot-password",
  "/update-password",
  // Auth API endpoints - these need to be created later
  "/api/auth/login",
  // "/api/auth/register", // Skipping for now as per instructions
  // "/api/auth/reset-password", // Skipping for now as per instructions
];

const authMiddleware = defineMiddleware(
  async ({ locals, cookies, url, request, redirect }, next) => {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Attach user and supabase client to locals for access in Astro pages
    locals.user = user;
    locals.supabase = supabase;

    const isPublicPath = PUBLIC_PATHS.includes(url.pathname);

    if (user && isPublicPath) {
      // If user is logged in and trying to access auth pages, redirect to index
      return redirect("/");
    }

    if (!user && !isPublicPath) {
      // If user is not logged in and trying to access a protected page, redirect to login
      return redirect('/login');
    }

    return next();
  },
);

export const onRequest = sequence(authMiddleware);
