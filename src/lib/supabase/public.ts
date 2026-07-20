import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cookieless anon Supabase client for PUBLIC, read-only data (brand / industry
 * / market pages). It never calls next/headers `cookies()`, so pages that use
 * it stay statically renderable and ISR-cacheable (`revalidate`) instead of
 * being forced dynamic at runtime — which otherwise throws the Next.js
 * "static to dynamic at runtime, reason: cookies" error.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
