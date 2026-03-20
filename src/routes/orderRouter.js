import express from "express";
import { createOrder, getAllOrdersAdmin, getOrderById, getOrdersByEmail, updateOrderAdmin } from "../controller/orderController.js";
import { requireAdminKey } from "../utils/requireAdminKey.js";

const orderRouter = express.Router();

orderRouter.post("", createOrder);
orderRouter.get("/admin", requireAdminKey, getAllOrdersAdmin);
orderRouter.patch("/admin/:orderId", requireAdminKey, updateOrderAdmin);
orderRouter.get("/:orderId", getOrderById);
orderRouter.get("", getOrdersByEmail);

export default orderRouter;
