import express from "express";
import { listUsers, setUserRole } from "../controller/adminController.js";
import { requireAdminKey } from "../utils/requireAdminKey.js";

const adminRouter = express.Router();

adminRouter.get("/users", requireAdminKey, listUsers);
adminRouter.patch("/users/:username", requireAdminKey, setUserRole);

export default adminRouter;

