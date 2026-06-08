"use client";

import { motion } from "framer-motion";

export function FeaturedIntro() {
  return (
    <main className="min-h-screen bg-artisan-cream">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-artisan-sage">
            Cultivating Creative Spaces
          </p>
          <h1 className="font-heading text-5xl font-bold leading-tight text-artisan-brown md:text-7xl">
            Artisan Root
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-700">
            Handmade macrame, textured home accents, and small-batch craft pieces
            shaped for spaces that feel warm, calm, and deeply personal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/shop"
              className="rounded-full bg-artisan-brown px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-artisan-terracotta"
            >
              Shop Collection
            </a>
            <a
              href="/gallery"
              className="rounded-full border border-artisan-brown/20 px-6 py-3 text-sm font-bold text-artisan-brown transition hover:border-artisan-terracotta hover:text-artisan-terracotta"
            >
              View Gallery
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-artisan-sand shadow-soft"
          aria-label="Layered macrame textures and handmade decor"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(201,151,58,0.32),transparent_32%),linear-gradient(135deg,#e8d5bc,#f9f3ec_48%,#c4714a)]" />
          <div className="absolute left-1/2 top-14 h-[72%] w-44 -translate-x-1/2 rounded-b-full border-x-[18px] border-b-[18px] border-artisan-brown/75" />
          <div className="absolute left-1/2 top-12 h-[78%] w-px -translate-x-1/2 bg-artisan-brown/70" />
          <div className="absolute bottom-14 left-1/2 grid w-72 -translate-x-1/2 grid-cols-9 gap-2">
            {Array.from({ length: 45 }).map((_, index) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="h-16 rounded-full bg-white/70 shadow-sm"
                style={{
                  transform: `translateY(${(index % 9) * 5}px)`,
                  opacity: 0.86 - (index % 5) * 0.06
                }}
              />
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
