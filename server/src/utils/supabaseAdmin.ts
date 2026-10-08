import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";

const isServiceRoleJwt =
  typeof config.SUPABASE_SERVICE_ROLE_KEY === "string" &&
  config.SUPABASE_SERVICE_ROLE_KEY.split(".").length === 3;

const authKey = isServiceRoleJwt
  ? config.SUPABASE_SERVICE_ROLE_KEY
  : (config.SUPABASE_ANON_KEY || config.SUPABASE_SERVICE_ROLE_KEY);

export const isSupabaseConfigured = Boolean(config.SUPABASE_URL && authKey);

// Only created when configured — guest and auth endpoints check `isSupabaseConfigured` before
// ever touching this, so an unconfigured deployment never calls createClient(undefined, undefined).
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(config.SUPABASE_URL as string, authKey as string, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
