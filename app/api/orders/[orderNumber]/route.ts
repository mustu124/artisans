import { fail, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";

export async function GET(_: Request, { params }: { params: { orderNumber: string } }) {
  try {
    await connectToDatabase();
    const order = await OrderModel.findOne({ orderNumber: params.orderNumber }).lean();

    if (!order) return fail("Order not found.", 404);
    return ok({ order }, "Order loaded.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load order.");
  }
}
