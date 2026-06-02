import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AdminAuthSuccess = {
  user: { id: string; email: string };
  profile: { id: string; role: string };
  error?: never;
  status?: never;
};

type AdminAuthFailure = {
  error: string;
  status: number;
  user?: never;
  profile?: never;
};

export async function requireAdmin(
  request: NextRequest
): Promise<AdminAuthSuccess | AdminAuthFailure> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "unauthorized", status: 401 };
  }

  const token = authHeader.slice(7);

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return { error: "unauthorized", status: 401 };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "forbidden", status: 403 };
  }

  if (profile.role !== "admin") {
    return { error: "forbidden", status: 403 };
  }

  return { user: { id: user.id, email: user.email! }, profile };
}
