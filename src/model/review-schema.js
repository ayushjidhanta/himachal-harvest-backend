import mongoose from "mongoose";

const reviewSchema = {
    name: {
        type: String,
        required: true,
    },
    discription: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    }
};

const review = mongoose.model("review", reviewSchema);
export default review;
