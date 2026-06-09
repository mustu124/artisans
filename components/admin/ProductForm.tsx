"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PRODUCT_CATEGORIES, slugifyProductName, type ProductCategory, type StoreProduct } from "@/lib/product-data";
import { adminFetch } from "@/lib/admin-client";
import { getDisplayMediaUrl } from "@/lib/media";

type ProductDraft = Partial<StoreProduct> & {
  tagsInput?: string;
};

type CategorySetting = {
  name: string;
  subcategories?: string[];
};

const blankProduct: ProductDraft = {
  name: "",
  slug: "",
  category: "Handbag",
  subcategory: "",
  description: "",
  price: 0,
  originalPrice: 0,
  images: [],
  videoUrl: "",
  dimensions: "",
  careInstructions: "",
  shippingInfo: "",
  tagsInput: "",
  isFeatured: false,
  inStock: true,
  stockCount: 0
};

export function ProductForm({ product }: { product?: StoreProduct }) {
  const storageKey = `artisan-root-product-draft-${product?.slug ?? "new"}`;
  const [form, setForm] = useState<ProductDraft>(() => {
    if (product) {
      return { ...product, tagsInput: product.tags?.join(", ") ?? "" };
    }
    return blankProduct;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [categorySettings, setCategorySettings] = useState<CategorySetting[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored && !product) setForm(JSON.parse(stored) as ProductDraft);
  }, [product, storageKey]);

  useEffect(() => {
    adminFetch<{ settings: { categories?: CategorySetting[] } }>("/api/settings")
      .then((res) => setCategorySettings(res.data.settings.categories ?? []))
      .catch(() => setCategorySettings([]));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(form));
  }, [form, storageKey]);

  const slug = useMemo(() => slugifyProductName(form.name ?? ""), [form.name]);
  const availableSubcategories = useMemo(() => {
    return categorySettings.find((category) => category.name === form.category)?.subcategories ?? [];
  }, [categorySettings, form.category]);

  useEffect(() => {
    if (!availableSubcategories.length || form.subcategory) return;
    setForm((current) => ({ ...current, subcategory: availableSubcategories[0] }));
  }, [availableSubcategories, form.subcategory]);

  const update = (key: keyof ProductDraft, value: unknown) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateCategory = (category: ProductCategory) => {
    const nextSubcategories = categorySettings.find((item) => item.name === category)?.subcategories ?? [];
    setForm((current) => ({
      ...current,
      category,
      subcategory: nextSubcategories.includes(current.subcategory ?? "") ? current.subcategory : nextSubcategories[0] ?? ""
    }));
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      setUploading(file.name);

      try {
        const result = await adminFetch<{ url: string; publicId: string }>("/api/upload", {
          method: "POST",
          body
        });
        setForm((current) => ({
          ...current,
          images: [
            ...(current.images ?? []),
            { url: result.data.url, publicId: result.data.publicId, alt: current.name ?? "Product image" }
          ]
        }));
        toast.success(`${file.name} uploaded`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading("");
      }
    }
  };

  const save = async (publish: boolean) => {
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slug,
        active: publish,
        featured: Boolean(form.isFeatured),
        tags: form.tagsInput?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? []
      };
      const url = product ? `/api/products/${product.slug}` : "/api/products";
      const method = product ? "PUT" : "POST";
      await adminFetch(url, { method, body: JSON.stringify(payload) });
      window.localStorage.removeItem(storageKey);
      toast.success(publish ? "Product published" : "Draft saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const images = form.images ?? [];
    const oldIndex = images.findIndex((image) => image.url === active.id);
    const newIndex = images.findIndex((image) => image.url === over.id);
    update("images", arrayMove(images, oldIndex, newIndex));
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <input value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} className="field-input" />
          </Field>
          <Field label="Slug">
            <input value={form.slug || slug} onChange={(e) => update("slug", e.target.value)} className="field-input" />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => updateCategory(e.target.value as ProductCategory)} className="field-input">
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </Field>
          <Field label="Subcategory">
            {availableSubcategories.length ? (
              <select value={form.subcategory ?? ""} onChange={(e) => update("subcategory", e.target.value)} className="field-input">
                <option value="">No subcategory</option>
                {availableSubcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            ) : (
              <input value={form.subcategory ?? ""} onChange={(e) => update("subcategory", e.target.value)} className="field-input" placeholder="Add subcategories in Admin > Categories" />
            )}
          </Field>
          <Field label="Price">
            <input type="number" value={form.price ?? 0} onChange={(e) => update("price", Number(e.target.value))} className="field-input" />
          </Field>
          <Field label="Original Price">
            <input type="number" value={form.originalPrice ?? 0} onChange={(e) => update("originalPrice", Number(e.target.value))} className="field-input" />
          </Field>
          <Field label="Stock Count">
            <input type="number" value={form.stockCount ?? 0} onChange={(e) => update("stockCount", Number(e.target.value))} className="field-input" />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            value={form.description ?? ""}
            onChange={(event) => update("description", event.target.value)}
            className="field-input min-h-40 resize-y"
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Dimensions">
            <textarea value={form.dimensions ?? ""} onChange={(e) => update("dimensions", e.target.value)} className="field-input min-h-24" />
          </Field>
          <Field label="Care Instructions">
            <textarea value={form.careInstructions ?? ""} onChange={(e) => update("careInstructions", e.target.value)} className="field-input min-h-24" />
          </Field>
          <Field label="Shipping Info">
            <textarea value={form.shippingInfo ?? ""} onChange={(e) => update("shippingInfo", e.target.value)} className="field-input min-h-24" />
          </Field>
          <Field label="Tags">
            <input value={form.tagsInput ?? ""} onChange={(e) => update("tagsInput", e.target.value)} className="field-input" placeholder="wall, cotton, gift" />
          </Field>
        </div>
        <Field label="Video URL">
          <input value={form.videoUrl ?? ""} onChange={(e) => update("videoUrl", e.target.value)} className="field-input" />
        </Field>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={Boolean(form.isFeatured)} onChange={(e) => update("isFeatured", e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={Boolean(form.inStock)} onChange={(e) => update("inStock", e.target.checked)} /> In Stock</label>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-heading text-2xl font-bold">Images</h2>
        <label className="mt-4 flex min-h-36 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-artisan-brown/20 bg-artisan-cream p-6 text-center font-bold">
          <input type="file" multiple accept="image/*,video/mp4" onChange={(e) => uploadFiles(e.target.files)} className="hidden" />
          {uploading ? `Uploading ${uploading}...` : "Drag images here or click to upload"}
        </label>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={(form.images ?? []).map((image) => image.url)} strategy={rectSortingStrategy}>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
              {(form.images ?? []).map((image, index) => (
                <SortableImage
                  key={image.url}
                  image={image}
                  index={index}
                  onDelete={() => update("images", (form.images ?? []).filter((item) => item.url !== image.url))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" disabled={isSaving} onClick={() => save(false)} className="rounded-full border border-artisan-brown px-6 py-3 font-black">Save Draft</button>
        <button type="button" disabled={isSaving} onClick={() => save(true)} className="rounded-full bg-artisan-terracotta px-6 py-3 font-black text-white">Publish</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-bold text-artisan-brown">{label}{children}</label>;
}

function SortableImage({
  image,
  index,
  onDelete
}: {
  image: { url: string; alt?: string };
  index: number;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.url });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="relative aspect-square overflow-hidden rounded-xl bg-artisan-sand">
      <Image src={getDisplayMediaUrl(image.url)} alt={image.alt ?? "Product image"} fill className="object-cover" {...attributes} {...listeners} />
      {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-artisan-brown px-2 py-1 text-xs font-black text-white">Main</span>}
      <button type="button" onClick={onDelete} className="absolute right-2 top-2 rounded-full bg-red-700 px-2 py-1 text-xs font-black text-white">Delete</button>
    </div>
  );
}
