"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PRODUCT_CATEGORIES } from "@/lib/product-data";

export type ProductFiltersState = {
  categories: string[];
  maxPrice: number;
  sort: string;
};

type ProductFiltersProps = {
  filters: ProductFiltersState;
  onChange: (filters: ProductFiltersState) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
};

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" }
];

export function ProductFilters({ filters, onChange, isMobileOpen, onClose }: ProductFiltersProps) {
  const content = (
    <FilterContent filters={filters} onChange={onChange} onClose={onClose} />
  );

  return (
    <>
      <aside className="hidden xl:block">{content}</aside>
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close filters backdrop"
              className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-x-0 bottom-0 z-[90] max-h-[86vh] overflow-y-auto rounded-t-[2rem] bg-artisan-cream p-6 shadow-[0_-24px_60px_rgba(0,0,0,0.22)] xl:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterContent({
  filters,
  onChange,
  onClose
}: {
  filters: ProductFiltersState;
  onChange: (filters: ProductFiltersState) => void;
  onClose?: () => void;
}) {
  const toggleCategory = (category: string) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category];

    onChange({ ...filters, categories });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-artisan-brown/10 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-artisan-brown">Filters</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-artisan-brown/15 px-3 py-1 text-sm font-black text-artisan-brown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta"
          >
            Close
          </button>
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-artisan-sage">Category</p>
        <div className="mt-3 grid gap-2">
          {PRODUCT_CATEGORIES.map((category) => (
            <label key={category} className="flex cursor-pointer items-center gap-3 text-sm font-bold text-artisan-brown">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="h-4 w-4 accent-artisan-terracotta"
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <label htmlFor="max-price" className="text-xs font-black uppercase tracking-[0.16em] text-artisan-sage">
          Price up to {"\u20B9"}{filters.maxPrice.toLocaleString("en-IN")}
        </label>
        <input
          id="max-price"
          type="range"
          min="300"
          max="3500"
          step="100"
          value={filters.maxPrice}
          onChange={(event) => onChange({ ...filters, maxPrice: Number(event.target.value) })}
          className="mt-4 w-full accent-artisan-terracotta"
        />
      </div>

      <div className="mt-7">
        <label htmlFor="sort-products" className="text-xs font-black uppercase tracking-[0.16em] text-artisan-sage">
          Sort by
        </label>
        <select
          id="sort-products"
          value={filters.sort}
          onChange={(event) => onChange({ ...filters, sort: event.target.value })}
          className="mt-3 w-full rounded-xl border border-artisan-brown/12 bg-artisan-cream px-4 py-3 font-bold text-artisan-brown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => onChange({ categories: [], maxPrice: 3500, sort: "newest" })}
        className="mt-7 w-full rounded-full border border-artisan-brown/20 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-artisan-brown transition hover:border-artisan-terracotta hover:text-artisan-terracotta focus:outline-none focus:ring-2 focus:ring-artisan-terracotta"
      >
        Reset Filters
      </button>
    </motion.div>
  );
}
