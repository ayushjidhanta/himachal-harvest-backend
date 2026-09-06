import express from "express";
import { createOrder, getAllOrdersAdmin, getAssignedOrdersForPartner, getOrderById, getOrdersByEmail, getOrderTrackingByToken, updateOrderAdmin, updateShipmentByToken } from "../controller/orderController.js";
import { requireAdminKey } from "../utils/requireAdminKey.js";
import { requireRole } from "../utils/requireRole.js";
import { USER_ROLE } from "../constants/userRole.js";

const orderRouter = express.Router();

orderRouter.post("", createOrder);
orderRouter.get("/track/:token", getOrderTrackingByToken);
orderRouter.post("/track/:token/location", updateShipmentByToken);
orderRouter.get("/assigned", requireRole(USER_ROLE.DELIVERY_PARTNER), getAssignedOrdersForPartner);
orderRouter.get("/admin", requireAdminKey, getAllOrdersAdmin);
orderRouter.patch("/admin/:orderId", requireAdminKey, updateOrderAdmin);
orderRouter.get("/:orderId", getOrderById);
orderRouter.get("", getOrdersByEmail);

export default orderRouter;
