import type { CartItem } from "@/context/CartContext";

export type CustomerInfo = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  pincode: string;
};

export function buildWhatsAppMessage(cartItems: CartItem[], customerInfo: CustomerInfo) {
  const ownerPhone = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? "910000000000";
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const orderLines = cartItems
    .map((item, index) => {
      const productUrl = appUrl ? `${appUrl}/shop/${item.product.slug}` : `/shop/${item.product.slug}`;
      const imageUrl = item.product.images[0]?.url;
      const variant = item.selectedVariant ? ` (${item.selectedVariant})` : "";

      return `${index + 1}. ${item.product.name}${variant} x${item.quantity} — ₹${(
        item.product.price * item.quantity
      ).toLocaleString("en-IN")}
   🔗 ${productUrl}${imageUrl ? `\n   Image: ${imageUrl}` : ""}`;
    })
    .join("\n");

  const message = `Hello! I'd like to place an order 🛍️

*Order Details:*
${orderLines}

*Order Total: ₹${total.toLocaleString("en-IN")}*

*Customer Details:*
Name: ${customerInfo.name}
Phone: ${customerInfo.phone}
Address: ${customerInfo.address}
Pincode: ${customerInfo.pincode}${customerInfo.email ? `\nEmail: ${customerInfo.email}` : ""}`;

  return `https://wa.me/${ownerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
