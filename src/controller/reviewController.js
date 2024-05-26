import review from "../model/review-schema.js";
export const addReview = async (req, res) => {
    try {
        const newReview = review.create({
            name: req.body.reviewName,
            discription: req.body.reviewDescription,
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
        const reviews = await review.find(); 
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
