"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AdminSection, ConfirmButton } from "@/components/admin/AdminCards";
import { adminFetch, formatCurrency } from "@/lib/admin-client";
import { PRODUCT_CATEGORIES, type StoreProduct } from "@/lib/product-data";

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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-artisan-sage">
              <tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-artisan-brown/10">
              {visibleProducts.map((product) => (
                <tr key={product._id}>
                  <td><input type="checkbox" checked={selected.includes(product.slug)} onChange={(e) => setSelected((cur) => e.target.checked ? [...cur, product.slug] : cur.filter((id) => id !== product.slug))} /></td>
                  <td className="flex items-center gap-3 py-3">
                    <Image src={product.images[0]?.url ?? "/logo.png"} alt={product.name} width={48} height={48} className="h-12 w-12 rounded-xl object-cover" />
                    <span className="font-black">{product.name}</span>
                  </td>
                  <td>{product.category}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.stockCount}</td>
                  <td><button type="button" onClick={() => toggleFeatured(product)} className="font-black text-artisan-terracotta">{product.isFeatured ? "Yes" : "No"}</button></td>
                  <td className="space-x-3">
                    <Link href={`/admin/products/${product.slug}/edit`} className="font-black text-artisan-terracotta">Edit</Link>
                    <ConfirmButton message="Delete this product?" onConfirm={() => removeProduct(product.slug)} className="font-black text-red-700">Delete</ConfirmButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSection>
    </div>
  );
}
