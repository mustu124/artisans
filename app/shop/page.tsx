"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ProductCard, ProductSkeleton, QuickViewModal } from "@/components/ProductCard";
import { ProductFilters, type CategoryFilterOption, type ProductFiltersState } from "@/components/ProductFilters";
import type { StoreProduct } from "@/lib/product-data";

type ProductsResponse = {
  success?: boolean;
  data?: {
    products: StoreProduct[];
    total: number;
    page: number;
    hasMore: boolean;
  };
  products?: StoreProduct[];
  total?: number;
  page?: number;
  hasMore?: boolean;
};

const initialFilters: ProductFiltersState = {
  categories: [],
  subcategories: [],
  maxPrice: 3500,
  sort: "newest"
};

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageLoader />}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialSubcategory = searchParams.get("subcategory");
  const [filters, setFilters] = useState<ProductFiltersState>({
    ...initialFilters,
    categories: initialCategory ? [initialCategory] : [],
    subcategories: initialSubcategory ? [initialSubcategory] : []
  });
  const [categoryOptions, setCategoryOptions] = useState<CategoryFilterOption[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null);
  const [moreLikeThisProduct, setMoreLikeThisProduct] = useState<StoreProduct | null>(null);
  const [similarProducts, setSimilarProducts] = useState<StoreProduct[]>([]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "8");
    params.set("page", String(page));
    params.set("maxPrice", String(filters.maxPrice));
    params.set("sort", filters.sort);
    if (filters.categories.length === 1) params.set("category", filters.categories[0]);
    if (filters.subcategories.length === 1) params.set("subcategory", filters.subcategories[0]);
    return params.toString();
  }, [filters.categories, filters.maxPrice, filters.sort, filters.subcategories, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { data?: { settings?: { categories?: CategoryFilterOption[] } } }) => {
        if (isMounted) setCategoryOptions(payload.data?.settings?.categories ?? []);
      })
      .catch(() => {
        if (isMounted) setCategoryOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      const response = await fetch(`/api/products?${queryString}`);
      const data = (await response.json()) as ProductsResponse;
      const payload = data.data ?? data;
      const nextProducts = payload.products ?? [];
      const incomingProducts =
        filters.categories.length > 1 || filters.subcategories.length > 1
          ? nextProducts.filter((product) => {
              const matchesCategory = !filters.categories.length || filters.categories.includes(product.category);
              const matchesSubcategory =
                !filters.subcategories.length ||
                (product.subcategory ? filters.subcategories.includes(product.subcategory) : false);

              return matchesCategory && matchesSubcategory;
            })
          : nextProducts;

      if (!isMounted) return;

      setProducts((current) => (page === 1 ? incomingProducts : [...current, ...incomingProducts]));
      setHasMore(Boolean(payload.hasMore));
      setIsLoading(false);
      setIsLoadingMore(false);
    };

    loadProducts().catch(() => {
      if (isMounted) {
        setProducts([]);
        setHasMore(false);
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [filters.categories, filters.subcategories, page, queryString]);

  useEffect(() => {
    if (!moreLikeThisProduct) {
      setSimilarProducts([]);
      return;
    }

    fetch(
      `/api/products?category=${encodeURIComponent(moreLikeThisProduct.category)}&limit=8&exclude=${encodeURIComponent(
        moreLikeThisProduct._id
      )}`
    )
      .then((response) => response.json())
      .then((data: ProductsResponse) => setSimilarProducts(data.data?.products ?? data.products ?? []))
      .catch(() => setSimilarProducts([]));
  }, [moreLikeThisProduct]);

  const appliedPills = [
    ...filters.categories.map((category) => ({ label: category, value: category, type: "category" })),
    ...filters.subcategories.map((subcategory) => ({ label: subcategory, value: subcategory, type: "subcategory" })),
    ...(filters.maxPrice < 3500
      ? [{ label: `Under \u20B9${filters.maxPrice.toLocaleString("en-IN")}`, value: "price", type: "price" }]
      : [])
  ];

  const updateFilters = (nextFilters: ProductFiltersState) => {
    setFilters(nextFilters);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-artisan-cream px-3 pb-20 pt-24 sm:px-4 sm:pt-28 md:px-8">
      <motion.header
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mx-auto max-w-7xl"
      >
        <p className="text-xs font-black uppercase tracking-[0.16em] text-artisan-sage sm:text-sm sm:tracking-[0.18em]">Shop Artisan Root</p>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="min-w-0">
            <h1 className="font-heading text-[2.15rem] font-bold leading-[1.02] text-artisan-brown sm:text-4xl md:text-6xl">
              Handmade Macramé & Home Craft
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-700 sm:text-base">
              Browse small-batch pieces made with cotton rope, warm texture, and quiet boho detail.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="w-full rounded-full bg-artisan-brown px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white sm:w-auto sm:text-sm sm:tracking-[0.14em] xl:hidden"
          >
            Open Filters
          </button>
        </div>
      </motion.header>

      <section className="mx-auto mt-8 grid max-w-7xl gap-6 sm:mt-10 sm:gap-8 xl:grid-cols-[290px_1fr]">
        <ProductFilters
          filters={filters}
          onChange={updateFilters}
          categories={categoryOptions}
          isMobileOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        <div className="min-w-0">
          <div className="mb-5 flex min-w-0 flex-wrap items-center gap-2">
            <AnimatePresence>
              {appliedPills.map((pill) => (
                <motion.button
                  key={`${pill.type}-${pill.value}`}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => {
                    if (pill.type === "category") {
                      const nextCategories = filters.categories.filter((category) => category !== pill.value);
                      const allowedSubcategories = new Set(
                        categoryOptions
                          .filter((category) => !nextCategories.length || nextCategories.includes(category.name))
                          .flatMap((category) => category.subcategories ?? [])
                      );
                      setFilters({
                        ...filters,
                        categories: nextCategories,
                        subcategories: filters.subcategories.filter((subcategory) => allowedSubcategories.has(subcategory))
                      });
                    } else if (pill.type === "subcategory") {
                      setFilters({
                        ...filters,
                        subcategories: filters.subcategories.filter((subcategory) => subcategory !== pill.value)
                      });
                    } else {
                      setFilters({ ...filters, maxPrice: 3500 });
                    }
                  }}
                  className="max-w-full rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase leading-tight tracking-[0.1em] text-artisan-brown shadow-sm focus:outline-none focus:ring-2 focus:ring-artisan-terracotta sm:px-4 sm:text-xs sm:tracking-[0.12em]"
                >
                  {pill.label} x
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {isLoading ? (
            <ShopPageLoader />
          ) : (
            <>
              <motion.div
                layout
                className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4"
              >
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                    onMoreLikeThis={setMoreLikeThisProduct}
                  />
                ))}
              </motion.div>

              {products.length === 0 && (
                <div className="rounded-2xl bg-white p-10 text-center text-artisan-brown shadow-sm">
                  <h2 className="font-heading text-3xl font-bold">No pieces found</h2>
                  <p className="mt-2 text-stone-600">Try removing a filter or raising the price range.</p>
                </div>
              )}

              {hasMore && (
                <div className="mt-10 text-center">
                  <motion.button
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={isLoadingMore}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-full bg-artisan-brown px-7 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:opacity-60"
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </motion.button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      <MoreLikeThisModal
        sourceProduct={moreLikeThisProduct}
        products={similarProducts}
        onClose={() => setMoreLikeThisProduct(null)}
        onQuickView={setQuickViewProduct}
      />
    </main>
  );
}

function MoreLikeThisModal({
  sourceProduct,
  products,
  onClose,
  onQuickView
}: {
  sourceProduct: StoreProduct | null;
  products: StoreProduct[];
  onClose: () => void;
  onQuickView: (product: StoreProduct) => void;
}) {
  return (
    <AnimatePresence>
      {sourceProduct && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            onClick={(event) => event.stopPropagation()}
            className="mx-auto mt-20 max-w-6xl rounded-2xl bg-artisan-cream p-5 shadow-soft md:p-8"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-artisan-sage">More like this</p>
                <h2 className="font-heading text-3xl font-bold text-artisan-brown">{sourceProduct.category}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-artisan-brown/15 px-4 py-2 text-sm font-black text-artisan-brown"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={onQuickView}
                  onMoreLikeThis={() => undefined}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShopPageLoader() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}
