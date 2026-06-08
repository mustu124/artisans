import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { fallbackProducts } from "../lib/product-data";
import { ProductModel } from "../models/Product";

async function main() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to seed Artisan Root.");
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB
  });

  await ProductModel.deleteMany({});
  await ProductModel.insertMany(
    fallbackProducts.slice(0, 10).map((product) => ({
      ...product,
      images: product.images.map((image) => ({
        ...image,
        publicId: image.publicId ?? product.slug
      }))
    }))
  );

  console.log(`Seeded ${fallbackProducts.slice(0, 10).length} products.`);

  if (!process.env.ADMIN_PASSWORD_HASH) {
    const hash = await bcrypt.hash("admin123", 12);
    console.log(`Sample ADMIN_PASSWORD_HASH for admin123: ${hash}`);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
