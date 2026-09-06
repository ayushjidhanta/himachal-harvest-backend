import express from "express";
import { createOrder, getAllOrdersAdmin, getAssignedOrdersForPartner, getOrderById, getOrdersByEmail, getOrderTrackingByToken, updateOrderAdmin, updateShipmentByToken } from "../controller/orderController.js";
import { requireRole } from "../utils/requireRole.js";
import { USER_ROLE } from "../constants/userRole.js";
import { MANAGER_PERMISSION } from "../constants/managerPermission.js";
import { requireOperationsAccess } from "../utils/requireOperationsAccess.js";

const orderRouter = express.Router();

orderRouter.post("", createOrder);
orderRouter.get("/track/:token", getOrderTrackingByToken);
orderRouter.post("/track/:token/location", updateShipmentByToken);
orderRouter.get("/assigned", requireRole(USER_ROLE.DELIVERY_PARTNER), getAssignedOrdersForPartner);
orderRouter.get("/admin", requireOperationsAccess(MANAGER_PERMISSION.ASSIGN_DELIVERY_PARTNER, MANAGER_PERMISSION.UPDATE_ORDER_STATUS), getAllOrdersAdmin);
orderRouter.patch("/admin/:orderId", requireOperationsAccess(MANAGER_PERMISSION.ASSIGN_DELIVERY_PARTNER, MANAGER_PERMISSION.UPDATE_ORDER_STATUS), updateOrderAdmin);
orderRouter.get("/:orderId", getOrderById);
orderRouter.get("", getOrdersByEmail);

export default orderRouter;
