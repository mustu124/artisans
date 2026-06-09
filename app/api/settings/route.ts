import { fail, ok } from "@/lib/api";
import { assertAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeSupabaseSettings, settingsPayloadToSupabase } from "@/lib/supabase-mappers";

export const dynamic = "force-dynamic";

const defaultSettings = {
  heroSlides: [
    {
      image: "/logo.png",
      title: "Handmade warmth for modern homes",
      subtitle: "Premium macrame and craft pieces for slow, soulful spaces.",
      ctaText: "Shop Now",
      ctaLink: "/shop"
    }
  ],
  mobileHeroSlides: [
    {
      image: "/logo.png",
      title: "Handmade warmth for modern homes",
      subtitle: "Premium macrame and craft pieces for slow, soulful spaces.",
      ctaText: "Shop Now",
      ctaLink: "/shop"
    }
  ],
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  announcementText:
    "Free shipping on orders above \u20B9999 · Handcrafted with love · 100% natural cotton rope · New arrivals every week",
  whatsappNumber: process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? "91XXXXXXXXXX",
  socialLinks: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/"
  },
  aboutText: "Artisan Root creates handmade macrame and craft pieces for warm creative homes.",
  metaTitle: "Artisan Root | Cultivating Creative Spaces",
  metaDescription: "Shop macrame decor, handmade wall hangings, plant hangers, and handcraft pieces from Artisan Root.",
  storeEmail: "hello@artisanroot.in",
  storeAddress: "India",
  footerCopyright: "\u00A9 2025 Artisan Root",
  categories: [
    {
      name: "Handbag",
      icon: "Bag",
      description: "Hand-knotted bags and everyday carry pieces.",
      subcategories: ["Shoulder bags", "Totes", "Mini bags"],
      visible: true
    },
    {
      name: "Wall hanging with mirror",
      icon: "Mirror",
      description: "Mirror-led wall statements.",
      subcategories: ["Round mirror", "Sunburst", "Entryway"],
      visible: true
    },
    {
      name: "Wall hanging without mirror",
      icon: "Wall",
      description: "Soft textile wall art.",
      subcategories: ["Large wall art", "Mini wall art", "Boho panels"],
      visible: true
    },
    {
      name: "Runner",
      icon: "Run",
      description: "Table and console runners.",
      subcategories: ["Table runner", "Console runner"],
      visible: true
    },
    {
      name: "Pot hanger",
      icon: "Plant",
      description: "Macrame holders for plants.",
      subcategories: ["Single pot", "Double pot", "Balcony"],
      visible: true
    },
    {
      name: "Key Chains",
      icon: "Key",
      description: "Small gifting accessories.",
      subcategories: ["Mini knots", "Name tags", "Bag charms"],
      visible: true
    },
    {
      name: "Dinner Mat",
      icon: "Mat",
      description: "Dining table mats.",
      subcategories: ["Pair", "Set of four", "Round mats"],
      visible: true
    },
    {
      name: "Coaster",
      icon: "Cup",
      description: "Handmade coaster sets.",
      subcategories: ["Set of four", "Round coasters", "Fringe coasters"],
      visible: true
    },
    {
      name: "Pocket Organiser",
      icon: "Pocket",
      description: "Wall storage and organisers.",
      subcategories: ["Two pocket", "Three pocket", "Entryway"],
      visible: true
    },
    {
      name: "Lamp Shade",
      icon: "Lamp",
      description: "Warm woven lighting accents.",
      subcategories: ["Pendant shade", "Table shade"],
      visible: true
    }
  ]
};

function withDefaultCategorySubcategories(settings: typeof defaultSettings) {
  const defaultCategoryMap = new Map(defaultSettings.categories.map((category) => [category.name, category]));

  return {
    ...settings,
    categories: (settings.categories?.length ? settings.categories : defaultSettings.categories).map((category) => {
      const fallback = defaultCategoryMap.get(category.name);
      return {
        ...category,
        icon: category.icon || fallback?.icon || "",
        description: category.description || fallback?.description || "",
        subcategories: category.subcategories?.length ? category.subcategories : fallback?.subcategories ?? [],
        visible: category.visible ?? true
      };
    })
  };
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return ok({ settings: withDefaultCategorySubcategories(defaultSettings), fallback: true }, "Settings loaded.");
    }

    const supabase = getSupabaseAdmin();
    const { data: settings, error } = await supabase
      .from("settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    const normalizedSettings = normalizeSupabaseSettings(settings, defaultSettings);
    return ok(
      { settings: withDefaultCategorySubcategories(normalizedSettings as typeof defaultSettings), fallback: !settings },
      "Settings loaded."
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load settings.");
  }
}

export async function PUT(request: Request) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = await request.json();
    const supabase = getSupabaseAdmin();
    const { data: existing, error: lookupError } = await supabase
      .from("settings")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) throw lookupError;

    const settingsPayload = settingsPayloadToSupabase(payload);
    const requestBuilder = existing
      ? supabase.from("settings").update(settingsPayload).eq("id", existing.id)
      : supabase.from("settings").insert(settingsPayload);
    const { data: settings, error } = await requestBuilder.select("*").single();

    if (error) throw error;
    return ok({ settings: normalizeSupabaseSettings(settings, defaultSettings) }, "Settings updated.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update settings.");
  }
}
