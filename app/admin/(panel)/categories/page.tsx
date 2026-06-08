"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AdminSection } from "@/components/admin/AdminCards";
import { adminFetch } from "@/lib/admin-client";
import { PRODUCT_CATEGORIES } from "@/lib/product-data";

type CategorySetting = {
  name: string;
  icon?: string;
  description?: string;
  subcategories?: string[];
  subcategoriesInput?: string;
  visible?: boolean;
};

const defaultIcons = ["Bag", "Mirror", "Wall", "Run", "Plant", "Key", "Mat", "Cup", "Pocket", "Lamp"];

const defaultCategories: CategorySetting[] = PRODUCT_CATEGORIES.map((name, index) => ({
  name,
  icon: defaultIcons[index],
  description: "",
  subcategories: [],
  subcategoriesInput: "",
  visible: true
}));

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategorySetting[]>(defaultCategories);
  const [baseSettings, setBaseSettings] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const storageKey = "artisan-root-categories-draft";

  useEffect(() => {
    adminFetch<{ settings: Record<string, unknown> & { categories?: CategorySetting[] } }>("/api/settings")
      .then((res) => {
        setBaseSettings(res.data.settings);
        setCategories(
          (res.data.settings.categories?.length ? res.data.settings.categories : defaultCategories).map((category) => ({
            ...category,
            subcategoriesInput: category.subcategories?.join(", ") ?? ""
          }))
        );

        const draft = window.localStorage.getItem(storageKey);
        if (draft) {
          setCategories(JSON.parse(draft) as CategorySetting[]);
          toast("Unsaved category draft restored.");
        }
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  const visibleCount = useMemo(() => categories.filter((category) => category.visible !== false).length, [categories]);

  useEffect(() => {
    if (!isLoading) window.localStorage.setItem(storageKey, JSON.stringify(categories));
  }, [categories, isLoading]);

  const update = (index: number, key: keyof CategorySetting, value: string | boolean) => {
    setCategories((current) => current.map((category, currentIndex) => (currentIndex === index ? { ...category, [key]: value } : category)));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const payloadCategories = categories.map(({ subcategoriesInput, ...category }) => ({
        ...category,
        subcategories: (subcategoriesInput ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      }));

      await adminFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify({ ...baseSettings, categories: payloadCategories })
      });
      window.localStorage.removeItem(storageKey);
      toast.success("Categories saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-artisan-sage">Catalog</p>
          <h1 className="font-heading text-4xl font-bold text-artisan-brown">Categories</h1>
          <p className="mt-1 text-sm text-stone-500">{visibleCount} visible categories in navigation and storefront modules.</p>
        </div>
        <button disabled={isSaving || isLoading} onClick={save} className="rounded-full bg-artisan-terracotta px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:opacity-60">
          {isSaving ? "Saving..." : "Save Categories"}
        </button>
      </div>

      <AdminSection title="Category Manager" description="Edit display labels, short icons, descriptions, and storefront visibility.">
        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-artisan-cream" />)}
          </div>
        ) : (
          <div className="grid gap-3">
            {categories.map((category, index) => (
              <div key={`${category.name}-${index}`} className="grid gap-3 rounded-2xl border border-artisan-brown/10 bg-artisan-cream p-4 md:grid-cols-[120px_1fr_1.4fr_1.2fr_120px] md:items-center">
                <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-artisan-sage">
                  Icon / emoji
                  <input value={category.icon ?? ""} onChange={(event) => update(index, "icon", event.target.value)} className="field-input bg-white" />
                </label>
                <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-artisan-sage">
                  Name
                  <input value={category.name} onChange={(event) => update(index, "name", event.target.value)} className="field-input bg-white" />
                </label>
                <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-artisan-sage">
                  Description
                  <input value={category.description ?? ""} onChange={(event) => update(index, "description", event.target.value)} className="field-input bg-white" />
                </label>
                <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-artisan-sage">
                  Subcategories
                  <input value={category.subcategoriesInput ?? ""} onChange={(event) => update(index, "subcategoriesInput", event.target.value)} className="field-input bg-white" placeholder="Comma separated" />
                </label>
                <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-black text-artisan-brown">
                  <input type="checkbox" checked={category.visible !== false} onChange={(event) => update(index, "visible", event.target.checked)} />
                  Visible
                </label>
              </div>
            ))}
          </div>
        )}
      </AdminSection>
    </div>
  );
}
