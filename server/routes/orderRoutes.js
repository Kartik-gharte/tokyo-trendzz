const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getOrders,
    cancelOrder
} = require("../controllers/orderController");

// Fetch the logged-in customer's orders.
router.get(
    "/",
    authMiddleware,
    getOrders
);

// Cancel an eligible order.
router.patch(
    "/:orderId/cancel",
    authMiddleware,
    cancelOrder
);

// Orders must be created through verified Razorpay checkout.
// Do not add a direct order-creation route here.

module.exports = router;