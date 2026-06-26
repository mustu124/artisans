import type { StoreProduct } from "@/lib/product-data";

export type GalleryItem = {
  _id: string;
  url: string;
  type: "image" | "video";
  thumbnailUrl?: string;
  caption: string;
  category: string;
  order: number;
  productId?: string;
  productSlug?: string;
  productName?: string;
};

const imageUrls = [
  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=900&q=85"
];

const categories = [
  "Wall Hangings",
  "Wall Hangings",
  "Pot Hangers",
  "Runners",
  "Handbag",
  "Coasters",
  "Lifestyle",
  "Lifestyle",
  "Dinner Mats",
  "Key Chains"
];

export const fallbackGalleryItems: GalleryItem[] = Array.from({ length: 30 }).map((_, index) => {
  const imageIndex = index % imageUrls.length;
  const isVideo = index === 7 || index === 17 || index === 26;

  return {
    _id: `gallery-${index + 1}`,
    url: isVideo ? "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" : imageUrls[imageIndex],
    type: isVideo ? "video" : "image",
    thumbnailUrl: imageUrls[imageIndex],
    caption: [
      "Ivory knots styled against a sunlit wall",
      "Mirror macrame detail for warm entryways",
      "Plant hanger layered with trailing greens",
      "Textured runner for intimate dinners",
      "Everyday knot handbag in natural cotton",
      "Cotton coasters for slow table rituals",
      "A calm boho corner with handmade texture",
      "Amber light and woven softness",
      "Dining details with handcrafted warmth",
      "Tiny knot accessories for gifting"
    ][imageIndex],
    category: isVideo ? "Videos" : categories[imageIndex],
    order: index + 1
  };
});

export function filterGalleryItems(category?: string | null) {
  if (!category || category === "All") return fallbackGalleryItems;
  if (category === "Videos") return fallbackGalleryItems.filter((item) => item.type === "video");
  return fallbackGalleryItems.filter((item) => item.category === category);
}

export function productToGalleryItems(product: StoreProduct, productIndex = 0): GalleryItem[] {
  const productKey = product.slug || product._id;
  const imageItems = product.images.map((image, imageIndex) => ({
    _id: `${productKey}-image-${imageIndex + 1}`,
    url: image.url,
    type: "image" as const,
    thumbnailUrl: image.url,
    caption: image.alt || product.name,
    category: product.category,
    order: productIndex * 100 + imageIndex + 1,
    productId: product._id,
    productSlug: product.slug,
    productName: product.name
  }));

  if (!product.videoUrl) return imageItems;

  return [
    ...imageItems,
    {
      _id: `${productKey}-video`,
      url: product.videoUrl,
      type: "video" as const,
      thumbnailUrl: product.images[0]?.url,
      caption: `${product.name} video`,
      category: product.category,
      order: productIndex * 100 + imageItems.length + 1,
      productId: product._id,
      productSlug: product.slug,
      productName: product.name
    }
  ];
}

export function filterProductGalleryItems(items: GalleryItem[], category?: string | null, type?: string | null) {
  const normalizedCategory = category?.toLowerCase().trim();

  return items.filter((item) => {
    if (type && item.type !== type) return false;
    if (!normalizedCategory || normalizedCategory === "all") return true;
    if (normalizedCategory === "videos") return item.type === "video";
    if (normalizedCategory === "wall hangings") return item.category.toLowerCase().startsWith("wall hanging");
    return item.category.toLowerCase() === normalizedCategory;
  });
}
