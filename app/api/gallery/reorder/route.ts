import { fail, ok } from "@/lib/api";
import { assertAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

type ReorderPayload = Array<{ id: string; order: number }>;

export async function POST(request: Request) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as ReorderPayload;

    if (!Array.isArray(payload)) {
      return fail("Expected an array of { id, order }.", 400);
    }

    const supabase = getSupabaseAdmin();
    await Promise.all(
      payload.map((item) =>
        supabase.from("gallery").update({ order_index: item.order }).eq("id", item.id)
      )
    );

    return ok({ count: payload.length }, "Gallery order updated.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to reorder gallery items.");
  }
}
