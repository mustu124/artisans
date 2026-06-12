"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductCard, QuickViewModal } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getDisplayMediaUrl } from "@/lib/media";
import type { StoreProduct } from "@/lib/product-data";

type ProductResponse = {
  success?: boolean;
  data?: {
    product: StoreProduct | null;
  };
  product?: StoreProduct | null;
};

type ProductsResponse = {
  data?: {
    products: StoreProduct[];
  };
  products?: StoreProduct[];
};

function optimizedMediaUrl(src: string, width = 1100) {
  return getDisplayMediaUrl(src);
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<StoreProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState("Full Description");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/products/${params.slug}`)
      .then((response) => response.json())
      .then((data: ProductResponse) => {
        const nextProduct = data.data?.product ?? data.product;
        if (!isMounted || !nextProduct) return;
        setProduct(nextProduct);
        setSelectedVariant(nextProduct.variants?.[0] ?? "");
      })
      .catch(() => setProduct(null));

    return () => {
      isMounted = false;
    };
  }, [params.slug]);

  useEffect(() => {
    if (!product) return;

    fetch(
      `/api/products?category=${encodeURIComponent(product.category)}&limit=8&exclude=${encodeURIComponent(
        product._id
      )}`
    )
      .then((response) => response.json())
      .then((data: ProductsResponse) => setRelatedProducts(data.data?.products ?? data.products ?? []))
      .catch(() => setRelatedProducts([]));
  }, [product]);

  const galleryItems = useMemo(() => {
    if (!product) return [];
    return [
      ...product.images.map((image) => ({ type: "image" as const, url: image.url, alt: image.alt })),
      ...(product.videoUrl ? [{ type: "video" as const, url: product.videoUrl, alt: product.name }] : [])
    ];
  }, [product]);

  const goToImage = (index: number) => {
    setSelectedImage((index + galleryItems.length) % galleryItems.length);
  };

  const currentItem = galleryItems[selectedImage];
  const savings =
    product?.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  if (!product) {
    return (
      <main className="min-h-screen bg-artisan-cream px-6 pt-32">
        <div className="mx-auto flex max-w-7xl justify-center rounded-2xl bg-white p-10 shadow-soft">
          <LoadingSpinner label="Loading product" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-artisan-cream pb-20 pt-28">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[3fr_2fr]">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-artisan-sand shadow-soft">
            <AnimatePresence mode="wait">
              {currentItem?.type === "video" ? (
                <motion.iframe
                  key={currentItem.url}
                  title={`${product.name} video`}
                  src={currentItem.url}
                  className="aspect-[4/5] w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <motion.button
                  key={currentItem?.url}
                  type="button"
                  aria-label="Open product image lightbox"
                  onClick={() => setIsLightboxOpen(true)}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) goToImage(selectedImage + 1);
                    if (info.offset.x > 80) goToImage(selectedImage - 1);
                  }}
                  className="relative block aspect-[4/5] w-full"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.38 }}
                >
                  <Image
                    src={currentItem?.url ? optimizedMediaUrl(currentItem.url, 1300) : "/logo.png"}
                    alt={currentItem?.alt ?? product.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    quality={82}
                    className="object-cover"
                  />
                  <span className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur md:hidden">
                    Pinch to zoom
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            <GalleryArrow label="Previous image" onClick={() => goToImage(selectedImage - 1)} side="left" />
            <GalleryArrow label="Next image" onClick={() => goToImage(selectedImage + 1)} side="right" />
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {galleryItems.map((item, index) => (
              <motion.button
                key={`${item.url}-${index}`}
                type="button"
                aria-label={`View ${item.type} ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                whileHover={{ y: -2 }}
                className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                  selectedImage === index ? "border-artisan-terracotta" : "border-transparent"
                }`}
              >
                {item.type === "video" ? (
                  <span className="flex h-full w-full items-center justify-center bg-artisan-brown text-xl text-white">
                    ▶
                  </span>
                ) : (
                  <Image src={optimizedMediaUrl(item.url, 220)} alt={item.alt ?? product.name} fill sizes="80px" loading="lazy" quality={72} className="object-cover" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          className="rounded-2xl bg-white p-5 shadow-soft md:p-8"
        >
          <nav className="text-xs font-bold uppercase tracking-[0.12em] text-artisan-sage">
            <Link href="/">Home</Link> <span>/</span> <Link href="/shop">Shop</Link> <span>/</span>{" "}
            <Link href={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>{" "}
            <span>/</span> <span>{product.name}</span>
          </nav>

          <h1 className="mt-5 font-heading text-[28px] font-bold leading-tight text-artisan-brown md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-black text-artisan-terracotta">
              {"\u20B9"}{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && (
              <span className="text-lg font-bold text-stone-400 line-through">
                {"\u20B9"}{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
            {savings > 0 && (
              <span className="rounded-full bg-artisan-gold/20 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-artisan-brown">
                Save {"\u20B9"}{savings.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-artisan-gold">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index}>{index < Math.round(product.rating.average) ? "★" : "☆"}</span>
            ))}
            <span className="ml-2 text-sm font-bold text-stone-600">
              {product.rating.average.toFixed(1)}
            </span>
          </div>

          <p className="mt-5 line-clamp-3 leading-7 text-stone-700">{product.description}</p>

          {product.variants && product.variants.length > 0 && (
            <div className="mt-7">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-artisan-sage">Size / Variant</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-artisan-terracotta ${
                      selectedVariant === variant
                        ? "border-artisan-terracotta bg-artisan-terracotta text-white"
                        : "border-artisan-brown/15 text-artisan-brown"
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-artisan-brown/15">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-11 w-11 font-black">
                -
              </button>
              <span className="w-10 text-center font-black">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => value + 1)} className="h-11 w-11 font-black">
                +
              </button>
            </div>
            <span className="text-sm font-bold text-artisan-sage">
              {product.inStock ? `${product.stockCount} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              animate={{ backgroundColor: isAdded ? "#1fa855" : "#c4714a" }}
              onClick={() => {
                addItem(product, quantity, selectedVariant);
                setIsAdded(true);
                window.setTimeout(() => setIsAdded(false), 1200);
              }}
              className="rounded-full px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white"
            >
              {isAdded ? "✓ Added!" : "Add to Cart"}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                addItem(product, quantity, selectedVariant);
                window.dispatchEvent(new CustomEvent("artisan-root:start-checkout"));
              }}
              className="rounded-full border border-artisan-brown px-6 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-artisan-brown"
            >
              Buy Now
            </motion.button>
          </div>

          <a
            href={`https://wa.me/910000000000?text=${encodeURIComponent(`I have a question about ${product.name}`)}`}
            className="mt-5 inline-flex font-bold text-artisan-sage underline underline-offset-4"
          >
            Have a question? Ask on WhatsApp
          </a>

          <div className="mt-7 divide-y divide-artisan-brown/10 border-y border-artisan-brown/10">
            {[
              ["Full Description", product.description],
              ["Dimensions & Care", `${product.dimensions ?? ""}\n${product.careInstructions ?? ""}`],
              ["Shipping Info", product.shippingInfo ?? "Ships from India with careful packaging."]
            ].map(([title, body]) => (
              <div key={title}>
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === title ? "" : title)}
                  className="flex w-full items-center justify-between py-4 text-left font-heading text-lg font-bold text-artisan-brown"
                >
                  {title}
                  <motion.span animate={{ rotate: openSection === title ? 180 : 0 }}>⌄</motion.span>
                </button>
                <AnimatePresence>
                  {openSection === title && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden whitespace-pre-line pb-4 leading-7 text-stone-700"
                    >
                      {body}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-artisan-sage">Share</span>
            <ShareLink href={`https://wa.me/?text=${encodeURIComponent(product.name)}`}>WhatsApp</ShareLink>
            <ShareLink href="https://www.instagram.com/">Instagram</ShareLink>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="rounded-full bg-artisan-cream px-4 py-2 text-sm font-bold text-artisan-brown"
            >
              Copy Link
            </button>
          </div>
        </motion.div>
      </section>

      <MoreLikeThisSection
        products={relatedProducts}
        onQuickView={setQuickViewProduct}
      />
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      <Lightbox
        isOpen={isLightboxOpen}
        imageUrl={currentItem?.type === "image" ? currentItem.url : ""}
        alt={currentItem?.alt ?? product.name}
        onClose={() => setIsLightboxOpen(false)}
      />
    </main>
  );
}

