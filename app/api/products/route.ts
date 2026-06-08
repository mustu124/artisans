import { NextResponse } from "next/server";
import { assertAdmin, fail, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import {
  fallbackProducts,
  filterFallbackProducts,
  normalizeProduct,
  slugifyProductName,
  type StoreProduct
} from "@/lib/product-data";

export const dynamic = "force-dynamic";

const sortMap: Record<string, Record<string, 1 | -1>> = {
  price_asc: { price: 1 },
  "price-asc": { price: 1 },
  price_desc: { price: -1 },
  "price-desc": { price: -1 },
  popular: { "rating.count": -1, "rating.average": -1 },
  newest: { createdAt: -1 }
};

function sortFallback(products: StoreProduct[], sort: string) {
  return [...products].sort((a, b) => {
    if (sort === "price_asc" || sort === "price-asc") return a.price - b.price;
    if (sort === "price_desc" || sort === "price-desc") return b.price - a.price;
    if (sort === "popular") return (b.popularScore ?? 0) - (a.popularScore ?? 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const featured = searchParams.get("featured") === "true";
    const exclude = searchParams.get("exclude");
    const sort = searchParams.get("sort") ?? "newest";
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 12), 1), 50);
    const mongoUri = process.env.MONGODB_URI;
    const fallbackFiltered = sortFallback(filterFallbackProducts({ category, exclude, featured }), sort);
    const paginatedFallback = fallbackFiltered.slice((page - 1) * limit, page * limit);

    if (!mongoUri || mongoUri.includes("USER:PASSWORD")) {
      return ok(
        {
          products: paginatedFallback,
          total: fallbackFiltered.length,
          page,
          hasMore: page * limit < fallbackFiltered.length,
          fallback: true
        },
        "Products loaded from fallback catalog."
      );
    }

    await connectToDatabase();

    const query: Record<string, unknown> = { active: true };
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (featured) query.$or = [{ isFeatured: true }, { featured: true }];
    if (exclude) query.$and = [{ _id: { $ne: exclude } }, { slug: { $ne: exclude } }];

    const products = await ProductModel.find(query)
      .sort(sortMap[sort] ?? sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await ProductModel.countDocuments(query);
    const normalizedProducts = products.map((product) =>
      normalizeProduct(product as Record<string, unknown>)
    );

    return ok(
      {
        products: normalizedProducts,
        total,
        page,
        hasMore: page * limit < total,
        fallback: false
      },
      "Products loaded."
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load products.");
  }
}

export async function POST(request: Request) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    await connectToDatabase();
    const payload = (await request.json()) as Record<string, unknown>;
    const name = String(payload.name ?? "");

    if (!name || !payload.category || !payload.price) {
      return fail("Name, category, and price are required.", 400);
    }

    const product = await ProductModel.create({
      ...payload,
      slug: payload.slug ?? slugifyProductName(name)
    });

    return ok({ product: normalizeProduct(product.toObject()) }, "Product created.", { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to create product.");
  }
}
