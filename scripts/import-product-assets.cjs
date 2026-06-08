const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const cloudinary = require("cloudinary").v2;
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const sourceDir = path.join(process.cwd(), "Artisan Root Product Photos for Website");
const categories = [
  "Handbag",
  "Wall hanging with mirror",
  "Wall hanging without mirror",
  "Runner",
  "Pot hanger",
  "Key Chains",
  "Dinner Mat",
  "Coaster",
  "Pocket Organiser",
  "Lamp Shade"
];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromFile(fileName, index) {
  const cleanName = path
    .basename(fileName, path.extname(fileName))
    .replace(/[-_]+/g, " ")
    .replace(/\b(img|dsc|wa)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleanName && !/^[a-f0-9\s-]{12,}$/i.test(cleanName)
    ? `Artisan Root ${cleanName}`
    : `Artisan Root Handmade Piece ${String(index + 1).padStart(2, "0")}`;
}

async function main() {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Missing product asset folder: ${sourceDir}`);
  }

  const requiredEnv = ["MONGODB_URI", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing env values: ${missing.join(", ")}`);

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);
  const products = db.collection("products");
  const gallery = db.collection("galleryimages");

  let imported = 0;
  for (const [index, file] of files.entries()) {
    const localPath = path.join(sourceDir, file);
    const name = titleFromFile(file, index);
    const slug = slugify(name);
    const category = categories[index % categories.length];
    const price = 799 + (index % 8) * 250;

    const upload = await cloudinary.uploader.upload(localPath, {
      folder: "artisan-root/products",
      public_id: slug,
      overwrite: true,
      resource_type: "image",
      quality: "auto:good",
      fetch_format: "auto"
    });

    const image = {
      url: upload.secure_url,
      publicId: upload.public_id,
      alt: name
    };

    await products.updateOne(
      { slug },
      {
        $set: {
          name,
          slug,
          category,
          subcategory: "",
          description:
            "A handmade Artisan Root piece crafted with warm texture, natural materials, and quiet boho detail.",
          price,
          originalPrice: price + 400,
          images: [image],
          dimensions: "Custom handmade dimensions. Contact us for exact sizing.",
          careInstructions: "Spot clean gently and keep away from prolonged moisture.",
          shippingInfo: "All over India shipping is available.",
          isFeatured: index < 8,
          featured: index < 8,
          inStock: true,
          stockCount: 10,
          inventory: 10,
          active: true,
          tags: ["artisan-root", "handmade", "macrame", category],
          rating: { average: 4.8, count: 12 },
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    await gallery.updateOne(
      { publicId: upload.public_id },
      {
        $set: {
          url: upload.secure_url,
          thumbnailUrl: upload.secure_url,
          publicId: upload.public_id,
          type: "image",
          caption: name,
          category,
          order: index,
          featured: index < 12,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    imported += 1;
    console.log(`Imported ${imported}/${files.length}: ${name}`);
  }

  await client.close();
  console.log(`Done. Imported ${imported} images as products and gallery items.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
