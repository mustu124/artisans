import { fail, ok } from "@/lib/api";
import { assertAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { galleryPayloadToSupabase, normalizeSupabaseGalleryItem } from "@/lib/supabase-mappers";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = await request.json();
    const supabase = getSupabaseAdmin();
    const { data: item, error } = await supabase
      .from("gallery")
      .update(galleryPayloadToSupabase(payload))
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) throw error;
    if (!item) return fail("Gallery item not found.", 404);
    return ok({ item: normalizeSupabaseGalleryItem(item) }, "Gallery item updated.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update gallery item.");
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const supabase = getSupabaseAdmin();
    const { data: item, error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) throw error;
    if (!item) return fail("Gallery item not found.", 404);
    return ok({ item: normalizeSupabaseGalleryItem(item) }, "Gallery item deleted.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to delete gallery item.");
  }
}