function GalleryArrow({ label, onClick, side }: { label: string; onClick: () => void; side: "left" | "right" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/86 text-2xl text-artisan-brown shadow-sm backdrop-blur ${
        side === "left" ? "left-4" : "right-4"
      }`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}

function ShareLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-full bg-artisan-cream px-4 py-2 text-sm font-bold text-artisan-brown"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

function MoreLikeThisSection({
  products,
  onQuickView
}: {
  products: StoreProduct[];
  onQuickView: (product: StoreProduct) => void;
}) {
  if (products.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="mx-auto mt-16 max-w-7xl px-4 md:px-8"
    >
      <h2 className="font-heading text-4xl font-bold text-artisan-brown">More Like This</h2>
      <div className="mt-8 flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible">
        {products.map((product) => (
          <div key={product._id} className="w-64 shrink-0 md:w-auto">
            <ProductCard product={product} onQuickView={onQuickView} onMoreLikeThis={() => undefined} />
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function Lightbox({
  isOpen,
  imageUrl,
  alt,
  onClose
}: {
  isOpen: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full bg-white px-4 py-2 font-black text-artisan-brown"
          >
            Close
          </button>
          <motion.div
            className="relative h-[84vh] w-full max-w-4xl"
            initial={{ scale: 0.94 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.94 }}
          >
            <Image src={optimizedMediaUrl(imageUrl, 1600)} alt={alt} fill sizes="92vw" quality={84} className="object-contain" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
