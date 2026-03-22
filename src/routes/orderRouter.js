import express from "express";
import { createOrder, getAllOrdersAdmin, getOrderById, getOrdersByEmail, getOrderTrackingByToken, updateOrderAdmin, updateShipmentByToken } from "../controller/orderController.js";
import { requireAdminKey } from "../utils/requireAdminKey.js";

const orderRouter = express.Router();

orderRouter.post("", createOrder);
orderRouter.get("/track/:token", getOrderTrackingByToken);
orderRouter.post("/track/:token/location", updateShipmentByToken);
orderRouter.get("/admin", requireAdminKey, getAllOrdersAdmin);
orderRouter.patch("/admin/:orderId", requireAdminKey, updateOrderAdmin);
orderRouter.get("/:orderId", getOrderById);
orderRouter.get("", getOrdersByEmail);

export default orderRouter;
