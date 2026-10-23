const db = require("../config/db");
const { createNotification } = require("../utils/notificationHelper");

function createOrder(req, res) {
    return res.status(403).json({
        success: false,
        message:
            "Direct order creation is disabled. Please complete checkout through the secure payment process."
    });
}


function getOrders(req, res) {
    const userId = req.user.userId;

    const sql = `
        SELECT
            o.id,
            o.order_number,
            o.subtotal,
            o.discount,
            o.shipping_fee,
            o.total_amount,
            o.payment_method,
            o.payment_status,
            o.order_status,
            o.created_at,
            a.full_name,
            a.phone,
            a.address_line,
            a.city,
            a.state,
            a.postal_code,
            a.country,
            oi.id AS order_item_id,
            oi.product_id,
            oi.variant_id,
            oi.product_name,
            oi.size,
            oi.color,
            oi.quantity,
            oi.price
        FROM orders o
        INNER JOIN addresses a
            ON o.address_id = a.id
        INNER JOIN order_items oi
            ON o.id = oi.order_id
        WHERE o.user_id = ?
        ORDER BY
            o.created_at DESC,
            oi.id ASC
    `;

    db.query(
        sql,
        [userId],
        (error, results) => {
            if (error) {
                console.error(
                    "Get orders error:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to fetch orders"
                });
            }

            const ordersMap = {};

            results.forEach((row) => {
                if (!ordersMap[row.id]) {
                    ordersMap[row.id] = {
                        id: row.id,
                        orderNumber:
                            row.order_number,
                        subtotal:
                            Number(row.subtotal),
                        discount:
                            Number(row.discount),
                        shippingFee:
                            Number(row.shipping_fee),
                        totalAmount:
                            Number(row.total_amount),
                        paymentMethod:
                            row.payment_method,
                        paymentStatus:
                            row.payment_status,
                        orderStatus:
                            row.order_status,
                        createdAt:
                            row.created_at,
                        address: {
                            fullName:
                                row.full_name,
                            phone:
                                row.phone,
                            addressLine:
                                row.address_line,
                            city:
                                row.city,
                            state:
                                row.state,
                            postalCode:
                                row.postal_code,
                            country:
                                row.country
                        },
                        items: []
                    };
                }

                ordersMap[row.id].items.push({
                    id:
                        row.order_item_id,
                    productId:
                        row.product_id,
                    variantId:
                        row.variant_id,
                    productName:
                        row.product_name,
                    size:
                        row.size,
                    color:
                        row.color,
                    quantity:
                        row.quantity,
                    price:
                        Number(row.price)
                });
            });

            const orders = Object.values(
                ordersMap
            );

            return res.json({
                success: true,
                orders
            });
        }
    );
}


function rollbackOrder(
    connection,
    res,
    error,
    message,
    statusCode = 500
) {
    if (error) {
        console.error(
            "Order error:",
            error
        );
    }

    connection.rollback(() => {
        return res.status(statusCode).json({
            success: false,
            message
        });
    });
}


