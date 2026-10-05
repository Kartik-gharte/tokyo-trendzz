const db = require("../config/db").promise();

// Get all reviews
async function getAllReviews(req, res) {
    try {
        const [reviews] = await db.query(`
            SELECT
                r.id,
                r.user_id,
                r.product_id,
                r.rating,
                r.comment,
                r.created_at,
                u.name AS customer_name,
                u.email AS customer_email,
                p.name AS product_name
            FROM reviews r
            INNER JOIN users u
                ON r.user_id = u.id
            INNER JOIN products p
                ON r.product_id = p.id
            ORDER BY r.created_at DESC
        `);

        res.json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error("Get reviews error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch reviews"
        });
    }
}


// Get review statistics
async function getReviewStats(req, res) {
    try {
        const [stats] = await db.query(`
            SELECT
                COUNT(*) AS total_reviews,
                ROUND(AVG(rating), 1) AS average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star
            FROM reviews
        `);

        res.json({
            success: true,
            stats: stats[0]
        });
    } catch (error) {
        console.error("Get review stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch review statistics"
        });
    }
}


// Delete review
async function deleteReview(req, res) {
    try {
        const { reviewId } = req.params;

        const [existingReview] = await db.query(
            "SELECT id FROM reviews WHERE id = ?",
            [reviewId]
        );

        if (existingReview.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        await db.query(
            "DELETE FROM reviews WHERE id = ?",
            [reviewId]
        );

        res.json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error("Delete review error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete review"
        });
    }
}


module.exports = {
    getAllReviews,
    getReviewStats,
    deleteReview
};