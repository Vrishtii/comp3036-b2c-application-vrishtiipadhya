import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const pickup_date = searchParams.get("pickup_date");
  const search = searchParams.get("search");

  let query = supabaseAdmin
    .from("orders")
    .select(`
      *,
      profiles ( id, full_name, email ),
      order_items (
        id,
        quantity,
        price_at_purchase,
        custom_notes,
        products ( id, name, image_url )
      )
    `)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (pickup_date) {
    query = query.eq("pickup_date", pickup_date);
  }

  if (search) {
    query = query.or(`order_number.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
