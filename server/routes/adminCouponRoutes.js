const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus
} = require("../controllers/adminCouponController");


// Get all coupons
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllCoupons
);


// Create coupon
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createCoupon
);


// Update coupon
router.put(
    "/:couponId",
    authMiddleware,
    adminMiddleware,
    updateCoupon
);


// Delete coupon
router.delete(
    "/:couponId",
    authMiddleware,
    adminMiddleware,
    deleteCoupon
);


// Toggle active/inactive
router.patch(
    "/:couponId/status",
    authMiddleware,
    adminMiddleware,
    toggleCouponStatus
);


module.exports = router;