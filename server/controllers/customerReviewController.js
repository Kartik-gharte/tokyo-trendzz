const db = require("../config/db").promise();

/*
=========================================================
TOKYO TRENDZ — CUSTOMER REVIEWS
=========================================================
*/


// =========================================================
// GET ALL REVIEWS FOR A PRODUCT
// =========================================================
async function getProductReviews(req, res) {
    try {
        const { productId } = req.params;

        const [reviews] = await db.query(
            `
            SELECT
                r.id,
                r.user_id,
                r.product_id,
                r.rating,
                r.comment,
                r.created_at,
                u.name AS customer_name
            FROM reviews r
            INNER JOIN users u
                ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
            `,
            [productId]
        );

        res.json({
            success: true,
            reviews
        });

    } catch (error) {
        console.error("Get product reviews error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product reviews"
        });
    }
}


// =========================================================
// ADD CUSTOMER REVIEW
// =========================================================
async function addReview(req, res) {
    try {

        // JWT contains userId, not id
        const userId = req.user.userId;

        const {
            product_id,
            rating,
            comment
        } = req.body;


        // -------------------------------------------------
        // CHECK AUTHENTICATED USER
        // -------------------------------------------------
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found"
            });
        }


        // -------------------------------------------------
        // CHECK PRODUCT ID
        // -------------------------------------------------
        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }


        // -------------------------------------------------
        // CHECK RATING
        // -------------------------------------------------
        if (!rating) {
            return res.status(400).json({
                success: false,
                message: "Rating is required"
            });
        }

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }


        // -------------------------------------------------
        // CHECK COMMENT
        // -------------------------------------------------
        const cleanComment =
            typeof comment === "string"
                ? comment.trim()
                : "";

        if (!cleanComment) {
            return res.status(400).json({
                success: false,
                message: "Review comment is required"
            });
        }

        if (cleanComment.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Review must contain at least 3 characters"
            });
        }

        if (cleanComment.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Review cannot exceed 1000 characters"
            });
        }


        // -------------------------------------------------
        // CHECK PRODUCT EXISTS
        // -------------------------------------------------
        const [products] = await db.query(
            `
            SELECT id
            FROM products
            WHERE id = ?
            LIMIT 1
            `,
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        // -------------------------------------------------
        // CHECK IF USER ALREADY REVIEWED THIS PRODUCT
        // -------------------------------------------------
        const [existingReview] = await db.query(
            `
            SELECT
                id,
                rating,
                comment,
                created_at
            FROM reviews
            WHERE user_id = ?
            AND product_id = ?
            LIMIT 1
            `,
            [userId, product_id]
        );

        if (existingReview.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this product",
                review: existingReview[0]
            });
        }


        // -------------------------------------------------
        // INSERT REVIEW
        // -------------------------------------------------
        const [result] = await db.query(
            `
            INSERT INTO reviews
            (
                user_id,
                product_id,
                rating,
                comment
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                userId,
                product_id,
                numericRating,
                cleanComment
            ]
        );


        // -------------------------------------------------
        // GET CREATED REVIEW
        // -------------------------------------------------
        const [createdReview] = await db.query(
            `
            SELECT
                r.id,
                r.user_id,
                r.product_id,
                r.rating,
                r.comment,
                r.created_at,
                u.name AS customer_name
            FROM reviews r
            INNER JOIN users u
                ON r.user_id = u.id
            WHERE r.id = ?
            LIMIT 1
            `,
            [result.insertId]
        );


        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------
        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review: createdReview[0]
        });

    } catch (error) {

        console.error("=================================");
        console.error("ADD REVIEW ERROR:");
        console.error(error);
        console.error("=================================");

        res.status(500).json({
            success: false,
            message: "Failed to add review"
        });
    }
}


// =========================================================
// EXPORT CONTROLLERS
// =========================================================
module.exports = {
    getProductReviews,
    addReview
};