const { loadEnvConfig } = require("@next/env");
const { MongoClient } = require("mongodb");

loadEnvConfig(process.cwd());

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const db = client.db(process.env.MONGODB_DB);
  const product = await db.collection("products").findOne({});

  if (!product?.images?.[0]?.url) {
    throw new Error("No imported product image found.");
  }

  const settings = await db.collection("settings").findOne({});
  if (!settings) {
    throw new Error("No settings document found.");
  }

  settings.heroSlides = (settings.heroSlides?.length ? settings.heroSlides : [{}]).map((slide, index) =>
    index === 0
      ? {
          ...slide,
          image: product.images[0].url,
          title: slide.title || product.name,
          subtitle: slide.subtitle || "Premium macrame and craft pieces for slow, soulful spaces.",
          ctaText: slide.ctaText || "Shop Now",
          ctaLink: slide.ctaLink || "/shop"
        }
      : slide
  );

  await db.collection("settings").replaceOne({ _id: settings._id }, settings);
  console.log(`Desktop hero image set to ${product.images[0].url}`);

  await client.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
