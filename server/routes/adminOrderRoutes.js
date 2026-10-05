
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllOrders,
    updateOrderStatus
} = require("../controllers/adminOrderController");

// Get all customer orders
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllOrders
);

// Update order status
router.patch(
    "/:orderId/status",
    authMiddleware,
    adminMiddleware,
    updateOrderStatus
);

module.exports = router;
