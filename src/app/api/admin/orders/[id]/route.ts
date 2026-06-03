import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_STATUSES = ["pending", "confirmed", "ready", "completed"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select(`
      *,
      profiles ( id, full_name, email ),
      order_items (
        id,
        quantity,
        price_at_purchase,
        products ( id, name )
      )
    `)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
