import { model, models, Schema, type InferSchemaType } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedVariant: { type: String }
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    items: [OrderItemSchema],
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    deliveryAddress: { type: String, required: true },
    pincode: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    whatsappSent: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

export type Order = InferSchemaType<typeof OrderSchema>;

export const OrderModel = models.Order || model("Order", OrderSchema);
