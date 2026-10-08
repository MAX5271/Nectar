import { supabaseAdmin, isSupabaseConfigured } from "../utils/supabaseAdmin.js";
import { HttpError } from "../utils/httpError.js";
import StatusCode from "../utils/statusCodes.js";

export interface SupabaseIdentity {
  id: string;
  email: string | null;
  isAnonymous: boolean;
  username?: string | null;
  userMetadata?: Record<string, any>;
}

export type GuestIdentity = SupabaseIdentity;

class SupabaseService {
  /** Verifies a Supabase access token (guest, email/password, or OAuth) and returns the identity. */
  async verifyToken(accessToken: string): Promise<SupabaseIdentity> {
    if (!isSupabaseConfigured || !supabaseAdmin) {
      throw new HttpError(StatusCode.SERVICE_UNAVAILABLE, "Supabase authentication isn't configured yet.");
    }

    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data?.user) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "Invalid or expired authentication session.");
    }

    const user = data.user;
    const meta = user.user_metadata || {};

    return {
      id: user.id,
      email: user.email ?? null,
      isAnonymous: user.is_anonymous ?? false,
      username: meta.username || meta.full_name || meta.name || null,
      userMetadata: meta,
    };
  }

  /** Backwards compatible alias for verifyToken */
  async verifyGuestToken(accessToken: string): Promise<GuestIdentity> {
    return this.verifyToken(accessToken);
  }
}

export const supabaseService = new SupabaseService();
