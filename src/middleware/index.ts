import { createSupabaseServerInstance } from '../db/supabase.client';
import { defineMiddleware, sequence } from 'astro/middleware';

// Public page paths - Server-Rendered Astro Pages that do not require authentication
const PUBLIC_PAGE_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/update-password",
];

// Public API paths - API endpoints that do not require authentication
const PUBLIC_API_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
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

    const isPublicPagePath = PUBLIC_PAGE_PATHS.includes(url.pathname);
    const isPublicApiPath = PUBLIC_API_PATHS.includes(url.pathname);

    // If it's a public API path, always let it pass through to be handled by the API route
    if (isPublicApiPath) {
      return next();
    }

    if (user && isPublicPagePath) {
      // If user is logged in and trying to access a public auth page, redirect to index
      return redirect("/");
    }

    if (!user && !isPublicPagePath) {
      // If user is not logged in and trying to access a protected page, redirect to login
      return redirect('/login');
    }

    return next();
  },
);

export const onRequest = sequence(authMiddleware);