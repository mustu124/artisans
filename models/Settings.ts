import { model, models, Schema, type InferSchemaType } from "mongoose";

const HeroSlideSchema = new Schema(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    ctaText: { type: String },
    ctaLink: { type: String }
  },
  { _id: false }
);

const SettingsSchema = new Schema(
  {
    heroSlides: [HeroSlideSchema],
    mobileHeroSlides: [HeroSlideSchema],
    videoUrl: { type: String },
    announcementText: { type: String },
    whatsappNumber: { type: String },
    socialLinks: {
      instagram: { type: String },
      facebook: { type: String }
    },
    aboutText: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    storeEmail: { type: String },
    storeAddress: { type: String },
    footerCopyright: { type: String },
    categories: [
      {
        name: { type: String, required: true },
        icon: { type: String },
        description: { type: String },
        subcategories: [{ type: String, trim: true }],
        visible: { type: Boolean, default: true }
      }
    ]
  },
  { timestamps: true }
);

export type Settings = InferSchemaType<typeof SettingsSchema>;

export const SettingsModel = models.Settings || model("Settings", SettingsSchema);
