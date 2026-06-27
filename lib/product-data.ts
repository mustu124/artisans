export const PRODUCT_CATEGORIES = [
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
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type StoreProduct = {
  _id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  subcategory?: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: Array<{
    url: string;
    publicId?: string;
    alt?: string;
  }>;
  videoUrl?: string;
  dimensions?: string;
  careInstructions?: string;
  shippingInfo?: string;
  isFeatured: boolean;
  featured?: boolean;
  inStock: boolean;
  stockCount: number;
  tags: string[];
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
  variants?: string[];
  popularScore?: number;
};

export function slugifyProductName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getStableRatingSeed(value: string) {
  return Array.from(value).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) % 9973;
  }, 17);
}

export function getDisplayRating(product: Pick<StoreProduct, "slug" | "name" | "_id">) {
  const seed = getStableRatingSeed(product.slug || product.name || product._id);
  return Number((4.5 + (seed % 6) / 10).toFixed(1));
}

const sharedImages = {
  wall:
    "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=85",
  mirror:
    "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=85",
  plants:
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=85",
  table:
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=85",
  handbag:
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85",
  coaster:
    "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&w=1000&q=85",
  organiser:
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
  lamp:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85"
};

export const fallbackProducts: StoreProduct[] = [
  {
    _id: "sample-1",
    name: "Ivory Moon Wall Hanging",
    slug: "ivory-moon-wall-hanging",
    category: "Wall hanging without mirror",
    description:
      "A soft ivory statement piece hand-knotted with layered fringe and a quiet crescent rhythm.",
    price: 1899,
    originalPrice: 2399,
    images: [
      { url: sharedImages.wall, publicId: "sample-wall-1", alt: "Ivory macrame wall hanging" },
      { url: sharedImages.mirror, publicId: "sample-wall-1-room", alt: "Boho wall styling" },
      { url: sharedImages.table, publicId: "sample-wall-1-detail", alt: "Natural handmade texture" }
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    dimensions: "Approx. 24 x 36 inches. Natural wooden dowel included.",
    careInstructions: "Dust gently with a soft cloth. Spot clean only. Keep away from damp walls.",
    shippingInfo: "Ships in 3-5 business days. Free shipping on orders above INR 999.",
    isFeatured: true,
    featured: true,
    inStock: true,
    stockCount: 12,
    tags: ["wall", "ivory", "boho", "cotton"],
    rating: { average: 4.8, count: 42 },
    createdAt: "2026-05-20T10:00:00.000Z",
    variants: ["Small", "Medium", "Large"],
    popularScore: 96
  },
  {
    _id: "sample-2",
    name: "Boho Mirror Charm",
    slug: "boho-mirror-charm",
    category: "Wall hanging with mirror",
    description:
      "A rounded mirror framed with cotton knots for entryways, bedrooms, and sunny corners.",
    price: 2499,
    originalPrice: 2999,
    images: [
      { url: sharedImages.mirror, publicId: "sample-mirror-1", alt: "Macrame mirror wall hanging" },
      { url: sharedImages.wall, publicId: "sample-mirror-2", alt: "Macrame detail" },
      { url: sharedImages.organiser, publicId: "sample-mirror-3", alt: "Warm boho room" }
    ],
    dimensions: "Mirror diameter 10 inches. Total hanging length approx. 28 inches.",
    careInstructions: "Clean mirror with a dry microfiber cloth. Comb fringe lightly when needed.",
    shippingInfo: "Packed with reinforced mirror-safe packaging. Ships in 4-6 business days.",
    isFeatured: true,
    featured: true,
    inStock: true,
    stockCount: 8,
    tags: ["mirror", "entryway", "wall", "gift"],
    rating: { average: 4.9, count: 31 },
    createdAt: "2026-05-18T10:00:00.000Z",
    variants: ["Natural", "Terracotta"],
    popularScore: 92
  },
  {
    _id: "sample-3",
    name: "Sage Plant Hanger",
    slug: "sage-plant-hanger",
    category: "Pot hanger",
    description:
      "A clean hanging planter holder with sage wrapping, ideal for trailing greens and balcony corners.",
    price: 899,
    images: [
      { url: sharedImages.plants, publicId: "sample-plant-1", alt: "Hanging plant holder" },
      { url: sharedImages.organiser, publicId: "sample-plant-2", alt: "Boho plant corner" },
      { url: sharedImages.wall, publicId: "sample-plant-3", alt: "Cotton rope detail" }
    ],
    dimensions: "Fits 5-7 inch pots. Hanging length approx. 34 inches.",
    careInstructions: "Use indoors or covered balconies. Avoid direct rain exposure.",
    shippingInfo: "Ships folded with easy styling instructions.",
    isFeatured: true,
    featured: true,
    inStock: true,
    stockCount: 20,
    tags: ["plant", "sage", "balcony", "cotton"],
    rating: { average: 4.7, count: 58 },
    createdAt: "2026-05-17T10:00:00.000Z",
    variants: ["Single", "Pair"],
    popularScore: 88
  },
  {
    _id: "sample-4",
    name: "Golden Table Runner",
    slug: "golden-table-runner",
    category: "Runner",
    description:
      "A textured runner that brings handmade warmth to dinner tables, consoles, and low shelves.",
    price: 1599,
    originalPrice: 1899,
    images: [
      { url: sharedImages.table, publicId: "sample-runner-1", alt: "Handmade table runner" },
      { url: sharedImages.coaster, publicId: "sample-runner-2", alt: "Neutral tabletop styling" },
      { url: sharedImages.lamp, publicId: "sample-runner-3", alt: "Warm home decor" }
    ],
    dimensions: "Approx. 14 x 54 inches. Custom lengths available on request.",
    careInstructions: "Spot clean only. Roll for storage to preserve fringe.",
    shippingInfo: "Ships in 3-5 business days.",
    isFeatured: true,
    featured: true,
    inStock: true,
    stockCount: 14,
    tags: ["runner", "table", "hosting", "gold"],
    rating: { average: 4.6, count: 24 },
    createdAt: "2026-05-15T10:00:00.000Z",
    variants: ["4 Seater", "6 Seater", "8 Seater"],
    popularScore: 82
  },
  {
    _id: "sample-5",
    name: "Everyday Knot Handbag",
    slug: "everyday-knot-handbag",
    category: "Handbag",
    description:
      "A roomy knotted handbag with a soft structure, designed for markets, brunch, and daily carry.",
    price: 2199,
    images: [
      { url: sharedImages.handbag, publicId: "sample-handbag-1", alt: "Handmade macrame handbag" },
      { url: sharedImages.table, publicId: "sample-handbag-2", alt: "Handcrafted lifestyle styling" },
      { url: sharedImages.wall, publicId: "sample-handbag-3", alt: "Cotton knot texture" }
    ],
    dimensions: "Approx. 14 x 12 inches. Cotton-lined base.",
    careInstructions: "Keep dry. Use a lint roller or soft brush for maintenance.",
    shippingInfo: "Ships in 5-7 business days due to handmade finishing.",
    isFeatured: true,
    featured: true,
    inStock: true,
    stockCount: 6,
    tags: ["bag", "handbag", "market", "cotton"],
    rating: { average: 4.8, count: 19 },
    createdAt: "2026-05-12T10:00:00.000Z",
    variants: ["Ivory", "Sand", "Sage"],
    popularScore: 78
  },
  {
    _id: "sample-6",
    name: "Cotton Coaster Set",
    slug: "cotton-coaster-set",
    category: "Coaster",
    description:
      "A set of braided cotton coasters for everyday tea, coffee, and slow table moments.",
    price: 599,
    originalPrice: 749,
    images: [
      { url: sharedImages.coaster, publicId: "sample-coaster-1", alt: "Cotton coaster set" },
      { url: sharedImages.table, publicId: "sample-coaster-2", alt: "Tabletop coaster styling" },
      { url: sharedImages.lamp, publicId: "sample-coaster-3", alt: "Neutral home decor" }
    ],
    dimensions: "Set of 4. Each coaster approx. 4 inches wide.",
    careInstructions: "Spot clean and air dry flat.",
    shippingInfo: "Ships in 2-4 business days.",
    isFeatured: true,
    featured: true,
    inStock: true,
    stockCount: 35,
    tags: ["coaster", "table", "gift", "cotton"],
    rating: { average: 4.5, count: 64 },
    createdAt: "2026-05-10T10:00:00.000Z",
    variants: ["Set of 4", "Set of 6"],
    popularScore: 74
  },
  {
    _id: "sample-7",
    name: "Pocket Organiser",
    slug: "pocket-organiser",
    category: "Pocket Organiser",
    description:
      "A wall pocket organiser for letters, keys, tiny notes, and gentle everyday order.",
    price: 1299,
    images: [
      { url: sharedImages.organiser, publicId: "sample-organiser-1", alt: "Macrame pocket organiser" },
      { url: sharedImages.mirror, publicId: "sample-organiser-2", alt: "Boho interior wall" },
      { url: sharedImages.wall, publicId: "sample-organiser-3", alt: "Handmade cotton detail" }
    ],
    dimensions: "Approx. 16 x 24 inches with two storage pockets.",
    careInstructions: "Dust weekly. Do not machine wash.",
    shippingInfo: "Ships in 3-5 business days.",
    isFeatured: true,
    featured: true,
    inStock: true,
    stockCount: 10,
    tags: ["organiser", "storage", "wall", "entryway"],
    rating: { average: 4.7, count: 27 },
    createdAt: "2026-05-08T10:00:00.000Z",
    variants: ["Two Pocket", "Three Pocket"],
    popularScore: 70
  },
  {
    _id: "sample-8",
    name: "Amber Lamp Shade",
    slug: "amber-lamp-shade",
    category: "Lamp Shade",
    description:
      "A woven shade that softens light into a warm amber glow for bedrooms and reading corners.",
    price: 2799,
    originalPrice: 3299,
    images: [
      { url: sharedImages.lamp, publicId: "sample-lamp-1", alt: "Macrame lamp shade" },
      { url: sharedImages.organiser, publicId: "sample-lamp-2", alt: "Warm boho bedroom" },
      { url: sharedImages.table, publicId: "sample-lamp-3", alt: "Handmade home decor" }
    ],
    dimensions: "Approx. 12 inch shade diameter. Electrical fitting not included.",
    careInstructions: "Dust with a dry cloth. Keep away from high heat bulbs.",
    shippingInfo: "Ships in 5-7 business days with structured packaging.",
    isFeatured: true,
    featured: true,
    inStock: true,
    stockCount: 5,
    tags: ["lamp", "shade", "lighting", "bedroom"],
    rating: { average: 4.9, count: 16 },
    createdAt: "2026-05-06T10:00:00.000Z",
    variants: ["Small", "Large"],
    popularScore: 86
  },
  {
    _id: "sample-9",
    name: "Dinner Mat Duo",
    slug: "dinner-mat-duo",
    category: "Dinner Mat",
    description:
      "A pair of handwoven dinner mats with tactile rope edges and a relaxed table presence.",
    price: 999,
    images: [
      { url: sharedImages.table, publicId: "sample-mat-1", alt: "Handmade dinner mats" },
      { url: sharedImages.coaster, publicId: "sample-mat-2", alt: "Neutral dining setup" },
      { url: sharedImages.lamp, publicId: "sample-mat-3", alt: "Warm table decor" }
    ],
    dimensions: "Set of 2. Each mat approx. 12 x 18 inches.",
    careInstructions: "Spot clean. Air dry fully before storage.",
    shippingInfo: "Ships in 2-4 business days.",
    isFeatured: false,
    inStock: true,
    stockCount: 24,
    tags: ["mat", "dinner", "table", "hosting"],
    rating: { average: 4.4, count: 22 },
    createdAt: "2026-05-03T10:00:00.000Z",
    variants: ["Pair", "Set of 4"],
    popularScore: 68
  },
  {
    _id: "sample-10",
    name: "Mini Knot Key Chains",
    slug: "mini-knot-key-chains",
    category: "Key Chains",
    description:
      "Tiny knotted keepsakes for keys, bags, gifting, and thoughtful little add-ons.",
    price: 349,
    images: [
      { url: sharedImages.handbag, publicId: "sample-keychain-1", alt: "Macrame key chain on bag" },
      { url: sharedImages.wall, publicId: "sample-keychain-2", alt: "Cotton knot detail" },
      { url: sharedImages.coaster, publicId: "sample-keychain-3", alt: "Handmade cotton accessories" }
    ],
    dimensions: "Approx. 5 inches long including ring.",
    careInstructions: "Spot clean and air dry.",
    shippingInfo: "Ships in 2-3 business days.",
    isFeatured: false,
    inStock: true,
    stockCount: 50,
    tags: ["keychain", "gift", "bag", "mini"],
    rating: { average: 4.6, count: 73 },
    createdAt: "2026-05-01T10:00:00.000Z",
    variants: ["Ivory", "Terracotta", "Sage"],
    popularScore: 76
  }
];

export function normalizeProduct(product: Record<string, unknown>): StoreProduct {
  const name = String(product.name ?? "Untitled Product");
  const slug = String(product.slug ?? slugifyProductName(name));
  const isFeatured = Boolean(product.isFeatured ?? product.featured);
  const _id = String(product._id ?? product.id ?? slug);
  const ratingAverage = getDisplayRating({ _id, name, slug });

  return {
    _id,
    name,
    slug,
    category: (product.category as ProductCategory) ?? "Wall hanging without mirror",
    subcategory: product.subcategory ? String(product.subcategory) : undefined,
    description: String(product.description ?? ""),
    price: Number(product.price ?? 0),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    images: Array.isArray(product.images) ? (product.images as StoreProduct["images"]) : [],
    videoUrl: product.videoUrl ? String(product.videoUrl) : undefined,
    dimensions: product.dimensions ? String(product.dimensions) : undefined,
    careInstructions: product.careInstructions ? String(product.careInstructions) : undefined,
    shippingInfo: product.shippingInfo ? String(product.shippingInfo) : undefined,
    isFeatured,
    featured: isFeatured,
    inStock: product.inStock === undefined ? true : Boolean(product.inStock),
    stockCount: Number(product.stockCount ?? product.inventory ?? 0),
    tags: Array.isArray(product.tags) ? (product.tags as string[]) : [],
    rating: { average: ratingAverage, count: 0 },
    createdAt: product.createdAt ? String(product.createdAt) : new Date().toISOString(),
    variants: Array.isArray(product.variants) ? (product.variants as string[]) : undefined,
    popularScore: Number(product.popularScore ?? 0)
  };
}

export function filterFallbackProducts({
  category,
  subcategory,
  exclude,
  featured,
  maxPrice,
  query
}: {
  category?: string | null;
  subcategory?: string | null;
  exclude?: string | null;
  featured?: boolean;
  maxPrice?: number;
  query?: string | null;
}) {
  const normalizedQuery = query?.toLowerCase().trim();

  return fallbackProducts.filter((product) => {
    if (featured && !product.isFeatured) return false;
    if (category && product.category !== category) return false;
    if (subcategory && product.subcategory !== subcategory) return false;
    if (maxPrice && product.price > maxPrice) return false;
    if (exclude && (product._id === exclude || product.slug === exclude)) return false;

    if (normalizedQuery) {
      const haystack = [product.name, product.category, product.description, product.tags.join(" ")]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) return false;
    }

    return true;
  }).map((product) => normalizeProduct(product as unknown as Record<string, unknown>));
}
