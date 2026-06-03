import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const limit = searchParams.get("limit");

  let query = supabase
    .from("products")
    .select("*, categories(name)")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.ilike("categories.name", category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (limit) {
    query = query.limit(Number(limit));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
