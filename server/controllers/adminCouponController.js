const db = require("../config/db").promise();
// Get all coupons
async function getAllCoupons(req, res) {
    try {
        const [coupons] = await db.query(`
            SELECT
                id,
                code,
                discount_type,
                discount_value,
                minimum_order_amount,
                maximum_discount,
                expiry_date,
                usage_limit,
                used_count,
                is_active,
                created_at
            FROM coupons
            ORDER BY id DESC
        `);

        res.json({
            success: true,
            coupons
        });
    } catch (error) {
        console.error("Get coupons error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch coupons"
        });
    }
}


// Create coupon
async function createCoupon(req, res) {
    try {
        const {
            code,
            discount_type,
            discount_value,
            minimum_order_amount,
            maximum_discount,
            expiry_date,
            usage_limit,
            is_active
        } = req.body;

        if (!code || !discount_type || !discount_value || !expiry_date) {
            return res.status(400).json({
                success: false,
                message: "Code, discount type, discount value and expiry date are required"
            });
        }

        if (!["percentage", "fixed"].includes(discount_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid discount type"
            });
        }

        if (Number(discount_value) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Discount value must be greater than 0"
            });
        }

        if (
            discount_type === "percentage" &&
            Number(discount_value) > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Percentage discount cannot exceed 100%"
            });
        }

        const normalizedCode = code.trim().toUpperCase();

        const [existingCoupon] = await db.query(
            "SELECT id FROM coupons WHERE code = ?",
            [normalizedCode]
        );

        if (existingCoupon.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Coupon code already exists"
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO coupons
            (
                code,
                discount_type,
                discount_value,
                minimum_order_amount,
                maximum_discount,
                expiry_date,
                usage_limit,
                is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                normalizedCode,
                discount_type,
                Number(discount_value),
                minimum_order_amount || 0,
                maximum_discount || null,
                expiry_date,
                usage_limit || 1,
                is_active === undefined ? 1 : Number(is_active)
            ]
        );

        res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            couponId: result.insertId
        });
    } catch (error) {
        console.error("Create coupon error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create coupon"
        });
    }
}


// Update coupon
async function updateCoupon(req, res) {
    try {
        const { couponId } = req.params;

        const {
            code,
            discount_type,
            discount_value,
            minimum_order_amount,
            maximum_discount,
            expiry_date,
            usage_limit,
            is_active
        } = req.body;

        if (!code || !discount_type || !discount_value || !expiry_date) {
            return res.status(400).json({
                success: false,
                message: "Code, discount type, discount value and expiry date are required"
            });
        }

        if (!["percentage", "fixed"].includes(discount_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid discount type"
            });
        }

        if (Number(discount_value) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Discount value must be greater than 0"
            });
        }

        if (
            discount_type === "percentage" &&
            Number(discount_value) > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Percentage discount cannot exceed 100%"
            });
        }

        const normalizedCode = code.trim().toUpperCase();

        const [coupon] = await db.query(
            "SELECT id FROM coupons WHERE id = ?",
            [couponId]
        );

        if (coupon.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        const [duplicate] = await db.query(
            "SELECT id FROM coupons WHERE code = ? AND id != ?",
            [normalizedCode, couponId]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Coupon code already exists"
            });
        }

        await db.query(
            `
            UPDATE coupons
            SET
                code = ?,
                discount_type = ?,
                discount_value = ?,
                minimum_order_amount = ?,
                maximum_discount = ?,
                expiry_date = ?,
                usage_limit = ?,
                is_active = ?
            WHERE id = ?
            `,
            [
                normalizedCode,
                discount_type,
                Number(discount_value),
                minimum_order_amount || 0,
                maximum_discount || null,
                expiry_date,
                usage_limit || 1,
                is_active === undefined ? 1 : Number(is_active),
                couponId
            ]
        );

        res.json({
            success: true,
            message: "Coupon updated successfully"
        });
    } catch (error) {
        console.error("Update coupon error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update coupon"
        });
    }
}


// Delete coupon
async function deleteCoupon(req, res) {
    try {
        const { couponId } = req.params;

        const [coupon] = await db.query(
            "SELECT id FROM coupons WHERE id = ?",
            [couponId]
        );

        if (coupon.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        await db.query(
            "DELETE FROM coupons WHERE id = ?",
            [couponId]
        );

        res.json({
            success: true,
            message: "Coupon deleted successfully"
        });
    } catch (error) {
        console.error("Delete coupon error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete coupon"
        });
    }
}


// Toggle active status
async function toggleCouponStatus(req, res) {
    try {
        const { couponId } = req.params;

        const [coupon] = await db.query(
            "SELECT id, is_active FROM coupons WHERE id = ?",
            [couponId]
        );

        if (coupon.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        const newStatus = coupon[0].is_active ? 0 : 1;

        await db.query(
            `
            UPDATE coupons
            SET is_active = ?
            WHERE id = ?
            `,
            [newStatus, couponId]
        );

        res.json({
            success: true,
            message: newStatus
                ? "Coupon activated successfully"
                : "Coupon deactivated successfully",
            is_active: newStatus
        });
    } catch (error) {
        console.error("Toggle coupon status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update coupon status"
        });
    }
}


module.exports = {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus
};