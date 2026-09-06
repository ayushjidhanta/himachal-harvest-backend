import express from "express";
import { createProduct, getProducts, getProductsById, updateProductById } from "../controller/productController.js";
import { MANAGER_PERMISSION } from "../constants/managerPermission.js";
import { requireOperationsAccess } from "../utils/requireOperationsAccess.js";

const productRouter = express.Router();

productRouter.get("/getProducts", getProducts);
productRouter.get("/getProducts/:id", getProductsById);
productRouter.post("", requireOperationsAccess(MANAGER_PERMISSION.MANAGE_CATALOG), createProduct);
productRouter.patch("/:id", requireOperationsAccess(MANAGER_PERMISSION.MANAGE_CATALOG), updateProductById);

export default productRouter;
