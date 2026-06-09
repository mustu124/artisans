import { fail, ok } from "@/lib/api";
import { assertAdmin } from "@/lib/admin-auth";
import { filterGalleryItems, type GalleryItem } from "@/lib/gallery-data";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { galleryPayloadToSupabase, normalizeSupabaseGalleryItem } from "@/lib/supabase-mappers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 50);
    const supabaseConfigured = isSupabaseConfigured();
    const canUseFallback = process.env.NODE_ENV !== "production";
    const fallback = filterGalleryItems(type === "video" ? "Videos" : category).filter((item) =>
      type ? item.type === type : true
    );
    const paginatedFallback = fallback.slice((page - 1) * limit, page * limit);

    if (!supabaseConfigured) {
      if (!canUseFallback) {
        return fail("Supabase is not configured for this deployment.", 503);
      }

      return ok(
        { items: paginatedFallback, total: fallback.length, page, hasMore: page * limit < fallback.length, fallback: true },
        "Gallery items loaded from fallback gallery."
      );
    }

    const supabase = getSupabaseAdmin();
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("gallery")
      .select("*", { count: "exact" })
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (category && category !== "All" && category !== "Videos") query = query.eq("category", category);
    if (category === "Videos") query = query.eq("type", "video");
    if (type) query = query.eq("type", type);

    const { data, error, count } = await query;
    if (error) throw error;
    const normalizedItems = (data ?? []).map((item) => normalizeSupabaseGalleryItem(item)) as GalleryItem[];
    const total = count ?? normalizedItems.length;

    return ok(
      {
        items: normalizedItems,
        total,
        page,
        hasMore: page * limit < total,
        fallback: false
      },
      "Gallery items loaded."
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
