"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { LogoLoadingScreen } from "@/components/LogoLoadingScreen";
import type { GalleryItem } from "@/lib/gallery-data";

const filters = [
  "All",
  "Handbag",
  "Wall Hangings",
  "Runners",
  "Pot Hangers",
  "Key Chains",
  "Dinner Mats",
  "Coasters",
  "Lifestyle",
  "Videos"
];

type GalleryResponse = {
  success?: boolean;
  data?: {
    items: GalleryItem[];
    hasMore: boolean;
  };
  items?: GalleryItem[];
  hasMore?: boolean;
};

function optimizedMediaUrl(src: string, width = 800) {
  if (src.includes("res.cloudinary.com") && src.includes("/image/upload/") && !src.includes("/f_auto,")) {
    return src.replace("/image/upload/", `/image/upload/f_auto,q_auto:good,w_${width},c_limit/`);
  }

  return src;
}

export default function CollectionsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const loadItems = useCallback(async () => {
    if (page === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      category: activeFilter
    });
    const response = await fetch(`/api/gallery?${params.toString()}`);
    const data = (await response.json()) as GalleryResponse;
    const payload = data.data ?? data;
    const nextItems = payload.items ?? [];

    setItems((current) => (page === 1 ? nextItems : [...current, ...nextItems]));
    setHasMore(Boolean(payload.hasMore));
    setIsLoading(false);
    setIsLoadingMore(false);
  }, [activeFilter, page]);

  useEffect(() => {
    loadItems().catch(() => {
      setItems([]);
      setHasMore(false);
      setIsLoading(false);
      setIsLoadingMore(false);
    });
  }, [loadItems]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  const openLightbox = (item: GalleryItem) => {
    setLightboxIndex(items.findIndex((candidate) => candidate._id === item._id));
  };

  return (
    <main className="min-h-screen bg-artisan-cream pb-20">
      <section className="relative flex min-h-[420px] items-center overflow-hidden bg-artisan-brown px-6 pt-24 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(92,45,10,0.9),rgba(196,113,74,0.58)),url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2200&q=85')] bg-cover bg-center" />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mx-auto w-full max-w-7xl"
        >
          <p className="text-sm font-black uppercase tracking-[0.22em] text-artisan-sand">
            Artisan Root Gallery
          </p>
          <h1 className="mt-4 font-heading text-5xl font-bold md:text-7xl">Product Collections</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/86">
            Explore product collections from our gallery
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-20 z-20 -mx-4 overflow-x-auto border-y border-artisan-brown/10 bg-artisan-cream/90 px-4 py-4 backdrop-blur md:-mx-8 md:px-8"
        >
          <div className="flex min-w-max gap-2">
            {filters.map((filter) => (
              <motion.button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`rounded-full px-5 py-2 text-sm font-black uppercase tracking-[0.12em] transition focus:outline-none focus:ring-2 focus:ring-artisan-terracotta ${
                  activeFilter === filter
                    ? "bg-artisan-terracotta text-white"
                    : "bg-white text-artisan-brown shadow-sm"
                }`}
              >
                {filter}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <CollectionsLoader />
        ) : (
          <motion.div layout className="mt-10 columns-2 gap-4 md:columns-3 xl:columns-5">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <GalleryTile key={item._id} item={item} onClick={() => openLightbox(item)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {hasMore && (
          <div className="mt-12 text-center">
            <motion.button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={isLoadingMore}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full bg-artisan-brown px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-white disabled:opacity-60"
            >
              {isLoadingMore ? "Loading..." : "Load More"}
            </motion.button>
          </div>
        )}
      </section>

      <Lightbox
        items={items}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </main>
  );
}

function GalleryTile({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const heightSeed = item.order ?? 1;
  const thumbnailSrc = item.type === "video" ? item.thumbnailUrl || "/logo.png" : item.thumbnailUrl || item.url;
  const optimizedThumbnail = thumbnailSrc === "/logo.png" ? thumbnailSrc : optimizedMediaUrl(thumbnailSrc, 720);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [optimizedThumbnail]);

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      onClick={onClick}
      className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-artisan-sand text-left shadow-[0_16px_40px_rgba(92,45,10,0.12)] focus:outline-none focus:ring-2 focus:ring-artisan-terracotta"
    >
      <Image
        src={optimizedThumbnail}
        alt={item.caption || "Artisan Root gallery media"}
        width={640}
        height={heightSeed % 3 === 0 ? 820 : heightSeed % 3 === 1 ? 520 : 700}
        sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 50vw"
        loading="lazy"
        quality={78}
        onLoad={() => setIsImageLoaded(true)}
        onError={() => setIsImageLoaded(true)}
        className="h-auto w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <AnimatePresence>
        {!isImageLoaded && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center bg-artisan-cream"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="relative h-14 w-14 rounded-2xl bg-white/85 shadow-sm"
              animate={{ scale: [1, 1.05, 1], opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image src="/logo.png" alt="" fill sizes="56px" className="object-contain p-2" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {item.type === "video" && (
        <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-artisan-terracotta text-xl text-white shadow-soft">
          ▶
        </span>
      )}
      <motion.div
        className="absolute inset-0 flex items-end bg-gradient-to-t from-black/76 via-black/20 to-transparent p-4 opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.25 }}
      >
        <motion.div
          initial={{ y: 18 }}
          whileHover={{ y: 0 }}
          className="translate-y-4 transition duration-300 group-hover:translate-y-0"
        >
          <p className="text-xs font-black uppercase tracking-[0.16em] text-artisan-sand">{item.category}</p>
          <p className="mt-1 font-heading text-lg font-bold leading-tight text-white">{item.caption}</p>
        </motion.div>
      </motion.div>
    </motion.button>
  );
}

function Lightbox({
  items,
  activeIndex,
  onClose,
  onNavigate
}: {
  items: GalleryItem[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const item = activeIndex === null ? null : items[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onNavigate((activeIndex - 1 + items.length) % items.length);
      if (event.key === "ArrowRight") onNavigate((activeIndex + 1) % items.length);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, items.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {item && activeIndex !== null && (
        <motion.div
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/95 p-4 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={item.caption}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery lightbox"
            className="absolute right-5 top-5 rounded-full border border-white/20 px-4 py-2 font-black"
          >
            X
          </button>
          <button
            type="button"
            aria-label="Previous gallery item"
            onClick={() => onNavigate((activeIndex - 1 + items.length) % items.length)}
            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next gallery item"
            onClick={() => onNavigate((activeIndex + 1) % items.length)}
            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl"
          >
            ›
          </button>
          <motion.div
            key={item._id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex max-h-[90vh] max-w-6xl flex-col items-center"
          >
            {item.type === "video" ? (
              <iframe
                src={item.url}
                title={item.caption}
                className="aspect-video w-[min(92vw,1100px)] rounded-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Image
                src={optimizedMediaUrl(item.url, 1600)}
                alt={item.caption || "Artisan Root gallery item"}
                width={1400}
                height={1600}
                sizes="92vw"
                quality={84}
                className="max-h-[84vh] max-w-[92vw] rounded-2xl object-contain"
              />
            )}
            <p className="mt-4 max-w-3xl text-center font-heading text-2xl font-bold">{item.caption}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CollectionsLoader() {
  return (
    <LogoLoadingScreen
      label="Loading gallery"
      className="mt-10 min-h-[54vh] rounded-2xl border border-artisan-brown/10 bg-white/55 shadow-[0_18px_60px_rgba(92,45,10,0.08)]"
    />
  );
}
