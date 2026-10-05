const db = require("../config/db").promise();


// Get all users
async function getAllUsers(req, res) {
    try {
        const [users] = await db.query(`
            SELECT
                u.id,
                u.name,
                u.email,
                u.phone,
                u.role,
                u.created_at,
                u.updated_at,
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
            GROUP BY
                u.id,
                u.name,
                u.email,
                u.phone,
                u.role,
                u.created_at,
                u.updated_at
            ORDER BY u.created_at DESC
        `);

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
}


// Get single user details
async function getUserById(req, res) {
    try {
        const { userId } = req.params;

        const [users] = await db.query(
            `
            SELECT
                id,
                name,
                email,
                phone,
                role,
                created_at,
                updated_at
            FROM users
            WHERE id = ?
            `,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        const [orders] = await db.query(
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
            [userId]
        );

        res.json({
            success: true,
            user,
            orders
        });
    } catch (error) {
        console.error("Get user details error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user details"
        });
    }
}


// Update user role
async function updateUserRole(req, res) {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!["customer", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const [users] = await db.query(
            "SELECT id, role FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent the currently logged-in admin
        // from accidentally changing their own role.
        if (Number(userId) === Number(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot change your own role"
            });
        }

        await db.query(
            "UPDATE users SET role = ? WHERE id = ?",
            [role, userId]
        );

        res.json({
            success: true,
            message: "User role updated successfully"
        });
    } catch (error) {
        console.error("Update user role error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user role"
        });
    }
}


module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole
};