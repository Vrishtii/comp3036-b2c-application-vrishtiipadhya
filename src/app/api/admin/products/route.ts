import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { name, price, category_id, description, image_url, is_available, is_seasonal } = body;

  if (!name || price === undefined || !category_id) {
    return NextResponse.json(
      { error: "name, price and category_id are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({ name, price, category_id, description, image_url, is_available, is_seasonal })
    .select("*, categories(name)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
