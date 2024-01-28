import express from "express";

const baseRouter = express.Router();

baseRouter.get("", (req, res) => {
    res.status(200).json({
        message: "Welcome To Himachal Harvest",
    })
});

export default baseRouter;
