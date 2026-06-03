import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/adminAuth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { items, pickup_date, pickup_time, notes, total_amount } = body;

  if (!items?.length || !pickup_date || !pickup_time || total_amount === undefined) {
    return NextResponse.json(
      { error: "items, pickup_date, pickup_time and total_amount are required" },
      { status: 400 }
    );
  }

  const order_number = `CRAVE-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: auth.user.id,
      order_number,
      pickup_date,
      pickup_time,
      notes,
      total_amount,
      status: "pending",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message }, { status: 500 });
  }

  const orderItems = items.map((item: { product_id: string; quantity: number; price_at_purchase: number; custom_notes?: string }) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.price_at_purchase,
    custom_notes: item.custom_notes,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json(order, { status: 201 });
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabaseAdmin
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        quantity,
        price_at_purchase,
        custom_notes,
        products ( id, name, image_url )
      )
    `)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
