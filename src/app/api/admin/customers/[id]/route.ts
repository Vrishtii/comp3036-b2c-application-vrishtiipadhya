import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      phone,
      created_at,
      orders (
        *,
        order_items (
          id,
          quantity,
          price_at_purchase,
          custom_notes,
          products ( id, name )
        )
      )
    `)
    .eq("id", id)
    .eq("role", "customer")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "customer not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
