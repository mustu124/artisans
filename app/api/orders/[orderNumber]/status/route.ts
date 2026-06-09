import { fail, ok } from "@/lib/api";
import { assertAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeSupabaseOrder } from "@/lib/supabase-mappers";

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function PUT(request: Request, { params }: { params: { orderNumber: string } }) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { status } = (await request.json()) as { status?: string };
    if (!status || !statuses.includes(status)) {
      return fail("Invalid order status.", 400);
    }

    const supabase = getSupabaseAdmin();
    const { data: order, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("order_number", params.orderNumber)
      .select("*")
      .single();

    if (error) throw error;
    if (!order) return fail("Order not found.", 404);
    return ok({ order: normalizeSupabaseOrder(order) }, "Order status updated.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update order status.");
  }
}
