"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const storeDetails = {
  address: "Pyramid Elite, Sector 86, Gurugram, 122505",
  email: "artisanroot22@gmail.com",
  phone: "91704474478",
  refundPolicy: "15 days of return acceptable",
  shippingPolicy: "All over India shipping is available"
};

export default function ContactPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? storeDetails.phone;

  return (
    <main className="min-h-screen bg-artisan-cream pb-20 pt-24">
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-5 py-12 sm:px-8"
      >
        <motion.p variants={fadeInUp} className="text-sm font-black uppercase tracking-[0.2em] text-artisan-sage">
          Contact
        </motion.p>
        <motion.h1 variants={fadeInUp} className="mt-4 max-w-3xl font-heading text-5xl font-bold leading-tight text-artisan-brown sm:text-6xl">
          Let us help you choose the right handmade piece.
        </motion.h1>
        <motion.p variants={fadeInUp} className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
          Ask about sizes, custom colours, bulk gifting, or styling ideas. We usually reply within one working day.
        </motion.p>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <motion.div variants={fadeInUp} className="rounded-2xl bg-artisan-brown p-6 text-white shadow-soft">
          <h2 className="font-heading text-3xl font-bold text-white">Reach Us</h2>
          <div className="mt-6 grid gap-4 text-sm font-bold">
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="rounded-xl bg-white/10 p-4">
              WhatsApp: +{storeDetails.phone}
            </a>
            <a href={`mailto:${storeDetails.email}`} className="rounded-xl bg-white/10 p-4">
              Email: {storeDetails.email}
            </a>
            <p className="rounded-xl bg-white/10 p-4">Address: {storeDetails.address}</p>
          </div>
        </motion.div>

        <motion.form variants={fadeInUp} className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-artisan-brown">
              Name
              <input className="field-input" placeholder="Your name" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-artisan-brown">
              Phone
              <input className="field-input" placeholder="Your phone number" />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold text-artisan-brown">
            Message
            <textarea className="field-input min-h-36 resize-none" placeholder="Tell us what you are looking for" />
          </label>
          <Link
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Artisan Root, I would like to enquire about your handmade products.")}`}
            target="_blank"
            className="inline-flex justify-center rounded-full bg-artisan-terracotta px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white"
          >
            Continue on WhatsApp
          </Link>
        </motion.form>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="mx-auto mt-8 grid max-w-7xl gap-4 px-5 sm:px-8 md:grid-cols-2"
      >
        <motion.article variants={fadeInUp} className="rounded-2xl border border-artisan-brown/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-artisan-sage">Returns</p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-artisan-brown">Refund cancellation policy</h2>
          <p className="mt-3 leading-7 text-stone-700">{storeDetails.refundPolicy}.</p>
        </motion.article>
        <motion.article variants={fadeInUp} className="rounded-2xl border border-artisan-brown/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-artisan-sage">Shipping</p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-artisan-brown">Delivery availability</h2>
          <p className="mt-3 leading-7 text-stone-700">{storeDetails.shippingPolicy}.</p>
        </motion.article>
      </motion.section>
    </main>
  );
}
