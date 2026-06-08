import { assertAdmin, fail, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { GalleryImageModel } from "@/models/GalleryImage";
import { filterGalleryItems, type GalleryItem } from "@/lib/gallery-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 50);
    const mongoUri = process.env.MONGODB_URI;
    const fallback = filterGalleryItems(type === "video" ? "Videos" : category).filter((item) =>
      type ? item.type === type : true
    );
    const paginatedFallback = fallback.slice((page - 1) * limit, page * limit);

    if (!mongoUri || mongoUri.includes("USER:PASSWORD")) {
      return ok(
        { items: paginatedFallback, total: fallback.length, page, hasMore: page * limit < fallback.length, fallback: true },
        "Gallery items loaded from fallback gallery."
      );
    }

    await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (category && category !== "All" && category !== "Videos") query.category = category;
    if (category === "Videos") query.type = "video";
    if (type) query.type = type;

    const items = await GalleryImageModel.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await GalleryImageModel.countDocuments(query);
    const normalizedItems = items.map((item) => ({
      _id: String(item._id),
      url: item.url,
      type: item.type,
      thumbnailUrl: item.thumbnailUrl,
      caption: item.caption,
      category: item.category,
      order: item.order
    })) as GalleryItem[];

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
    await connectToDatabase();
    const payload = await request.json();
    const item = await GalleryImageModel.create(payload);
    return ok({ item }, "Gallery item created.", { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to create gallery item.");
  }
}
