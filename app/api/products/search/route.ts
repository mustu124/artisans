import { fail, ok } from "@/lib/api";
import { filterFallbackProducts } from "@/lib/product-data";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeSupabaseProduct } from "@/lib/supabase-mappers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return ok({ products: [] }, "Enter at least 2 characters.");
    }

    const supabaseConfigured = isSupabaseConfigured();
    const canUseFallback = process.env.NODE_ENV !== "production";
    const fallback = filterFallbackProducts({ query }).slice(0, 8);

    if (!supabaseConfigured) {
      if (!canUseFallback) {
        return fail("Supabase is not configured for this deployment.", 503);
      }

      return ok({ products: fallback, fallback: true }, "Search results loaded from fallback catalog.");
    }

    const supabase = getSupabaseAdmin();
    const safeQuery = query.replace(/[%_]/g, "\\$&");
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .or(`name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`)
      .limit(12);

    if (error) throw error;
    const normalizedProducts = (data ?? []).map((product) => normalizeSupabaseProduct(product));

    return ok(
      { products: normalizedProducts, fallback: false },
      "Search results loaded."
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to search products.");
  }
}
