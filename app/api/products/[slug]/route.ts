import { assertAdmin, fail, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { fallbackProducts, normalizeProduct, slugifyProductName } from "@/lib/product-data";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const fallbackProduct = fallbackProducts.find(
      (product) => product.slug === params.slug || product._id === params.slug
    );
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.includes("USER:PASSWORD")) {
      if (!fallbackProduct) return fail("Product not found.", 404);
      return ok({ product: fallbackProduct, fallback: true }, "Product loaded.");
    }

    await connectToDatabase();
    const lookup = mongoose.isValidObjectId(params.slug)
      ? { $or: [{ slug: params.slug }, { _id: params.slug }] }
      : { slug: params.slug };
    const product = await ProductModel.findOne({
      active: true,
      ...lookup
    }).lean();

    if (!product && !fallbackProduct) return fail("Product not found.", 404);

    return ok(
      { product: product ? normalizeProduct(product as Record<string, unknown>) : fallbackProduct, fallback: !product },
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
    await connectToDatabase();
    const payload = (await request.json()) as Record<string, unknown>;
    const update = {
      ...payload,
      ...(payload.name && !payload.slug ? { slug: slugifyProductName(String(payload.name)) } : {})
    };
    const lookup = mongoose.isValidObjectId(params.slug)
      ? { $or: [{ slug: params.slug }, { _id: params.slug }] }
      : { slug: params.slug };
    const product = await ProductModel.findOneAndUpdate(
      lookup,
      update,
      { new: true, runValidators: true }
    ).lean();

    if (!product) return fail("Product not found.", 404);
    return ok({ product: normalizeProduct(product as Record<string, unknown>) }, "Product updated.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update product.");
  }
}

export async function DELETE(_: Request, { params }: { params: { slug: string } }) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    await connectToDatabase();
    const lookup = mongoose.isValidObjectId(params.slug)
      ? { $or: [{ slug: params.slug }, { _id: params.slug }] }
      : { slug: params.slug };
    const product = await ProductModel.findOneAndDelete(lookup).lean();

    if (!product) return fail("Product not found.", 404);
    return ok({ product: normalizeProduct(product as Record<string, unknown>) }, "Product deleted.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to delete product.");
  }
}
