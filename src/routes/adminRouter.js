import express from "express";
import { listDeliveryPartners, listUsers, setUserRole } from "../controller/adminController.js";
import { requireAdminKey } from "../utils/requireAdminKey.js";

const adminRouter = express.Router();

adminRouter.get("/users", requireAdminKey, listUsers);
adminRouter.get("/delivery-partners", requireAdminKey, listDeliveryPartners);
adminRouter.patch("/users/:username", requireAdminKey, setUserRole);

export default adminRouter;
