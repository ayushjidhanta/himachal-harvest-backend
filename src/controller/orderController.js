import { v4 as uuidv4 } from "uuid";
import Order from "../model/order-schema.js";
import Product from "../model/product-schema.js";
import { sendOrderNotificationEmail } from "../services/emailService.js";
import { asTrimmedString, badRequest, isNonEmptyString, isPositiveInt, isValidEmail } from "../utils/validation.js";

const buildOrderFromRequest = async (payload) => {
  const customer = payload?.customer ?? {};
  const shippingAddress = payload?.shippingAddress ?? {};
  const items = Array.isArray(payload?.items) ? payload.items : [];

  const firstName = asTrimmedString(customer.firstName);
  const lastName = asTrimmedString(customer.lastName);
  const email = asTrimmedString(customer.email);
  const phone = asTrimmedString(customer.phone);

  const addressLine1 = asTrimmedString(shippingAddress.addressLine1);
  const city = asTrimmedString(shippingAddress.city);
  const state = asTrimmedString(shippingAddress.state);
  const zip = asTrimmedString(shippingAddress.zip);

  if (!isNonEmptyString(firstName)) return { error: "customer.firstName is required" };
  if (!isNonEmptyString(lastName)) return { error: "customer.lastName is required" };
  if (!isValidEmail(email)) return { error: "customer.email must be a valid email" };

  if (!isNonEmptyString(addressLine1)) return { error: "shippingAddress.addressLine1 is required" };
  if (!isNonEmptyString(city)) return { error: "shippingAddress.city is required" };
  if (!isNonEmptyString(state)) return { error: "shippingAddress.state is required" };
  if (!isNonEmptyString(zip)) return { error: "shippingAddress.zip is required" };

  if (items.length === 0) return { error: "items must be a non-empty array" };

  const normalizedItems = items.map((item) => ({
    productId: asTrimmedString(item?.productId),
    quantity: typeof item?.quantity === "number" ? item.quantity : Number(item?.quantity),
  }));

  const invalidItemIndex = normalizedItems.findIndex(
    (item) => !isNonEmptyString(item.productId) || !isPositiveInt(item.quantity)
  );
  if (invalidItemIndex !== -1) return { error: `items[${invalidItemIndex}] must include productId and positive integer quantity` };

  const productIds = [...new Set(normalizedItems.map((i) => i.productId))];
  const products = await Product.find({ id: { $in: productIds } }).lean();

  const productById = new Map(products.map((p) => [String(p.id), p]));
  const missing = productIds.filter((id) => !productById.has(id));
  if (missing.length) return { error: "Some products no longer exist", details: { missingProductIds: missing } };

  const orderItems = normalizedItems.map((i) => {
    const product = productById.get(i.productId);
    const title = product?.title?.shortTitle ?? product?.title?.longTitle ?? String(i.productId);
    const unitPrice = Number(product?.price?.cost ?? 0);
    return { productId: i.productId, title, unitPrice, quantity: i.quantity };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return {
    orderId: uuidv4(),
    customer: { firstName, lastName, email, phone: phone || undefined },
    shippingAddress: { addressLine1, city, state, zip },
    items: orderItems,
    totals: { subtotal, total: subtotal },
    status: "created",
  };
};

export const createOrder = async (req, res) => {
  try {
    const built = await buildOrderFromRequest(req.body);
    if (built?.error) return badRequest(res, built.error, built.details);

    const order = await Order.create(built);
    const notificationsTo = process.env.ORDER_NOTIFICATIONS_TO || "";

    let emailNotification = { sent: false, reason: "Not requested" };
    if (notificationsTo.trim().length) {
      try {
        emailNotification = await sendOrderNotificationEmail({ order, to: notificationsTo });
      } catch (e) {
        emailNotification = { sent: false, reason: e?.message ?? "Failed to send notification email" };
      }
    }

    return res.status(201).json({
      ok: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        totals: order.totals,
        createdAt: order.createdAt,
        emailNotification,
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const orderId = asTrimmedString(req.params.orderId);
    if (!isNonEmptyString(orderId)) return badRequest(res, "orderId is required");

    const order = await Order.findOne({ orderId }).lean();
    if (!order) return res.status(404).json({ ok: false, error: { message: "Order not found" } });

    return res.status(200).json({ ok: true, data: order });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};

export const getOrdersByEmail = async (req, res) => {
  try {
    const email = asTrimmedString(req.query.email);
    if (!isValidEmail(email)) return badRequest(res, "email query param must be a valid email");

    const orders = await Order.find({ "customer.email": email }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ ok: true, data: orders });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ ok: true, data: orders });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};

export const updateOrderAdmin = async (req, res) => {
  try {
    const orderId = asTrimmedString(req.params.orderId);
    if (!isNonEmptyString(orderId)) return badRequest(res, "orderId is required");

    const payload = req.body ?? {};
    const update = {};

    if (payload.status !== undefined) {
      const status = asTrimmedString(payload.status);
      const allowed = new Set(["created", "confirmed", "dispatched", "out_for_delivery", "delivered", "cancelled"]);
      if (!allowed.has(status)) return badRequest(res, "Invalid status");
      update.status = status;
    }

    if (payload.tracking !== undefined) {
      const tracking = payload.tracking ?? {};
      update.tracking = {
        carrier: asTrimmedString(tracking.carrier) || undefined,
        trackingNumber: asTrimmedString(tracking.trackingNumber) || undefined,
        trackingUrl: asTrimmedString(tracking.trackingUrl) || undefined,
      };
    }

    if (payload.adminNotes !== undefined) update.adminNotes = asTrimmedString(payload.adminNotes) || undefined;

    if (Object.keys(update).length === 0) return badRequest(res, "No updatable fields provided");

    const updated = await Order.findOneAndUpdate({ orderId }, { $set: update }, { new: true }).lean();
    if (!updated) return res.status(404).json({ ok: false, error: { message: "Order not found" } });

    return res.status(200).json({ ok: true, data: updated });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};
