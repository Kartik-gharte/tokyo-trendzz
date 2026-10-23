const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getProductReviews,
    addReview
} = require("../controllers/customerReviewController");


/*
=========================================================
TOKYO TRENDZ — CUSTOMER REVIEW ROUTES
=========================================================
*/


/*
---------------------------------------------------------
GET ALL REVIEWS FOR PRODUCT
---------------------------------------------------------
Public — customers can see reviews without submitting one
*/
router.get(
    "/product/:productId",
    getProductReviews
);


/*
---------------------------------------------------------
ADD REVIEW
---------------------------------------------------------
Login required
*/
router.post(
    "/",
    authMiddleware,
    addReview
);


module.exports = router;