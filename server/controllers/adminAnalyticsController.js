const db = require("../config/db").promise();

// ==========================================
// GET ADMIN ANALYTICS
// ==========================================
async function getAnalytics(req, res) {
    try {
        // ==========================================
        // TOTAL REVENUE
        // ==========================================
        const [revenueResult] = await db.query(`
            SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
            FROM orders
            WHERE order_status != 'cancelled'
        `);

        // ==========================================
        // TOTAL ORDERS
        // ==========================================
        const [orderResult] = await db.query(`
            SELECT COUNT(*) AS total_orders
            FROM orders
            WHERE order_status != 'cancelled'
        `);

        // ==========================================
        // AVERAGE ORDER VALUE
        // ==========================================
        const [averageResult] = await db.query(`
            SELECT COALESCE(AVG(total_amount), 0) AS average_order_value
            FROM orders
            WHERE order_status != 'cancelled'
        `);

        // ==========================================
        // SALES BY MONTH
        // ==========================================
        const [monthlySales] = await db.query(`
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                COUNT(*) AS orders,
                COALESCE(SUM(total_amount), 0) AS revenue
            FROM orders
            WHERE order_status != 'cancelled'
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        `);

        // ==========================================
        // ORDER STATUS
        // ==========================================
        const [statusResult] = await db.query(`
            SELECT
                order_status,
                COUNT(*) AS count
            FROM orders
            GROUP BY order_status
            ORDER BY count DESC
        `);

        // ==========================================
        // TOP PRODUCTS
        // ==========================================
        const [topProducts] = await db.query(`
            SELECT
                oi.product_id,
                p.name AS product_name,
                SUM(oi.quantity) AS units_sold,
                COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
            FROM order_items oi
            INNER JOIN orders o
                ON oi.order_id = o.id
            INNER JOIN products p
                ON oi.product_id = p.id
            WHERE o.order_status != 'cancelled'
            GROUP BY oi.product_id, p.name
            ORDER BY units_sold DESC
            LIMIT 10
        `);

        // ==========================================
        // TOP CATEGORIES
        // ==========================================
        const [topCategories] = await db.query(`
            SELECT
                c.id AS category_id,
                c.name AS category_name,
                COUNT(DISTINCT oi.order_id) AS orders,
                SUM(oi.quantity) AS units_sold,
                COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
            FROM order_items oi
            INNER JOIN orders o
                ON oi.order_id = o.id
            INNER JOIN products p
                ON oi.product_id = p.id
            INNER JOIN categories c
                ON p.category_id = c.id
            WHERE o.order_status != 'cancelled'
            GROUP BY c.id, c.name
            ORDER BY revenue DESC
            LIMIT 10
        `);

        // ==========================================
        // RESPONSE
        // ==========================================
        return res.status(200).json({
            success: true,
            analytics: {
                total_revenue: Number(
                    revenueResult[0].total_revenue
                ),

                total_orders: Number(
                    orderResult[0].total_orders
                ),

                average_order_value: Number(
                    averageResult[0].average_order_value
                ),

                monthly_sales: monthlySales,

                order_statuses: statusResult,

                top_products: topProducts,

                top_categories: topCategories
            }
        });

    } catch (error) {
        console.error(
            "Get analytics error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch analytics"
        });
    }
}

module.exports = {
    getAnalytics
};