"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { adminFetch } from "@/lib/admin-client";
import type { StoreProduct } from "@/lib/product-data";

export default function EditProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<StoreProduct | null>(null);

  useEffect(() => {
    adminFetch<{ product: StoreProduct }>(`/api/products/${params.slug}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => undefined);
  }, [params.slug]);

  if (!product) return <div className="rounded-2xl bg-white p-6 shadow-sm">Loading product...</div>;

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-artisan-sage">Catalog</p>
        <h1 className="font-heading text-4xl font-bold text-artisan-brown">Edit Product</h1>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
