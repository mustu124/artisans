import { assertAdmin, fail, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { GalleryImageModel } from "@/models/GalleryImage";

type ReorderPayload = Array<{ id: string; order: number }>;

export async function POST(request: Request) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as ReorderPayload;

    if (!Array.isArray(payload)) {
      return fail("Expected an array of { id, order }.", 400);
    }

    await connectToDatabase();
    await Promise.all(
      payload.map((item) =>
        GalleryImageModel.findByIdAndUpdate(item.id, { order: item.order }, { runValidators: true })
      )
    );

    return ok({ count: payload.length }, "Gallery order updated.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to reorder gallery items.");
  }
}
