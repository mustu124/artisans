import { assertAdmin, fail, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function PUT(request: Request, { params }: { params: { orderNumber: string } }) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { status } = (await request.json()) as { status?: string };
    if (!status || !statuses.includes(status)) {
      return fail("Invalid order status.", 400);
    }

    await connectToDatabase();
    const order = await OrderModel.findOneAndUpdate(
      { orderNumber: params.orderNumber },
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!order) return fail("Order not found.", 404);
    return ok({ order }, "Order status updated.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update order status.");
  }
}
