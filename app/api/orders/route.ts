import { assertAdmin, fail, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";

type OrderPayload = {
  items: Array<{
    productId: string;
    name: string;
    image?: string;
    price: number;
    quantity: number;
    selectedVariant?: string;
  }>;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  pincode: string;
  totalAmount: number;
  whatsappSent?: boolean;
};

function buildOrderNumber() {
  const year = new Date().getFullYear();
  const suffix = Math.floor(100 + Math.random() * 900);
  return `AR-${year}-${Date.now().toString().slice(-4)}${suffix}`;
}

export async function GET(request: Request) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 50);
    await connectToDatabase();

    const query = status ? { status } : {};
    const orders = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await OrderModel.countDocuments(query);

    return ok({ orders, total, page, hasMore: page * limit < total }, "Orders loaded.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load orders.");
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as OrderPayload;

    if (
      !payload.customerName ||
      !payload.customerPhone ||
      !payload.deliveryAddress ||
      !payload.pincode ||
      !payload.items?.length
    ) {
      return fail("Missing required order fields.", 400);
    }

    const orderNumber = buildOrderNumber();
    const order = {
      orderNumber,
      items: payload.items,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      deliveryAddress: payload.deliveryAddress,
      pincode: payload.pincode,
      totalAmount: payload.totalAmount,
      status: "pending",
      whatsappSent: Boolean(payload.whatsappSent)
    };
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.includes("USER:PASSWORD")) {
      return ok({ order: { ...order, _id: orderNumber }, fallback: true }, "Order created.", { status: 201 });
    }

    await connectToDatabase();
    const createdOrder = await OrderModel.create(order);
    return ok({ order: createdOrder }, "Order created.", { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to create order.");
  }
}
