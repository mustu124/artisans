import { fail, ok } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeSupabaseOrder } from "@/lib/supabase-mappers";

export async function GET(_: Request, { params }: { params: { orderNumber: string } }) {
  try {
    const supabase = getSupabaseAdmin();
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", params.orderNumber)
      .maybeSingle();

    if (error) throw error;
    if (!order) return fail("Order not found.", 404);
    return ok({ order: normalizeSupabaseOrder(order) }, "Order loaded.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load order.");
  }
}
