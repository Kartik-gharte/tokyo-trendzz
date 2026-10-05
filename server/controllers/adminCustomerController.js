const db = require("../config/db");

async function getAllCustomers(req, res) {
    try {
        const [customers] = await db.promise().query(`
            SELECT
                u.id,
                u.name,
                u.email,
                u.created_at,
                COUNT(DISTINCT o.id) AS order_count,
                COALESCE(
                    SUM(
                        CASE
                            WHEN o.order_status != 'cancelled'
                            THEN o.total_amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_spent
            FROM users u
            LEFT JOIN orders o
                ON u.id = o.user_id
            WHERE u.role = 'customer'
            GROUP BY
                u.id,
                u.name,
                u.email,
                u.created_at
            ORDER BY u.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            customers
        });
    } catch (error) {
        console.error(
            "Get all customers error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customers"
        });
    }
}

async function getCustomerById(req, res) {
    try {
        const { customerId } = req.params;

        const [customers] = await db.promise().query(
            `
            SELECT
                u.id,
                u.name,
                u.email,
                u.created_at
            FROM users u
            WHERE u.id = ?
              AND u.role = 'customer'
            `,
            [customerId]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const customer = customers[0];

        const [orders] = await db.promise().query(
            `
            SELECT
                id,
                order_number,
                total_amount,
                payment_method,
                payment_status,
                order_status,
                created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
            `,
            [customerId]
        );

        return res.status(200).json({
            success: true,
            customer,
            orders
        });
    } catch (error) {
        console.error(
            "Get customer details error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer details"
        });
    }
}

module.exports = {
    getAllCustomers,
    getCustomerById
};