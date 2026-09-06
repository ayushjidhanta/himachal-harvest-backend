import express from "express";
import { listDeliveryPartners, listUsers, setUserRole } from "../controller/adminController.js";
import { requireAdminKey } from "../utils/requireAdminKey.js";
import { MANAGER_PERMISSION } from "../constants/managerPermission.js";
import { requireOperationsAccess, requireStaffAccess } from "../utils/requireOperationsAccess.js";

const adminRouter = express.Router();

adminRouter.get("/users", requireStaffAccess, listUsers);
adminRouter.get("/delivery-partners", requireOperationsAccess(MANAGER_PERMISSION.ASSIGN_DELIVERY_PARTNER), listDeliveryPartners);
adminRouter.patch("/users/:username", requireAdminKey, setUserRole);

export default adminRouter;
