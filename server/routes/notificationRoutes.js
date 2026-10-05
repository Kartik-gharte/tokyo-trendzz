const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} = require("../controllers/notificationController");


// Get all notifications
router.get(
    "/",
    authMiddleware,
    getNotifications
);


// Get unread notification count
router.get(
    "/unread-count",
    authMiddleware,
    getUnreadCount
);


// Mark one notification as read
router.patch(
    "/:notificationId/read",
    authMiddleware,
    markAsRead
);


// Mark all notifications as read
router.patch(
    "/read-all",
    authMiddleware,
    markAllAsRead
);


module.exports = router;