import express from "express";
import { addReview, deleteReview, getReview } from "../controller/reviewController.js";
import { requireAdminKey } from "../utils/requireAdminKey.js";
const reviewRouter = express.Router();

reviewRouter.post("/addreview", addReview);
reviewRouter.get("/getreview", getReview);
reviewRouter.delete("/:id", requireAdminKey, deleteReview);

export default reviewRouter;
