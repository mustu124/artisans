import { model, models, Schema, type InferSchemaType } from "mongoose";

const GalleryImageSchema = new Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true, default: "image" },
    thumbnailUrl: { type: String },
    caption: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    publicId: { type: String },
    featured: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

export type GalleryImage = InferSchemaType<typeof GalleryImageSchema>;

export const GalleryImageModel =
  models.GalleryImage || model("GalleryImage", GalleryImageSchema);
