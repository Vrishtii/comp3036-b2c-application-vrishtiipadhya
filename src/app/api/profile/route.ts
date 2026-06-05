import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/adminAuth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, phone, role, preferences, created_at")
    .eq("id", auth.user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { full_name, email, phone, preferences } = body;

  const profileUpdate: Record<string, unknown> = {};
  if (full_name !== undefined) profileUpdate.full_name = full_name;
  if (phone !== undefined) profileUpdate.phone = phone;
  if (email !== undefined) profileUpdate.email = email;
  if (preferences !== undefined) profileUpdate.preferences = preferences;

  if (Object.keys(profileUpdate).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", auth.user.id)
    .select("id, full_name, email, phone, role, preferences, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (email) {
    await supabaseAdmin.auth.admin.updateUserById(auth.user.id, { email });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await supabaseAdmin.from("profiles").delete().eq("id", auth.user.id);

  const { error } = await supabaseAdmin.auth.admin.deleteUser(auth.user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
