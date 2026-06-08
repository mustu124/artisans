"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type LogoLoadingScreenProps = {
  label?: string;
  className?: string;
};

export function LogoLoadingScreen({
  label = "Loading Artisan Root",
  className = "min-h-[55vh]"
}: LogoLoadingScreenProps) {
  return (
    <div
      className={`flex items-center justify-center bg-artisan-cream text-artisan-brown ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-5">
        <motion.div
          className="relative h-24 w-24 overflow-hidden rounded-3xl bg-white/85 p-3 shadow-[0_18px_60px_rgba(92,45,10,0.16)] ring-1 ring-artisan-brown/10"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/logo.png" alt="" fill sizes="96px" quality={95} className="object-contain p-3" />
        </motion.div>
        <div className="flex items-center gap-2" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-2 w-2 rounded-full bg-artisan-terracotta"
              animate={{ opacity: [0.28, 1, 0.28], y: [0, -4, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.14, ease: "easeInOut" }}
            />
          ))}
        </div>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
