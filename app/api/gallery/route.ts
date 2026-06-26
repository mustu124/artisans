import { fail, ok } from "@/lib/api";
import { assertAdmin } from "@/lib/admin-auth";
import { fallbackProducts, normalizeProduct } from "@/lib/product-data";
import {
  filterProductGalleryItems,
  productToGalleryItems,
  type GalleryItem
} from "@/lib/gallery-data";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { galleryPayloadToSupabase, normalizeSupabaseGalleryItem } from "@/lib/supabase-mappers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 100);
    const supabaseConfigured = isSupabaseConfigured();
    const canUseFallback = process.env.NODE_ENV !== "production";
    const fallbackProductGallery = filterProductGalleryItems(
      fallbackProducts.flatMap((product, index) =>
        productToGalleryItems(normalizeProduct(product as unknown as Record<string, unknown>), index)
      ),
      category,
      type
    );
    const paginatedProductFallback = fallbackProductGallery.slice((page - 1) * limit, page * limit);

    if (!supabaseConfigured) {
      if (!canUseFallback) {
        return fail("Supabase is not configured for this deployment.", 503);
      }

      return ok(
        {
          items: paginatedProductFallback,
          total: fallbackProductGallery.length,
          page,
          hasMore: page * limit < fallbackProductGallery.length,
          fallback: true
        },
        "Gallery items loaded from fallback products."
      );
    }

    const supabase = getSupabaseAdmin();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (productsError) throw productsError;

    const productGallery = filterProductGalleryItems(
      (products ?? []).flatMap((product, index) => productToGalleryItems(normalizeProduct(product), index)),
      category,
      type
    );

    if (productGallery.length > 0) {
      const paginatedItems = productGallery.slice(from, page * limit);

      return ok(
        {
          items: paginatedItems,
          total: productGallery.length,
          page,
          hasMore: page * limit < productGallery.length,
          fallback: false,
          source: "products"
        },
        "Gallery items loaded from products."
      );
    }

    return ok(
      {
        items: [],
        total: 0,
        page,
        hasMore: false,
        fallback: false,
        source: "products"
      },
      "No product media found for the gallery."
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load gallery items.");
  }
}

export async function POST(request: Request) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = await request.json();
    const supabase = getSupabaseAdmin();
    const { data: item, error } = await supabase
      .from("gallery")
      .insert(galleryPayloadToSupabase(payload))
      .select("*")
      .single();

    if (error) throw error;
    return ok({ item: normalizeSupabaseGalleryItem(item) }, "Gallery item created.", { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to create gallery item.");
  }
}