function cancelOrder(req, res) {
    const userId = req.user.userId;
    const orderId = req.params.orderId;

    const connection = db;

    connection.beginTransaction(
        (transactionError) => {
            if (transactionError) {
                console.error(
                    "Cancellation transaction start error:",
                    transactionError
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to cancel order"
                });
            }

            /*
             * Lock the order row so two cancellation/status
             * operations cannot process the same order at once.
             */

            const getOrderSql = `
                SELECT
                    id,
                    order_number,
                    order_status
                FROM orders
                WHERE id = ?
                AND user_id = ?
                FOR UPDATE
            `;

            connection.query(
                getOrderSql,
                [orderId, userId],
                (orderError, orders) => {
                    if (orderError) {
                        console.error(
                            "Get order for cancellation error:",
                            orderError
                        );

                        return rollbackOrder(
                            connection,
                            res,
                            orderError,
                            "Unable to cancel order"
                        );
                    }

                    if (orders.length === 0) {
                        return rollbackOrder(
                            connection,
                            res,
                            null,
                            "Order cannot be cancelled",
                            400
                        );
                    }

                    const order = orders[0];

                    if (
                        order.order_status !==
                        "placed"
                    ) {
                        return rollbackOrder(
                            connection,
                            res,
                            null,
                            "Order cannot be cancelled",
                            400
                        );
                    }

                    /*
                     * Get all order items.
                     */
                    const itemsSql = `
                        SELECT
                            variant_id,
                            quantity,
                            product_name,
                            size,
                            color
                        FROM order_items
                        WHERE order_id = ?
                    `;

                    connection.query(
                        itemsSql,
                        [orderId],
                        (itemsError, orderItems) => {
                            if (itemsError) {
                                return rollbackOrder(
                                    connection,
                                    res,
                                    itemsError,
                                    "Unable to read order items"
                                );
                            }

                            /*
                             * Restore stock one variant at a time.
                             *
                             * The variant is locked before updating.
                             */

                            const restoreStock = (
                                index
                            ) => {
                                if (
                                    index >=
                                    orderItems.length
                                ) {
                                    return updateOrderStatus();
                                }

                                const item =
                                    orderItems[index];

                                const lockVariantSql = `
                                    SELECT
                                        id,
                                        stock
                                    FROM product_variants
                                    WHERE id = ?
                                    FOR UPDATE
                                `;

                                connection.query(
                                    lockVariantSql,
                                    [item.variant_id],
                                    (
                                        variantError,
                                        variants
                                    ) => {
                                        if (
                                            variantError
                                        ) {
                                            return rollbackOrder(
                                                connection,
                                                res,
                                                variantError,
                                                "Unable to restore product stock"
                                            );
                                        }

                                        if (
                                            variants.length ===
                                            0
                                        ) {
                                            return rollbackOrder(
                                                connection,
                                                res,
                                                null,
                                                `${item.product_name} (${item.size} / ${item.color}) variant no longer exists`,
                                                400
                                            );
                                        }

                                        const updateStockSql = `
                                            UPDATE product_variants
                                            SET stock = stock + ?
                                            WHERE id = ?
                                        `;

                                        connection.query(
                                            updateStockSql,
                                            [
                                                item.quantity,
                                                item.variant_id
                                            ],
                                            (
                                                stockError
                                            ) => {
                                                if (
                                                    stockError
                                                ) {
                                                    return rollbackOrder(
                                                        connection,
                                                        res,
                                                        stockError,
                                                        "Unable to restore product stock"
                                                    );
                                                }

                                                restoreStock(
                                                    index + 1
                                                );
                                            }
                                        );
                                    }
                                );
                            };

                            const updateOrderStatus =
                                () => {
                                    const updateSql = `
                                        UPDATE orders
                                        SET order_status = 'cancelled'
                                        WHERE id = ?
                                        AND user_id = ?
                                        AND order_status = 'placed'
                                    `;

                                    connection.query(
                                        updateSql,
                                        [
                                            orderId,
                                            userId
                                        ],
                                        (
                                            updateError,
                                            result
                                        ) => {
                                            if (
                                                updateError
                                            ) {
                                                return rollbackOrder(
                                                    connection,
                                                    res,
                                                    updateError,
                                                    "Unable to cancel order"
                                                );
                                            }

                                            if (
                                                result.affectedRows ===
                                                0
                                            ) {
                                                return rollbackOrder(
                                                    connection,
                                                    res,
                                                    null,
                                                    "Order cannot be cancelled",
                                                    400
                                                );
                                            }

                                            /*
                                             * Create cancellation
                                             * notification.
                                             */
                                            const notificationSql = `
                                                INSERT INTO notifications (
                                                    user_id,
                                                    type,
                                                    title,
                                                    message
                                                )
                                                VALUES (?, ?, ?, ?)
                                            `;

                                            connection.query(
                                                notificationSql,
                                                [
                                                    userId,
                                                    "order_status",
                                                    "Order Cancelled",
                                                    `Your order ${order.order_number} has been cancelled.`
                                                ],
                                                (
                                                    notificationError
                                                ) => {
                                                    if (
                                                        notificationError
                                                    ) {
                                                        return rollbackOrder(
                                                            connection,
                                                            res,
                                                            notificationError,
                                                            "Unable to create cancellation notification"
                                                        );
                                                    }

                                                    connection.commit(
                                                        (
                                                            commitError
                                                        ) => {
                                                            if (
                                                                commitError
                                                            ) {
                                                                return rollbackOrder(
                                                                    connection,
                                                                    res,
                                                                    commitError,
                                                                    "Unable to complete order cancellation"
                                                                );
                                                            }

                                                            return res.json(
                                                                {
                                                                    success: true,
                                                                    message:
                                                                        "Order cancelled successfully"
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                };

                            restoreStock(0);
                        }
                    );
                }
            );
        }
    );
}


module.exports = {
    createOrder,
    getOrders,
    cancelOrder
};