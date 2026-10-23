
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createRazorpayOrder,
    verifyRazorpayPayment
} = require("../controllers/paymentController");


/*
 * Create Razorpay order
 */
router.post(
    "/create-order",
    authMiddleware,
    createRazorpayOrder
);


/*
 * Verify Razorpay payment and create
 * the actual Tokyo Trendz online order.
 */
router.post(
    "/verify",
    authMiddleware,
    verifyRazorpayPayment
);


module.exports = router;
