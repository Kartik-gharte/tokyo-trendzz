const db = require("../config/db");

// Get all orders for admin
function getAllOrders(req, res) {
    const query = `
        SELECT
            o.id,
            o.user_id,
            o.subtotal,
            o.shipping_fee,
            o.discount,
            o.total_amount,
            o.payment_method,
            o.payment_status,
            o.order_status,
            o.created_at,
            u.name AS customer_name,
            u.email AS customer_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    `;

    db.query(query, (error, orders) => {
        if (error) {
            console.error("Get all orders error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch orders"
            });
        }

        return res.status(200).json({
            success: true,
            orders
        });
    });
}

module.exports = {
    getAllOrders
};