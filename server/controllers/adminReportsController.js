const db = require("../config/db").promise();


// Get sales report
async function getSalesReport(req, res) {
    try {
        const { startDate, endDate } = req.query;

        let dateCondition = "";
        const params = [];

        if (startDate) {
            dateCondition += " AND DATE(o.created_at) >= ?";
            params.push(startDate);
        }

        if (endDate) {
            dateCondition += " AND DATE(o.created_at) <= ?";
            params.push(endDate);
        }

        const [summary] = await db.query(
            `
            SELECT
                COUNT(*) AS total_orders,

                COALESCE(
                    SUM(o.subtotal),
                    0
                ) AS total_subtotal,

                COALESCE(
                    SUM(o.discount),
                    0
                ) AS total_discount,

                COALESCE(
                    SUM(o.shipping_fee),
                    0
                ) AS total_shipping,

                COALESCE(
                    SUM(o.total_amount),
                    0
                ) AS total_revenue

            FROM orders o

            WHERE o.order_status != 'cancelled'

            ${dateCondition}
            `,
            params
        );


        const [dailySales] = await db.query(
            `
            SELECT
                DATE(o.created_at) AS date,
                COUNT(*) AS orders,
                COALESCE(
                    SUM(o.total_amount),
                    0
                ) AS revenue

            FROM orders o

            WHERE o.order_status != 'cancelled'

            ${dateCondition}

            GROUP BY DATE(o.created_at)

            ORDER BY date DESC
            `,
            params
        );


        const [paymentMethods] = await db.query(
            `
            SELECT
                o.payment_method,
                COUNT(*) AS orders,
                COALESCE(
                    SUM(o.total_amount),
                    0
                ) AS revenue

            FROM orders o

            WHERE o.order_status != 'cancelled'

            ${dateCondition}

            GROUP BY o.payment_method

            ORDER BY revenue DESC
            `,
            params
        );


        const [orderStatuses] = await db.query(
            `
            SELECT
                o.order_status,
                COUNT(*) AS orders

            FROM orders o

            ${dateCondition.replace(
                "AND DATE(o.created_at)",
                "WHERE DATE(o.created_at)"
            )}

            GROUP BY o.order_status

            ORDER BY orders DESC
            `,
            params
        );


        return res.json({
            success: true,

            report: {
                summary: {
                    totalOrders: Number(
                        summary[0].total_orders
                    ),

                    totalSubtotal: Number(
                        summary[0].total_subtotal
                    ),

                    totalDiscount: Number(
                        summary[0].total_discount
                    ),

                    totalShipping: Number(
                        summary[0].total_shipping
                    ),

                    totalRevenue: Number(
                        summary[0].total_revenue
                    )
                },

                dailySales,

                paymentMethods,

                orderStatuses
            }
        });

    } catch (error) {

        console.error(
            "Get sales report error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to generate sales report"
        });
    }
}


// Get product sales report
async function getProductSalesReport(req, res) {
    try {
        const { startDate, endDate } = req.query;

        let dateCondition = "";
        const params = [];

        if (startDate) {
            dateCondition += " AND DATE(o.created_at) >= ?";
            params.push(startDate);
        }

        if (endDate) {
            dateCondition += " AND DATE(o.created_at) <= ?";
            params.push(endDate);
        }


        const [products] = await db.query(
            `
            SELECT

                oi.product_id,

                oi.product_name,

                SUM(oi.quantity) AS units_sold,

                COALESCE(
                    SUM(
                        oi.quantity * oi.price
                    ),
                    0
                ) AS product_revenue

            FROM order_items oi

            INNER JOIN orders o
                ON oi.order_id = o.id

            WHERE o.order_status != 'cancelled'

            ${dateCondition}

            GROUP BY
                oi.product_id,
                oi.product_name

            ORDER BY
                units_sold DESC
            `,
            params
        );


        return res.json({
            success: true,
            products
        });

    } catch (error) {

        console.error(
            "Get product sales report error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to generate product sales report"
        });
    }
}


module.exports = {
    getSalesReport,
    getProductSalesReport
};