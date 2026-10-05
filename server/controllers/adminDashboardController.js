const db = require("../config/db");

async function getDashboardStats(req, res) {
    try {
        // ==========================================
        // TOTAL PRODUCTS
        // ==========================================

        const [productResult] = await db.promise().query(`
            SELECT COUNT(*) AS total_products
            FROM products
        `);

        // ==========================================
        // TOTAL ORDERS
        // ==========================================

        const [orderResult] = await db.promise().query(`
            SELECT COUNT(*) AS total_orders
            FROM orders
        `);

        // ==========================================
        // TOTAL CUSTOMERS
        // ==========================================

        const [customerResult] = await db.promise().query(`
            SELECT COUNT(*) AS total_customers
            FROM users
            WHERE role = 'customer'
        `);

        // ==========================================
        // TOTAL REVENUE
        // Exclude cancelled orders
        // ==========================================

        const [revenueResult] = await db.promise().query(`
            SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
            FROM orders
            WHERE order_status != 'cancelled'
        `);

        // ==========================================
        // ORDER STATUS COUNTS
        // ==========================================

        const [statusResult] = await db.promise().query(`
            SELECT
                order_status,
                COUNT(*) AS count
            FROM orders
            GROUP BY order_status
        `);

        // ==========================================
        // ORDER STATUS OBJECT
        // ==========================================

        const orderStatuses = {
            placed: 0,
            confirmed: 0,
            packed: 0,
            shipped: 0,
            out_for_delivery: 0,
            delivered: 0,
            cancelled: 0
        };

        statusResult.forEach((item) => {
            if (
                Object.prototype.hasOwnProperty.call(
                    orderStatuses,
                    item.order_status
                )
            ) {
                orderStatuses[item.order_status] = Number(
                    item.count
                );
            }
        });

        // ==========================================
        // RECENT ORDERS
        // ==========================================

        const [recentOrders] = await db.promise().query(`
            SELECT
                o.id,
                o.order_number,
                o.user_id,
                o.total_amount,
                o.order_status,
                o.payment_method,
                o.payment_status,
                o.created_at,
                u.name AS customer_name,
                u.email AS customer_email
            FROM orders o
            LEFT JOIN users u
                ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `);

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,
            stats: {
                total_products: Number(
                    productResult[0].total_products
                ),

                total_orders: Number(
                    orderResult[0].total_orders
                ),

                total_customers: Number(
                    customerResult[0].total_customers
                ),

                total_revenue: Number(
                    revenueResult[0].total_revenue
                ),

                order_statuses: orderStatuses,

                recent_orders: recentOrders
            }
        });

    } catch (error) {
        console.error(
            "Get dashboard stats error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
}

module.exports = {
    getDashboardStats
};