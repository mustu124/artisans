import { fail, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { filterFallbackProducts, normalizeProduct } from "@/lib/product-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return ok({ products: [] }, "Enter at least 2 characters.");
    }

    const mongoUri = process.env.MONGODB_URI;
    const fallback = filterFallbackProducts({ query }).slice(0, 8);

    if (!mongoUri || mongoUri.includes("USER:PASSWORD")) {
      return ok({ products: fallback, fallback: true }, "Search results loaded from fallback catalog.");
    }

    await connectToDatabase();
    const products = await ProductModel.find(
      { active: true, $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(12)
      .lean();
    const normalizedProducts = products.map((product) =>
      normalizeProduct(product as Record<string, unknown>)
    );

    return ok(
      { products: normalizedProducts, fallback: false },
      "Search results loaded."
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to search products.");
  }
}
