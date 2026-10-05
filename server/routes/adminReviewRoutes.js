const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllReviews,
    getReviewStats,
    deleteReview
} = require("../controllers/adminReviewController");


// Get all reviews
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllReviews
);


// Get review statistics
router.get(
    "/stats",
    authMiddleware,
    adminMiddleware,
    getReviewStats
);


// Delete review
router.delete(
    "/:reviewId",
    authMiddleware,
    adminMiddleware,
    deleteReview
);


module.exports = router;