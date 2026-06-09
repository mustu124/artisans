import { fail, ok } from "@/lib/api";
import { assertAdmin } from "@/lib/admin-auth";
import { fallbackProducts } from "@/lib/product-data";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeSupabaseProduct, productPayloadToSupabase } from "@/lib/supabase-mappers";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const fallbackProduct = fallbackProducts.find(
      (product) => product.slug === params.slug || product._id === params.slug
    );
    const supabaseConfigured = isSupabaseConfigured();
    const canUseFallback = process.env.NODE_ENV !== "production";

    if (!supabaseConfigured) {
      if (!canUseFallback) {
        return fail("Supabase is not configured for this deployment.", 503);
      }

      if (!fallbackProduct) return fail("Product not found.", 404);
      return ok({ product: fallbackProduct, fallback: true }, "Product loaded.");
    }

    const supabase = getSupabaseAdmin();
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
      .maybeSingle();

    if (error) throw error;

    if (!product && (!canUseFallback || !fallbackProduct)) return fail("Product not found.", 404);

    return ok(
      { product: product ? normalizeSupabaseProduct(product) : fallbackProduct, fallback: !product },
      "Product loaded."
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load product.");
  }
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const supabase = getSupabaseAdmin();
    const { data: existing, error: lookupError } = await supabase
      .from("products")
      .select("id")
      .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!existing) return fail("Product not found.", 404);

    const { data: product, error } = await supabase
      .from("products")
      .update(productPayloadToSupabase(payload))
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;
    return ok({ product: normalizeSupabaseProduct(product) }, "Product updated.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update product.");
  }
}

export async function DELETE(_: Request, { params }: { params: { slug: string } }) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing, error: lookupError } = await supabase
      .from("products")
      .select("id")
      .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!existing) return fail("Product not found.", 404);

    const { data: product, error } = await supabase
      .from("products")
      .delete()
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;
    return ok({ product: normalizeSupabaseProduct(product) }, "Product deleted.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to delete product.");
  }
}
