const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createOrder,
    getOrders,
    cancelOrder
} = require("../controllers/orderController");

router.post(
    "/",
    authMiddleware,
    createOrder
);

router.get(
    "/",
    authMiddleware,
    getOrders
);

router.patch(
    "/:orderId/cancel",
    authMiddleware,
    cancelOrder
);

module.exports = router;