
const db = require("../config/db");
const { createNotification } = require("../utils/notificationHelper");
const { sendOrderStatusEmail } = require("../utils/emailService");

async function getAllOrders(req, res) {
    try {
        const [orders] = await db.promise().query(`
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
            INNER JOIN users u
                ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Get all orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "placed",
            "confirmed",
            "packed",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        // Fetch the order and customer email before updating.
        const [orders] = await db.promise().query(
            `
            SELECT
                o.id,
                o.user_id,
                o.order_number,
                o.order_status,
                u.name AS customer_name,
                u.email AS customer_email
            FROM orders o
            INNER JOIN users u
                ON o.user_id = u.id
            WHERE o.id = ?
            `,
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const order = orders[0];

        // Do nothing if the status has not changed.
        if (order.order_status === status) {
            return res.status(200).json({
                success: true,
                message: "Order status is already set to this value"
            });
        }

        // Preserve the existing order-status update.
        const [result] = await db.promise().query(
            `
            UPDATE orders
            SET order_status = ?
            WHERE id = ?
            `,
            [status, orderId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Existing in-app notification messages.
        const notificationDetails = {
            confirmed: {
                title: "Order Confirmed",
                message: `Your order ${order.order_number} has been confirmed.`
            },

            packed: {
                title: "Order Packed",
                message: `Your order ${order.order_number} has been packed.`
            },

            shipped: {
                title: "Order Shipped",
                message: `Your order ${order.order_number} has been shipped.`
            },

            out_for_delivery: {
                title: "Out for Delivery",
                message: `Your order ${order.order_number} is out for delivery.`
            },

            delivered: {
                title: "Order Delivered",
                message: `Your order ${order.order_number} has been delivered.`
            },

            cancelled: {
                title: "Order Cancelled",
                message: `Your order ${order.order_number} has been cancelled.`
            },

            placed: {
                title: "Order Status Updated",
                message: `Your order ${order.order_number} is now placed.`
            }
        };

        const notification = notificationDetails[status];

        // Preserve the existing in-app notification.
        await createNotification(
            order.user_id,
            "order_status",
            notification.title,
            notification.message
        );

        // Send the customer an email without allowing email errors
        // to undo or interrupt the successful order-status update.
        try {
            await sendOrderStatusEmail({
                to: order.customer_email,
                customerName: order.customer_name,
                orderNumber: order.order_number || order.id,
                status
            });

            console.log(
                `Order status email sent for order ${order.id} (${status}).`
            );
        } catch (emailError) {
            console.error(
                `Order status updated, but email failed for order ${order.id}:`,
                emailError.message
            );
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully"
        });

    } catch (error) {
        console.error("Update order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update order status"
        });
    }
}

module.exports = {
    getAllOrders,
    updateOrderStatus
};
