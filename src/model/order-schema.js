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
    deliveryLocation: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false },
      accuracy: { type: Number, required: false },
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
    deliveryPartner: {
      name: { type: String, required: false },
      phone: { type: String, required: false },
      whatsapp: { type: String, required: false },
    },
    deliveryShareToken: { type: String, required: false, unique: true, sparse: true, index: true },
    deliveryUpdateToken: { type: String, required: false, unique: true, sparse: true, index: true },
    shipment: {
      lastKnownLocation: {
        lat: { type: Number, required: false },
        lng: { type: Number, required: false },
      },
      lastKnownText: { type: String, required: false },
      updatedAt: { type: Date, required: false },
    },
    adminNotes: { type: String, required: false },
  },
  { timestamps: true }
);

const Order = mongoose.model("order", orderSchema);
export default Order;
