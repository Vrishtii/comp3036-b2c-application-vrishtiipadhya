import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AuthSuccess = { ok: true; user: { id: string; email: string } };
type AuthFailure = { ok: false; error: string; status: number };
type AdminAuthSuccess = { ok: true; user: { id: string; email: string }; profile: { id: string; role: string } };

export type AuthResult = AuthSuccess | AuthFailure;
export type AdminAuthResult = AdminAuthSuccess | AuthFailure;

export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, error: "unauthorized", status: 401 };
  }

  const token = authHeader.slice(7);

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return { ok: false, error: "unauthorized", status: 401 };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { ok: false, error: "forbidden", status: 403 };
  }

  if (profile.role !== "admin") {
    return { ok: false, error: "forbidden", status: 403 };
  }

  return { ok: true, user: { id: user.id, email: user.email! }, profile };
}

export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, error: "unauthorized", status: 401 };
  }

  const token = authHeader.slice(7);

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return { ok: false, error: "unauthorized", status: 401 };
  }

  return { ok: true, user: { id: user.id, email: user.email! } };
}
