const db = require("../config/db").promise();

async function validateCoupon(req, res) {
    try {
        const { code, orderAmount } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required"
            });
        }

        const amount = Number(orderAmount);

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid order amount is required"
            });
        }

        const normalizedCode = code.trim().toUpperCase();

        const [coupons] = await db.query(
            `
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
                is_active
            FROM coupons
            WHERE code = ?
            LIMIT 1
            `,
            [normalizedCode]
        );

        if (coupons.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Invalid coupon code"
            });
        }

        const coupon = coupons[0];

        if (!coupon.is_active) {
            return res.status(400).json({
                success: false,
                message: "This coupon is inactive"
            });
        }

        if (new Date(coupon.expiry_date) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "This coupon has expired"
            });
        }

        if (
            coupon.usage_limit !== null &&
            Number(coupon.used_count) >= Number(coupon.usage_limit)
        ) {
            return res.status(400).json({
                success: false,
                message: "This coupon usage limit has been reached"
            });
        }

        if (amount < Number(coupon.minimum_order_amount)) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount is ₹${Number(
                    coupon.minimum_order_amount
                ).toFixed(2)}`
            });
        }

        let discount = 0;

        if (coupon.discount_type === "percentage") {
            discount =
                amount * (Number(coupon.discount_value) / 100);
        } else if (coupon.discount_type === "fixed") {
            discount = Number(coupon.discount_value);
        }

        if (
            coupon.maximum_discount !== null &&
            Number(coupon.maximum_discount) > 0
        ) {
            discount = Math.min(
                discount,
                Number(coupon.maximum_discount)
            );
        }

        discount = Math.min(discount, amount);

        const finalAmount = amount - discount;

        return res.json({
            success: true,
            message: "Coupon applied successfully",
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: Number(coupon.discount_value)
            },
            discount: Number(discount.toFixed(2)),
            finalAmount: Number(finalAmount.toFixed(2))
        });
    } catch (error) {
        console.error("Validate coupon error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to validate coupon"
        });
    }
}

module.exports = {
    validateCoupon
};