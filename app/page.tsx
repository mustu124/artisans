"use client";

import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useTransform
} from "framer-motion";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { fadeInScale, fadeInUp, staggerContainer } from "@/lib/animations";
import { getDisplayMediaUrl } from "@/lib/media";

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  images: Array<{
    url: string;
    alt: string;
  }>;
};

type PublicSettings = {
  heroSlides?: Array<{
    image: string;
    title?: string;
    headline?: string;
    name?: string;
    _id?: string;
    id?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
  }>;
  mobileHeroSlides?: Array<{
    image: string;
    title?: string;
    headline?: string;
    name?: string;
    _id?: string;
    id?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
  }>;
  announcementText?: string;
  videoUrl?: string;
  whatsappNumber?: string;
  footerCopyright?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
  };
  categories?: Array<{
    name: string;
    icon?: string;
    visible?: boolean;
  }>;
};

type HeroSlide = {
  image: string;
  headline: string;
  subtitle?: string;
  cta: string;
  href: string;
};

const heroSlides: HeroSlide[] = [
  {
    image: "/logo.png",
    headline: "Handmade warmth for modern homes",
    subtitle: "Premium macrame and craft pieces for slow, soulful spaces.",
    cta: "Shop Now",
    href: "/shop"
  }
];

const blockedHeroImageIds = ["wd0gqn7ea0extspvcimh"];
const fallbackHeroHeadline = "Handmade warmth for modern homes";

const categories = [
  ["Handbag", "👜"],
  ["Wall hanging with mirror", "🪞"],
  ["Wall hanging without mirror", "🧶"],
  ["Runner", "〰️"],
  ["Pot hanger", "🪴"],
  ["Key Chains", "🔑"],
  ["Dinner Mat", "🍽️"],
  ["Coaster", "◌"],
  ["Pocket Organiser", "▦"],
  ["Lamp Shade", "💡"]
] as const;

const testimonials = [
  {
    quote:
      "The wall hanging made our living room feel complete. The knots are neat, weighty, and so beautifully finished.",
    name: "Aarohi Mehta",
    city: "Pune"
  },
  {
    quote:
      "My plant hangers arrived packed with care and looked even better in person. They instantly softened my balcony.",
    name: "Nisha Rao",
    city: "Bengaluru"
  },
  {
    quote:
      "I ordered table runners for a housewarming dinner. Everyone asked where they were from.",
    name: "Mira Kapoor",
    city: "Jaipur"
  }
];

const sectionReveal = { hidden: staggerContainer.hidden, show: staggerContainer.visible };
const itemReveal = { hidden: fadeInUp.hidden, show: fadeInUp.visible };
const scaleReveal = { hidden: fadeInScale.hidden, show: fadeInScale.visible };

function optimizedMediaUrl(src: string, width = 1200) {
  if (src.includes("images.unsplash.com")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", "80");
    url.searchParams.set("auto", "format");
    return url.toString();
  }

  return getDisplayMediaUrl(src);
}

function looksLikeDatabaseId(value?: string) {
  if (!value) return true;
  const normalized = value.trim();
  const compact = normalized.replace(/[\s-]/g, "");

  return (
    /^[a-f\d]{24}$/i.test(compact) ||
    /^[a-f\d]{32}$/i.test(compact) ||
    /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(normalized)
  );
}

function getHeroSlideHeadline(slide: NonNullable<PublicSettings["heroSlides"]>[number]) {
  const candidates = [slide.title, slide.headline, slide.name].filter(Boolean) as string[];
  return candidates.find((candidate) => !looksLikeDatabaseId(candidate)) ?? fallbackHeroHeadline;
}

const frostedTextStyle = {
  background: "rgba(255, 248, 240, 0.52)",
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
  padding: "3px 8px 5px 8px",
  borderRadius: "4px"
} as const;

const subtitleFrostedTextStyle = {
  ...frostedTextStyle,
  background: "rgba(255, 248, 240, 0.40)"
} as const;

