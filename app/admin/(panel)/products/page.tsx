"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AdminSection, ConfirmButton } from "@/components/admin/AdminCards";
import { adminFetch, formatCurrency } from "@/lib/admin-client";
import { PRODUCT_CATEGORIES, type StoreProduct } from "@/lib/product-data";
import { getDisplayMediaUrl } from "@/lib/media";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const load = () =>
    adminFetch<{ products: StoreProduct[] }>("/api/products?limit=100")
      .then((res) => setProducts(res.data.products))
      .catch((error) => toast.error(error.message));

  useEffect(() => {
    load();
  }, []);

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          (!category || product.category === category) &&
          product.name.toLowerCase().includes(search.toLowerCase())
      ),
    [category, products, search]
  );

  const removeProduct = async (slug: string) => {
    await adminFetch(`/api/products/${slug}`, { method: "DELETE" });
    toast.success("Product deleted");
    load();
  };

  const bulkDelete = async () => {
    await Promise.all(selected.map((slug) => adminFetch(`/api/products/${slug}`, { method: "DELETE" })));
    setSelected([]);
    toast.success("Selected products deleted");
    load();
  };

  const toggleFeatured = async (product: StoreProduct) => {
    await adminFetch(`/api/products/${product.slug}`, {
      method: "PUT",
      body: JSON.stringify({ isFeatured: !product.isFeatured, featured: !product.isFeatured })
    });
    toast.success("Featured status updated");
    load();
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-artisan-sage">Catalog</p>
          <h1 className="font-heading text-4xl font-bold">Products</h1>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-artisan-terracotta px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">Add New Product</Link>
      </div>

      <AdminSection
        title="Product Manager"
        action={
          selected.length > 0 && (
            <ConfirmButton message="Delete selected products?" onConfirm={bulkDelete} className="rounded-full bg-red-700 px-4 py-2 text-sm font-black text-white">
              Delete Selected
            </ConfirmButton>
          )
        }
      >
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_240px]">
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="field-input" placeholder="Search products" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="field-input">
            <option value="">All categories</option>
            {PRODUCT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="grid gap-3">
          <div className="hidden rounded-xl bg-artisan-cream px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-artisan-sage xl:grid xl:grid-cols-[minmax(360px,1.7fr)_220px_120px_90px_120px_150px] xl:gap-5">
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Featured</span>
            <span>Actions</span>
          </div>

          {visibleProducts.map((product) => (
            <article
              key={product._id}
              className="grid gap-4 rounded-2xl border border-artisan-brown/10 bg-white p-4 shadow-sm xl:grid-cols-[minmax(360px,1.7fr)_220px_120px_90px_120px_150px] xl:items-center xl:gap-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <input
                  type="checkbox"
                  aria-label={`Select ${product.name}`}
                  checked={selected.includes(product.slug)}
                  onChange={(e) =>
                    setSelected((cur) =>
                      e.target.checked ? [...cur, product.slug] : cur.filter((id) => id !== product.slug)
                    )
                  }
                  className="h-4 w-4 shrink-0"
                />
                <img
                  src={getDisplayMediaUrl(product.images[0]?.url)}
                  alt={product.name}
                  className="h-16 w-16 shrink-0 rounded-xl bg-artisan-sand object-cover"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="break-words text-base font-black leading-snug text-artisan-brown">{product.name}</p>
                  <p className="mt-1 text-xs font-bold text-stone-500 xl:hidden">{product.category}</p>
                </div>
              </div>

              <div className="hidden text-sm font-bold text-artisan-brown xl:block">{product.category}</div>
              <div className="text-sm font-black text-artisan-brown">
                <span className="mr-2 text-xs uppercase tracking-[0.12em] text-artisan-sage xl:hidden">Price</span>
                {formatCurrency(product.price)}
              </div>
              <div className="text-sm font-bold text-artisan-brown">
                <span className="mr-2 text-xs uppercase tracking-[0.12em] text-artisan-sage xl:hidden">Stock</span>
                {product.stockCount}
              </div>
              <button
                type="button"
                onClick={() => toggleFeatured(product)}
                className="w-fit rounded-full bg-artisan-cream px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-artisan-terracotta"
              >
                {product.isFeatured ? "Yes" : "No"}
              </button>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/admin/products/${product.slug}/edit`} className="font-black text-artisan-terracotta">Edit</Link>
                <ConfirmButton message="Delete this product?" onConfirm={() => removeProduct(product.slug)} className="font-black text-red-700">Delete</ConfirmButton>
              </div>
            </article>
          ))}

          {!visibleProducts.length && (
            <div className="rounded-2xl bg-artisan-cream p-8 text-center font-bold text-artisan-brown">
              No products match the current filters.
            </div>
          )}
        </div>
      </AdminSection>
    </div>
  );
}
