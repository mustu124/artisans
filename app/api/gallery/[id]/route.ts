import { assertAdmin, fail, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { GalleryImageModel } from "@/models/GalleryImage";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    await connectToDatabase();
    const payload = await request.json();
    const item = await GalleryImageModel.findByIdAndUpdate(params.id, payload, {
      new: true,
      runValidators: true
    }).lean();

    if (!item) return fail("Gallery item not found.", 404);
    return ok({ item }, "Gallery item updated.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update gallery item.");
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    await connectToDatabase();
    const item = await GalleryImageModel.findByIdAndDelete(params.id).lean();

    if (!item) return fail("Gallery item not found.", 404);
    return ok({ item }, "Gallery item deleted.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to delete gallery item.");
  }
}
