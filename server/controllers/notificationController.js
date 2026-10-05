const db = require("../config/db").promise();

// Get notifications for logged-in user
async function getNotifications(req, res) {
    try {
        const userId = req.user.userId;

        const [notifications] = await db.query(
            `
            SELECT
                id,
                type,
                title,
                message,
                is_read,
                created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
            `,
            [userId]
        );

        return res.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error("Get notifications error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
}


// Get unread notification count
async function getUnreadCount(req, res) {
    try {
        const userId = req.user.userId;

        const [result] = await db.query(
            `
            SELECT COUNT(*) AS unread_count
            FROM notifications
            WHERE user_id = ?
            AND is_read = 0
            `,
            [userId]
        );

        return res.json({
            success: true,
            unreadCount: Number(result[0].unread_count)
        });
    } catch (error) {
        console.error("Get unread notification count error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch unread notification count"
        });
    }
}


// Mark one notification as read
async function markAsRead(req, res) {
    try {
        const userId = req.user.userId;
        const { notificationId } = req.params;

        const [result] = await db.query(
            `
            UPDATE notifications
            SET is_read = 1
            WHERE id = ?
            AND user_id = ?
            `,
            [notificationId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        return res.json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (error) {
        console.error("Mark notification as read error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to mark notification as read"
        });
    }
}


// Mark all notifications as read
async function markAllAsRead(req, res) {
    try {
        const userId = req.user.userId;

        await db.query(
            `
            UPDATE notifications
            SET is_read = 1
            WHERE user_id = ?
            AND is_read = 0
            `,
            [userId]
        );

        return res.json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("Mark all notifications as read error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to mark all notifications as read"
        });
    }
}


module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