export default function HomePage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { data?: { settings?: PublicSettings } }) => {
        if (process.env.NODE_ENV === "development") {
          console.debug("Artisan Root settings response", payload);
        }
        if (isMounted) setSettings(payload.data?.settings ?? null);
      })
      .catch(() => {
        if (isMounted) setSettings(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobileViewport(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const liveHeroSlides = useMemo<HeroSlide[]>(() => {
    const sourceSlides = isMobileViewport && settings?.mobileHeroSlides?.length
      ? settings.mobileHeroSlides
      : settings?.heroSlides;
    const slides = sourceSlides
      ?.filter(
        (slide) =>
          slide.image &&
          !blockedHeroImageIds.some((blockedId) => slide.image.includes(blockedId))
      )
      .map((slide) => ({
        image: slide.image,
        headline: getHeroSlideHeadline(slide),
        subtitle: slide.subtitle,
        cta: slide.ctaText || "Shop Now",
        href: slide.ctaLink || "/shop"
      }));

    return slides?.length ? slides : heroSlides;
  }, [isMobileViewport, settings]);

  const liveCategories = useMemo(() => {
    const nextCategories = settings?.categories
      ?.filter((category) => category.visible !== false)
      .map((category) => [category.name, category.icon || "Craft"] as const);

    return nextCategories?.length ? nextCategories : categories;
  }, [settings]);

  return (
    <main className="overflow-hidden bg-artisan-cream text-stone-900">
      <HeroSlider slides={liveHeroSlides} />
      <AnnouncementTicker text={settings?.announcementText} />
      <CategoriesSection categories={liveCategories} />
      <FeaturedProducts />
      <VideoSection videoUrl={settings?.videoUrl} />
      <TestimonialsSlider />
      <InstagramStrip instagramUrl={settings?.socialLinks?.instagram} />
      <Footer settings={settings} />
    </main>
  );
}

function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [isMobileHero, setIsMobileHero] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobileHero(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const goToSlide = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const currentHeroSrc = optimizedMediaUrl(slides[activeIndex].image, isMobileHero ? 760 : 1500);
  const nextHeroSrc = optimizedMediaUrl(slides[(activeIndex + 1) % slides.length].image, isMobileHero ? 760 : 1500);

  useEffect(() => {
    const nextImage = new window.Image();
    nextImage.decoding = "async";
    nextImage.src = nextHeroSrc;
  }, [nextHeroSrc]);

  return (
    <motion.section
      className="relative min-h-[100svh] overflow-hidden bg-artisan-cream sm:bg-artisan-brown"
      onHoverStart={() => setIsHeroHovered(true)}
      onHoverEnd={() => setIsHeroHovered(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={activeIndex}
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) goToSlide(activeIndex + 1);
            if (info.offset.x > 80) goToSlide(activeIndex - 1);
          }}
          initial={{ opacity: 0, scale: 1.015 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-artisan-cream"
            initial={{ scale: 1 }}
            animate={{ scale: isMobileHero ? 1 : 1.08 }}
            transition={{ duration: 5.2, ease: "easeOut" }}
          >
            <img
              src={currentHeroSrc}
              alt={slides[activeIndex].headline}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="relative z-10 flex min-h-[100svh] items-end bg-transparent px-5 pb-28 pt-24 sm:px-8 sm:pb-28 md:px-12 lg:px-20"
        variants={sectionReveal}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[activeIndex].headline}
            className="max-w-3xl"
            variants={sectionReveal}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -18, transition: { duration: 0.35 } }}
          >
            <motion.p
              variants={itemReveal}
              className="mb-4 uppercase sm:mb-5"
              style={{ color: "#c9973a", fontSize: 11, letterSpacing: "0.18em", fontWeight: 500 }}
            >
              <span style={frostedTextStyle}>Artisan Root</span>
            </motion.p>
            <motion.h1
              variants={itemReveal}
              className="max-w-[15ch] font-heading text-[30px] font-bold leading-[1.18] sm:max-w-3xl sm:text-[44px] sm:leading-[1.15] xl:text-[60px]"
              style={{ color: "#2C0F03" }}
            >
              <span style={frostedTextStyle}>{slides[activeIndex].headline}</span>
            </motion.h1>
            {slides[activeIndex].subtitle && (
              <motion.p
                variants={itemReveal}
                className="mt-4 max-w-[24rem] text-base font-bold leading-8 sm:mt-5 sm:text-lg sm:font-normal sm:leading-9"
                style={{ color: "rgba(44, 15, 3, 0.85)" }}
              >
                <span style={subtitleFrostedTextStyle}>{slides[activeIndex].subtitle}</span>
              </motion.p>
            )}
            <motion.a
              variants={itemReveal}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href={slides[activeIndex].href}
              className="mt-7 inline-flex rounded-full px-7 py-2.5 text-[13px] font-black uppercase tracking-[0.1em] text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] sm:mt-8"
              style={{ background: "#c4714a" }}
            >
              {slides[activeIndex].cta}
            </motion.a>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.button
        type="button"
        aria-label="Previous slide"
        onClick={() => goToSlide(activeIndex - 1)}
        className="absolute left-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/20 text-3xl leading-none text-white opacity-0 backdrop-blur-md md:flex"
        whileHover={{ scale: 1.08, backgroundColor: "rgba(0,0,0,0.42)" }}
        animate={{ opacity: isHeroHovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      >
        ‹
      </motion.button>
      <motion.button
        type="button"
        aria-label="Next slide"
        onClick={() => goToSlide(activeIndex + 1)}
        className="absolute right-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/20 text-3xl leading-none text-white opacity-0 backdrop-blur-md md:flex"
        whileHover={{ scale: 1.08, backgroundColor: "rgba(0,0,0,0.42)" }}
        animate={{ opacity: isHeroHovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      >
        ›
      </motion.button>

      <motion.div
        className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-8 sm:gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {slides.map((slide, index) => (
          <button
            type="button"
            key={slide.headline}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => goToSlide(index)}
            className="relative h-2 w-8 overflow-hidden rounded-full bg-artisan-brown/12 sm:w-10 sm:bg-white/35"
          >
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full bg-artisan-gold"
              initial={false}
              animate={{ width: index === activeIndex ? "100%" : "0%" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </button>
        ))}
      </motion.div>

      <motion.div
        className="absolute bottom-7 right-5 z-20 font-heading text-lg text-artisan-brown sm:bottom-8 sm:right-6 sm:text-xl sm:text-white md:right-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6 }}
      >
        {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </motion.div>
    </motion.section>
  );
}

function AnnouncementTicker({ text }: { text?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const tickerX = useMotionValue(0);
  const x = useTransform(tickerX, (value) => `${value}%`);
  const tickerText =
    text || "Free shipping on orders above \u20B9999 · Handcrafted with love · 100% natural cotton rope · New arrivals every week";

  useAnimationFrame((_, delta) => {
    if (isHovered) return;

    const next = tickerX.get() - delta * 0.004;
    tickerX.set(next <= -50 ? 0 : next);
  });

  return (
    <motion.section
      className="overflow-hidden bg-artisan-brown py-3 text-artisan-cream"
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap text-sm font-black uppercase tracking-[0.16em]"
        style={{ x }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index}>{tickerText}</span>
        ))}
      </motion.div>
    </motion.section>
  );
}

function CategoriesSection({ categories }: { categories: readonly (readonly [string, string])[] }) {
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    fetch("/api/products?limit=50&sort=newest", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { data?: { products?: Product[] } }) => {
        const products = payload.data?.products ?? [];
        const nextImages = products.reduce<Record<string, string>>((images, product) => {
          const imageUrl = product.images?.[0]?.url;
          if (product.category && imageUrl && !images[product.category]) {
            images[product.category] = imageUrl;
          }
          return images;
        }, {});

        if (isMounted) setCategoryImages(nextImages);
      })
      .catch(() => {
        if (isMounted) setCategoryImages({});
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.section
      className="px-4 py-14 sm:px-6 sm:py-[4.5rem] md:px-10 md:py-20"
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={itemReveal} className="mx-auto max-w-7xl text-center">
        <h2 className="font-heading text-[clamp(2rem,10vw,3rem)] font-bold leading-tight text-artisan-brown md:text-5xl">Shop by Category</h2>
        <motion.svg
          width="260"
          height="24"
          viewBox="0 0 260 24"
          fill="none"
          className="mx-auto mt-3 w-48 sm:w-[260px]"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.path
            d="M4 15C45 4 82 22 126 12C168 3 203 18 256 8"
            stroke="#c4714a"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </motion.svg>
      </motion.div>

      <motion.div
        className="mx-auto mt-10 grid max-w-[23rem] grid-cols-3 justify-items-center gap-x-4 gap-y-8 sm:mt-12 sm:max-w-7xl sm:grid-cols-5 sm:gap-x-7 sm:gap-y-9 lg:gap-x-9 xl:max-w-[96rem] xl:grid-cols-10 xl:gap-x-11 xl:gap-y-10"
        variants={sectionReveal}
      >
        {categories.map(([name, icon], index) => (
          <CategoryCircle key={name} name={name} icon={icon} imageUrl={categoryImages[name]} index={index} />
        ))}
      </motion.div>
    </motion.section>
  );
}

function CategoryCircle({
  name,
  icon,
  imageUrl,
  index
}: {
  name: string;
  icon: string;
  imageUrl?: string;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const displayImageUrl = imageUrl ? getDisplayMediaUrl(imageUrl) : "";

  return (
    <motion.a
      href={`/shop?category=${encodeURIComponent(name)}`}
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        show: {
          opacity: 1,
          scale: 1,
          transition: { delay: index * 0.1, duration: 0.55, ease: "easeOut" }
        }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        scale: 1.06
      }}
      whileTap={{ scale: 0.97 }}
      className="group flex w-[clamp(96px,28vw,112px)] flex-col items-center gap-3 text-center sm:w-[128px] xl:w-[138px]"
    >
      <span className="relative flex h-[clamp(92px,27vw,104px)] w-[clamp(92px,27vw,104px)] items-center justify-center rounded-full bg-white shadow-soft transition-shadow duration-200 group-hover:shadow-[0_18px_45px_rgba(196,113,74,0.34)] sm:h-[112px] sm:w-[112px] xl:h-[124px] xl:w-[124px]">
        <motion.span
          className="absolute inset-[-3px] rounded-full border-2 border-dashed border-artisan-terracotta sm:inset-[-6px]"
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{
            duration: 1.2,
            repeat: isHovered ? Infinity : 0,
            ease: "linear"
          }}
        />
        <span className="absolute inset-0 overflow-hidden rounded-full bg-artisan-sand">
          {displayImageUrl ? (
            <motion.img
              src={displayImageUrl}
              alt={`${name} category`}
              loading="lazy"
              animate={{ scale: isHovered ? 1.09 : 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-white text-3xl">{icon}</span>
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-artisan-brown/12 via-transparent to-white/8" />
        </span>
      </span>
      <span className="min-h-[2.4rem] max-w-full text-[10px] font-black uppercase leading-[1.12] tracking-[0.04em] text-artisan-brown sm:text-[11px] xl:text-xs">
        {name}
      </span>
    </motion.a>
  );
}

function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, items } = useCart();

  useEffect(() => {
    let isMounted = true;

    async function loadBestsellers() {
      setIsLoading(true);
      const featuredResponse = await fetch("/api/products?featured=true", { cache: "no-store" });
      const featuredData = (await featuredResponse.json()) as { data?: { products: Product[] }; products?: Product[] };
      let nextProducts = featuredData.data?.products ?? featuredData.products ?? [];

      if (!nextProducts.length) {
        const fallbackResponse = await fetch("/api/products?limit=8&sort=newest", { cache: "no-store" });
        const fallbackData = (await fallbackResponse.json()) as { data?: { products: Product[] }; products?: Product[] };
        nextProducts = fallbackData.data?.products ?? fallbackData.products ?? [];
      }

      if (isMounted) {
        setProducts(nextProducts);
        setIsLoading(false);
      }
    }

    loadBestsellers()
      .catch(() => {
        if (isMounted) {
          setProducts([]);
          setIsLoading(false);
        }
      })

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.section
      className="bg-white px-4 py-16 md:px-10 md:py-20"
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.16 }}
    >
      <motion.div variants={itemReveal} className="mx-auto max-w-7xl text-center">
        <LeafOrnament />
        <h2 className="mt-4 font-heading text-[clamp(2.2rem,12vw,3.2rem)] font-bold leading-none text-artisan-brown md:text-5xl">Our Bestsellers</h2>
      </motion.div>

      <motion.div
        className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 md:gap-6 xl:grid-cols-4"
        variants={sectionReveal}
      >
        {isLoading &&
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl bg-artisan-cream shadow-soft">
              <div className="aspect-[4/5] animate-pulse bg-artisan-sand" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-artisan-sand" />
                <div className="h-7 w-1/2 animate-pulse rounded-full bg-artisan-sand" />
                <div className="h-10 animate-pulse rounded-full bg-artisan-sand" />
              </div>
            </div>
          ))}

        {!isLoading && products.slice(0, 8).map((product) => {
          const cartQuantity = items
            .filter((item) => item.product._id === product._id)
            .reduce((total, item) => total + item.quantity, 0);

          return (
            <motion.article
              key={product._id}
              variants={itemReveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.12 }}
              whileHover={{ y: -6 }}
              className="flex h-full flex-col overflow-hidden rounded-2xl bg-artisan-cream shadow-soft"
            >
            <div className="aspect-[4/5] overflow-hidden bg-artisan-sand">
              <motion.div className="relative h-full w-full" whileHover={{ scale: 1.07 }} transition={{ duration: 0.5, ease: "easeOut" }}>
                <Image
                  src={getDisplayMediaUrl(product.images?.[0]?.url)}
                  alt={product.images?.[0]?.alt ?? product.name}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw"
                  loading="lazy"
                  className="object-cover"
                />
              </motion.div>
            </div>
            <div className="flex flex-1 flex-col space-y-2.5 p-3 sm:space-y-3 sm:p-4 md:p-5">
              <h3 className="min-h-[2.6rem] font-heading text-[1rem] font-bold leading-tight text-artisan-brown sm:text-lg md:text-xl">
                {product.name}
              </h3>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <span className="inline-flex min-h-8 max-w-full items-center rounded-full bg-artisan-sand px-2.5 py-1 text-[8px] font-black uppercase leading-tight tracking-[0.08em] text-artisan-sage sm:min-h-0 sm:px-3 sm:text-[11px] sm:tracking-[0.12em]">
                  {product.category}
                </span>
                <span className="font-black text-artisan-brown sm:text-base">{"\u20B9"}{product.price.toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-auto flex items-center gap-2 pt-1">
                <motion.button
                  type="button"
                  onClick={() =>
                    addItem({
                      productId: product._id,
                      name: product.name,
                      price: product.price,
                      imageUrl: getDisplayMediaUrl(product.images?.[0]?.url)
                    })
                  }
                  whileHover={{ scale: 1.03, backgroundColor: "#c4714a" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 rounded-full bg-artisan-brown px-3 py-2.5 text-[10px] font-black uppercase leading-tight tracking-[0.1em] text-white sm:px-4 sm:text-xs sm:tracking-[0.12em]"
                >
                  <span className="sm:hidden">Add</span>
                  <span className="hidden sm:inline">Add to Cart</span>
                </motion.button>
                <motion.button
                  type="button"
                  aria-label={`Add ${product.name} to wishlist`}
                  whileHover={{ scale: 1.12, color: "#c4714a" }}
                  whileTap={{ scale: 0.9 }}
                  className="h-10 w-10 shrink-0 rounded-full border border-artisan-brown/15 bg-white text-lg text-artisan-brown"
                >
                  ♥
                </motion.button>
              </div>
              {cartQuantity > 0 && (
                <p className="text-center text-[10px] font-black uppercase tracking-[0.12em] text-artisan-sage">
                  In cart: {cartQuantity}
                </p>
              )}
            </div>
          </motion.article>
          );
        })}
      </motion.div>

      {!isLoading && !products.length && (
        <div className="mx-auto mt-10 max-w-2xl rounded-2xl bg-artisan-cream p-8 text-center shadow-soft">
          <h3 className="font-heading text-2xl font-bold text-artisan-brown">Products are being prepared</h3>
          <p className="mt-2 text-sm font-bold text-stone-600">Please check the shop while bestsellers are selected.</p>
        </div>
      )}

      <motion.div variants={itemReveal} className="mt-12 text-center">
        <motion.a
          href="/shop"
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex rounded-full border border-artisan-brown bg-artisan-brown px-7 py-3 text-sm font-black uppercase tracking-[0.14em] text-white"
        >
          View All Products
        </motion.a>
      </motion.div>
    </motion.section>
  );
}

function VideoSection({ videoUrl }: { videoUrl?: string }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const points = [
    "Consider your wall size",
    "Match your colour palette",
    "Choose the right knot style",
    "Layer textures confidently"
  ];

  return (
    <motion.section
      ref={ref}
      className="relative overflow-hidden px-6 py-20 md:px-10"
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.18 }}
    >
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,151,58,0.18),transparent_28%),linear-gradient(120deg,#f9f3ec,#e8d5bc)]"
      />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(45deg,#5c2d0a_1px,transparent_1px),linear-gradient(-45deg,#c4714a_1px,transparent_1px)] [background-size:26px_26px]" />

      <motion.div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]" variants={sectionReveal}>
        <motion.div variants={itemReveal} className="relative aspect-video overflow-hidden rounded-2xl bg-artisan-brown shadow-soft">
          <iframe
            className="h-full w-full"
            src={videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"}
            title="How to choose macrame for your home"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/16"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 1.04 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span
              className="flex h-20 w-20 items-center justify-center rounded-full bg-artisan-terracotta text-3xl text-white shadow-[0_18px_45px_rgba(92,45,10,0.35)]"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              ▶
            </motion.span>
          </motion.div>
        </motion.div>

        <motion.div variants={sectionReveal} className="flex flex-col justify-center">
          <motion.p variants={itemReveal} className="text-sm font-black uppercase tracking-[0.2em] text-artisan-sage">
            Styling Guide
          </motion.p>
          <motion.h2 variants={itemReveal} className="mt-3 font-heading text-4xl font-bold text-artisan-brown md:text-5xl">
            How to Choose Macramé for Your Home
          </motion.h2>
          <motion.div variants={sectionReveal} className="mt-8 grid gap-4">
            {points.map((point) => (
              <motion.div
                key={point}
                variants={itemReveal}
                whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.72)" }}
                className="flex items-center gap-4 rounded-2xl bg-white/46 p-4 shadow-sm backdrop-blur"
              >
                <motion.span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-artisan-sage text-white"
              whileHover={{ rotate: 12, scale: 1.08 }}
            >
                  ☘
                </motion.span>
                <span className="font-bold text-artisan-brown">{point}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

function TestimonialsSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const testimonial = testimonials[active];

  return (
    <motion.section
      className="bg-artisan-brown px-6 py-20 text-artisan-cream md:px-10"
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div variants={sectionReveal} className="mx-auto max-w-4xl text-center">
        <motion.h2 variants={itemReveal} className="font-heading text-4xl font-bold text-white md:text-5xl">
          Kind Words from Creative Homes
        </motion.h2>
        <div className="relative mt-10 min-h-[240px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="rounded-2xl border border-white/12 bg-white/8 p-8 backdrop-blur"
            >
              <motion.div
                className="flex justify-center gap-1 text-artisan-gold"
                initial="hidden"
                animate="show"
                variants={sectionReveal}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <motion.span key={index} variants={itemReveal}>
                    ★
                  </motion.span>
                ))}
              </motion.div>
              <p className="mt-5 font-heading text-2xl leading-9 text-white">“{testimonial.quote}”</p>
              <p className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-artisan-sand">
                {testimonial.name}, {testimonial.city}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.section>
  );
}

function InstagramStrip({ instagramUrl }: { instagramUrl?: string }) {
  const [productImages, setProductImages] = useState<Array<{ url: string; alt: string }>>([]);
  const feedLink = instagramUrl || "#";

  useEffect(() => {
    let isMounted = true;

    fetch("/api/products?limit=6&sort=newest", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { data?: { products?: Product[] } }) => {
        const products = payload.data?.products ?? [];
        const nextImages = products
          .map((product) => ({
            url: product.images?.[0]?.url,
            alt: product.name
          }))
          .filter((image): image is { url: string; alt: string } => Boolean(image.url))
          .slice(0, 6);

        if (isMounted) setProductImages(nextImages);
      })
      .catch(() => {
        if (isMounted) setProductImages([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const feedImages = productImages.slice(0, 6);

  return (
    <motion.section
      className="bg-white py-16"
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={itemReveal} className="mb-8 text-center">
        <h2 className="font-heading text-4xl font-bold text-artisan-brown">Follow us @artisanroot</h2>
      </motion.div>
      <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" variants={sectionReveal}>
        {(feedImages.length ? feedImages : Array.from({ length: 6 }, (_, index) => ({ url: "", alt: `Artisan Root product ${index + 1}` }))).map((image, index) => (
          <motion.a
            key={`${image.url || "placeholder"}-${index}`}
            href={feedLink}
            onClick={(event) => {
              if (feedLink === "#") event.preventDefault();
            }}
            aria-label={instagramUrl ? "Open Artisan Root Instagram" : "Instagram link coming soon"}
            variants={itemReveal}
            whileHover={{ scale: 0.97 }}
            className="group relative aspect-square overflow-hidden bg-artisan-sand"
          >
            {image.url ? (
              <motion.div className="relative h-full w-full" whileHover={{ scale: 1.08 }} transition={{ duration: 0.45 }}>
                <Image
                  src={optimizedMediaUrl(image.url, 720)}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                  loading="lazy"
                  quality={78}
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-artisan-cream">
                <Image src="/logo.png" alt={image.alt} width={96} height={96} className="opacity-70" />
              </div>
            )}
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-artisan-brown/70 text-center text-sm font-black uppercase tracking-[0.12em] text-white opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <span className="text-3xl">◎</span>
            </motion.div>
          </motion.a>
        ))}
      </motion.div>
    </motion.section>
  );
}

function Footer({ settings }: { settings: PublicSettings | null }) {
  const links = ["Home", "Shop", "About", "Contact"];
  const whatsappNumber = settings?.whatsappNumber ?? "91704474478";
  const contactDetails = {
    address: "Pyramid Elite, Sector 86, Gurugram, 122505",
    email: "artisanroot22@gmail.com",
    phone: "+91704474478"
  };

  return (
    <motion.footer
      className="bg-artisan-cream px-6 py-12 md:px-10"
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <motion.div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4" variants={sectionReveal}>
        <motion.div variants={itemReveal}>
          <motion.div className="relative h-16 w-16 overflow-hidden rounded-xl" whileHover={{ rotate: -4, scale: 1.04 }}>
            <Image src="/logo.png" alt="Artisan Root logo" fill sizes="64px" quality={95} className="object-contain" />
          </motion.div>
          <h2 className="mt-4 font-heading text-3xl font-bold text-artisan-brown">Artisan Root</h2>
          <p className="mt-2 font-bold text-artisan-sage">Cultivating Creative Spaces</p>
        </motion.div>

        <motion.nav variants={sectionReveal} className="grid gap-3">
          {links.map((link) => (
            <motion.a
              key={link}
              variants={itemReveal}
              whileHover={{ x: 6, color: "#c4714a" }}
              href={link === "Home" ? "/" : `/${link.toLowerCase()}`}
              className="font-bold text-artisan-brown"
            >
              {link}
            </motion.a>
          ))}
        </motion.nav>

        <motion.div variants={sectionReveal} className="md:col-span-2">
          <motion.div variants={itemReveal} className="flex gap-3">
            {[
              ["Instagram", settings?.socialLinks?.instagram || "https://www.instagram.com/", "◎"],
              ["Facebook", settings?.socialLinks?.facebook || "https://www.facebook.com/", "f"],
              ["WhatsApp", `https://wa.me/${whatsappNumber}`, "☎"]
            ].map(([label, href, icon]) => (
              <motion.a
                key={label}
                href={href}
                aria-label={label}
                whileHover={{ y: -4, scale: 1.06, backgroundColor: "#c4714a", color: "#ffffff" }}
                whileTap={{ scale: 0.95 }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-artisan-brown shadow-sm"
              >
                {icon}
              </motion.a>
            ))}
          </motion.div>
          <motion.p variants={itemReveal} className="mt-6 font-bold text-artisan-brown">
            Made with love in India
          </motion.p>
          <motion.div variants={itemReveal} className="mt-4 grid gap-1 text-sm font-bold leading-6 text-stone-600">
            <a href={`mailto:${contactDetails.email}`} className="hover:text-artisan-terracotta">
              {contactDetails.email}
            </a>
            <a href="tel:+91704474478" className="hover:text-artisan-terracotta">
              {contactDetails.phone}
            </a>
            <p>{contactDetails.address}</p>
            <p>Returns: 15 days of return acceptable</p>
            <p>Shipping: All over India shipping is available</p>
          </motion.div>
          <motion.p variants={itemReveal} className="mt-2 text-sm text-stone-600">
            {settings?.footerCopyright || "\u00A9 2025 Artisan Root"}
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
}

function LeafOrnament() {
  return (
    <motion.svg
      width="86"
      height="32"
      viewBox="0 0 86 32"
      fill="none"
      className="mx-auto"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={sectionReveal}
    >
      <motion.path variants={itemReveal} d="M8 22C25 8 53 8 78 22" stroke="#6b7c5c" strokeWidth="3" strokeLinecap="round" />
      <motion.path variants={itemReveal} d="M28 15C25 7 17 6 13 12C18 18 25 18 28 15Z" fill="#6b7c5c" />
      <motion.path variants={itemReveal} d="M45 12C43 4 35 3 31 9C35 16 43 16 45 12Z" fill="#c4714a" />
      <motion.path variants={itemReveal} d="M61 15C64 7 72 6 76 12C71 18 64 18 61 15Z" fill="#c9973a" />
    </motion.svg>
  );
}
