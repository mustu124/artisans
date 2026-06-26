"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AdminSection, ConfirmButton } from "@/components/admin/AdminCards";
import { adminFetch } from "@/lib/admin-client";
import { getDisplayMediaUrl } from "@/lib/media";
import type { GalleryItem } from "@/lib/gallery-data";
import { PRODUCT_CATEGORIES } from "@/lib/product-data";

const galleryCategories = [
  ...PRODUCT_CATEGORIES,
  "Lifestyle",
  "Wall Hangings",
  "Runners",
  "Pot Hangers",
  "Dinner Mats",
  "Coasters",
  "Videos"
].filter((category, index, categories) => categories.indexOf(category) === index);

type GalleryDraft = {
  url: string;
  thumbnailUrl: string;
  caption: string;
  category: string;
  type: "image" | "video";
};

const emptyDraft: GalleryDraft = {
  url: "",
  thumbnailUrl: "",
  caption: "",
  category: "Lifestyle",
  type: "image"
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [draft, setDraft] = useState<GalleryDraft>(emptyDraft);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));
  const storageKey = "artisan-root-gallery-draft";

  const load = () =>
    adminFetch<{ items: GalleryItem[] }>("/api/gallery?limit=100")
      .then((res) => setItems(res.data.items))
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) setDraft(JSON.parse(stored) as GalleryDraft);
    load();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft]);

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    return items.filter((item) => {
      if (filter && item.category !== filter) return false;
      if (normalizedSearch && ![item.caption, item.category, item.type].join(" ").toLowerCase().includes(normalizedSearch)) return false;
      return true;
    });
  }, [filter, items, search]);

  const updateDraft = (key: keyof GalleryDraft, value: string) => {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === "url") {
        const isVideo = value.includes("youtube") || value.includes("youtu.be") || value.endsWith(".mp4");
        next.type = isVideo ? "video" : "image";
        if (!next.thumbnailUrl) next.thumbnailUrl = value;
      }
      return next;
    });
  };

  const uploadFile = async (file?: File) => {
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    setUploading(true);
    try {
      const result = await adminFetch<{ url: string }>("/api/upload", { method: "POST", body });
      setDraft((current) => ({
        ...current,
        url: result.data.url,
        thumbnailUrl: result.data.url,
        type: file.type.startsWith("video") ? "video" : "image"
      }));
      toast.success("Media uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addItem = async () => {
    if (!draft.url || !draft.caption) {
      toast.error("Add a media URL and caption first");
      return;
    }
    setIsSaving(true);
    try {
      await adminFetch("/api/gallery", {
        method: "POST",
        body: JSON.stringify({
          ...draft,
          thumbnailUrl: draft.thumbnailUrl || draft.url,
          order: items.length + 1
        })
      });
      toast.success("Gallery item added");
      setDraft(emptyDraft);
      window.localStorage.removeItem(storageKey);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Add failed");
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (id: string) => {
    await adminFetch(`/api/gallery/${id}`, { method: "DELETE" });
    toast.success("Gallery item deleted");
    load();
  };

  const onDragEnd = async (event: DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = items.findIndex((item) => item._id === event.active.id);
    const newIndex = items.findIndex((item) => item._id === event.over?.id);
    const next = arrayMove(items, oldIndex, newIndex).map((item, index) => ({ ...item, order: index + 1 }));
    setItems(next);
    await adminFetch("/api/gallery/reorder", {
      method: "POST",
      body: JSON.stringify(next.map((item) => ({ id: item._id, order: item.order })))
    });
    toast.success("Gallery reordered");
  };

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-artisan-sage">Media</p>
        <h1 className="font-heading text-4xl font-bold text-artisan-brown">Gallery</h1>
      </div>

      <AdminSection title="Add Gallery Item" description="Upload an image/video or paste a YouTube URL. Drafts are saved locally while you work.">
        <div className="grid gap-4">
          <label className="flex min-h-32 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-artisan-brown/20 bg-artisan-cream p-5 text-center font-black text-artisan-brown">
            <input type="file" accept="image/*,video/mp4" onChange={(event) => uploadFile(event.target.files?.[0])} className="hidden" />
            {uploading ? "Uploading media..." : "Click to upload image or mp4"}
          </label>
          <div className="grid gap-3 md:grid-cols-5">
            <input value={draft.url} onChange={(event) => updateDraft("url", event.target.value)} className="field-input md:col-span-2" placeholder="Image, mp4, or YouTube URL" />
            <input value={draft.caption} onChange={(event) => updateDraft("caption", event.target.value)} className="field-input" placeholder="Caption" />
            <select value={draft.category} onChange={(event) => updateDraft("category", event.target.value)} className="field-input">
              {galleryCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <select value={draft.type} onChange={(event) => updateDraft("type", event.target.value)} className="field-input">
              <option value="image">image</option>
              <option value="video">video</option>
            </select>
            <input value={draft.thumbnailUrl} onChange={(event) => updateDraft("thumbnailUrl", event.target.value)} className="field-input md:col-span-4" placeholder="Thumbnail URL for video, optional for images" />
            <button disabled={isSaving} onClick={addItem} className="rounded-full bg-artisan-terracotta px-4 py-3 font-black text-white disabled:opacity-60">
              {isSaving ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </AdminSection>

      <AdminSection
        title="Gallery Items"
        description="Drag to reorder. Filtering only changes the view, not the saved order."
        action={
          <div className="flex flex-col gap-2 md:flex-row">
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="field-input md:w-56" placeholder="Search gallery" />
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="field-input md:w-56">
              <option value="">All categories</option>
              {galleryCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
        }
      >
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl bg-artisan-cream" />)}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((item) => item._id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {visibleItems.map((item) => <SortableGalleryItem key={item._id} item={item} onDelete={() => remove(item._id)} />)}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </AdminSection>
    </div>
  );
}

function SortableGalleryItem({ item, onDelete }: { item: GalleryItem; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item._id });
  const imageSrc = item.thumbnailUrl || item.url;
  const productHref = item.productSlug ? `/shop/${encodeURIComponent(item.productSlug)}` : "";
  const editProductHref = item.productSlug ? `/admin/products/${encodeURIComponent(item.productSlug)}/edit` : "";

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="relative overflow-hidden rounded-2xl border border-artisan-brown/10 bg-artisan-sand">
      <div className="relative h-52 w-full overflow-hidden bg-artisan-cream">
        <Image src={getDisplayMediaUrl(imageSrc)} alt={item.caption || "Gallery item"} fill className="object-cover" />
        {item.type === "video" && <span className="absolute left-2 top-2 rounded-full bg-artisan-brown px-2 py-1 text-xs font-black text-white">Video</span>}
      </div>
      <div className="grid gap-2 p-3">
        <p className="font-bold text-artisan-brown">{item.productName || item.caption}</p>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-artisan-sage">{item.category}</p>
        {item.productSlug ? (
          <div className="flex flex-wrap gap-2">
            <Link href={editProductHref} className="rounded-full border border-artisan-brown/20 px-3 py-1 text-xs font-black text-artisan-brown">
              Edit product
            </Link>
            <Link href={productHref} className="rounded-full bg-artisan-terracotta px-3 py-1 text-xs font-black text-white">
              View product
            </Link>
          </div>
        ) : (
          <div className="flex gap-2">
            <button type="button" {...attributes} {...listeners} className="rounded-full border border-artisan-brown/20 px-3 py-1 text-xs font-black text-artisan-brown">
              Drag
            </button>
            <ConfirmButton message="Delete this gallery item?" onConfirm={onDelete} className="rounded-full bg-red-700 px-3 py-1 text-xs font-black text-white">
              Delete
            </ConfirmButton>
          </div>
        )}
      </div>
    </div>
  );
}
