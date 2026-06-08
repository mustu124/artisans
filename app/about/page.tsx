"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const values = [
  "Natural cotton rope and warm neutral palettes",
  "Small-batch handmade pieces with thoughtful finishing",
  "Decor designed for lived-in creative homes"
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-artisan-cream pb-20 pt-24">
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
      >
        <motion.div variants={fadeInUp}>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-artisan-sage">About Artisan Root</p>
          <h1 className="mt-4 font-heading text-5xl font-bold leading-tight text-artisan-brown sm:text-6xl">
            Cultivating creative spaces, one knot at a time.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
            Artisan Root creates macrame and handcraft pieces that bring texture, warmth, and a handmade presence into everyday rooms. Each piece is built for homes that feel calm, collected, and deeply personal.
          </p>
          <Link href="/shop" className="mt-8 inline-flex rounded-full bg-artisan-terracotta px-7 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
            Shop Handmade Pieces
          </Link>
        </motion.div>
        <motion.div variants={fadeInUp} className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
          <Image
            src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=85"
            alt="Handmade macrame wall hanging in a warm boho interior"
            fill
            priority
            sizes="(min-width: 1024px) 46vw, 92vw"
            className="object-cover"
          />
        </motion.div>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="mx-auto max-w-7xl px-5 py-12 sm:px-8"
      >
        <motion.h2 variants={fadeInUp} className="font-heading text-4xl font-bold text-artisan-brown">
          What We Care About
        </motion.h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <motion.article key={value} variants={fadeInUp} className="rounded-2xl border border-artisan-brown/10 bg-white p-6 shadow-sm">
              <span className="block h-10 w-10 rounded-full border-2 border-dashed border-artisan-terracotta" />
              <p className="mt-5 text-lg font-bold leading-7 text-artisan-brown">{value}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>
    </main>
  );
}
