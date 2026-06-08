import { model, models, Schema, type InferSchemaType } from "mongoose";
import { PRODUCT_CATEGORIES, slugifyProductName } from "@/lib/product-data";

const ProductImageSchema = new Schema(
  {
    publicId: { type: String },
    url: { type: String, required: true },
    alt: { type: String }
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: PRODUCT_CATEGORIES
    },
    subcategory: { type: String, trim: true },
    originalPrice: { type: Number, min: 0 },
    videoUrl: { type: String, trim: true },
    dimensions: { type: String, trim: true },
    careInstructions: { type: String, trim: true },
    shippingInfo: { type: String, trim: true },
    images: [ProductImageSchema],
    isFeatured: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, required: true, default: 0, min: 0 },
    inventory: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 }
    }
  },
  {
    timestamps: true
  }
);

ProductSchema.pre("validate", function setSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugifyProductName(this.name);
  }

  if (this.isFeatured) {
    this.featured = true;
  }

  next();
});

ProductSchema.index({
  name: "text",
  description: "text",
  tags: "text"
});

export type Product = InferSchemaType<typeof ProductSchema>;

export const ProductModel = models.Product || model("Product", ProductSchema);
