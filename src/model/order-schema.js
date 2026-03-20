import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, index: true },
      phone: { type: String, required: false },
    },
    shippingAddress: {
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    items: { type: [orderItemSchema], required: true },
    totals: {
      subtotal: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["created", "confirmed", "dispatched", "out_for_delivery", "delivered", "cancelled"],
      default: "created",
      required: true,
    },
    tracking: {
      carrier: { type: String, required: false },
      trackingNumber: { type: String, required: false },
      trackingUrl: { type: String, required: false },
    },
    adminNotes: { type: String, required: false },
  },
  { timestamps: true }
);

const Order = mongoose.model("order", orderSchema);
export default Order;
