import express from "express";
import { addReview, getReview } from "../controller/reviewController.js";
const reviewRouter = express.Router();

reviewRouter.post("/addreview", addReview);
reviewRouter.get("/getreview", getReview);

export default reviewRouter;
