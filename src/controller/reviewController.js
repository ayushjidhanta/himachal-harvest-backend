import review from "../model/review-schema.js";
export const addReview = async (req, res) => {
    try {
        const ratingRaw = req.body?.reviewRating;
        const rating = ratingRaw === undefined || ratingRaw === null || ratingRaw === "" ? undefined : Number(ratingRaw);

        await review.create({
            name: req.body.reviewName,
            discription: req.body.reviewDescription,
            rating: Number.isFinite(rating) ? rating : undefined,
            date: req.body.reviewDate
        });

        return res.status(200).json({
            message: "Review Submitted Successfully",
        });


    } catch (error) {
        return res.status(500).json({
            message: error.message || "An error occurred",
        });
    }
};

export const getReview = async (req, res) => {
    try {
        const reviews = await review.find().sort({ date: -1, _id: -1 });
        return res.status(200).json({
            reviews: reviews,
            message: "Reviews retrieved successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "An error occurred while fetching reviews",
        });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const id = String(req.params?.id || "").trim();
        if (!id) {
            return res.status(400).json({ message: "Missing review id" });
        }

        const deleted = await review.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Review not found" });
        }

        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message || "An error occurred while deleting review" });
    }
};
