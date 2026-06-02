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
  const search = searchParams.get("search");

  let query = supabaseAdmin
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      phone,
      created_at,
      orders ( id, total_amount, status )
    `)
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const customers = data.map((profile) => {
    const orders = profile.orders ?? [];
    return {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      created_at: profile.created_at,
      order_count: orders.length,
      total_spent: orders.reduce((sum: number, o: { total_amount: number }) => sum + Number(o.total_amount), 0),
    };
  });

  return NextResponse.json(customers);
}
