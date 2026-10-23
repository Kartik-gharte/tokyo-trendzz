
const crypto = require("crypto");

const db = require("../config/db");
const razorpay = require("../config/razorpay");

const COD_ADVANCE_AMOUNT = 120;

/*
============================================================
DATABASE HELPERS
============================================================
*/

function queryAsync(connection, sql, params = []) {
    return connection.promise().query(sql, params).then(([rows]) => rows);
}

function beginTransaction(connection) {
    return new Promise((resolve, reject) => {
        connection.beginTransaction((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

function commitTransaction(connection) {
    return new Promise((resolve, reject) => {
        connection.commit((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

function rollbackTransaction(connection) {
    return new Promise((resolve) => {
        connection.rollback(() => resolve());
    });
}

async function failTransaction(connection, res, message, statusCode = 500, error = null) {
    if (error) {
        console.error("Payment transaction error:", error);
    }

    await rollbackTransaction(connection);

    return res.status(statusCode).json({
        success: false,
        message
    });
}

/*
============================================================
PRICE AND COUPON HELPERS
============================================================
*/

function calculateDiscount(subtotal, coupon) {
    let discount = 0;

    if (coupon.discount_type === "percentage") {
        discount =
            subtotal * (Number(coupon.discount_value) / 100);

        if (
            coupon.maximum_discount !== null &&
            coupon.maximum_discount !== undefined &&
            discount > Number(coupon.maximum_discount)
        ) {
            discount = Number(coupon.maximum_discount);
        }
    } else if (coupon.discount_type === "fixed") {
        discount = Number(coupon.discount_value);
    }

    return Number(Math.min(discount, subtotal).toFixed(2));
}

function validateCoupon(coupon, subtotal) {
    if (!coupon.is_active) {
        return "This coupon is inactive";
    }

    if (
        coupon.expiry_date &&
        new Date(coupon.expiry_date) <= new Date()
    ) {
        return "This coupon has expired";
    }

    if (
        coupon.usage_limit !== null &&
        coupon.usage_limit !== undefined &&
        Number(coupon.used_count) >= Number(coupon.usage_limit)
    ) {
        return "This coupon usage limit has been reached";
    }

    if (
        coupon.minimum_order_amount !== null &&
        coupon.minimum_order_amount !== undefined &&
        subtotal < Number(coupon.minimum_order_amount)
    ) {
        return `Minimum order amount is ₹${Number(
            coupon.minimum_order_amount
        ).toLocaleString("en-IN")}`;
    }

    return null;
}

async function getCartItems(connection, userId) {
    return queryAsync(
        connection,
        `
        SELECT
            ci.id AS cart_item_id,
            ci.product_id,
            ci.variant_id,
            ci.quantity,
            p.name AS product_name,
            COALESCE(p.discount_price, p.price) AS price,
            pv.size,
            pv.color,
            pv.stock
        FROM cart_items ci
        INNER JOIN cart c ON ci.cart_id = c.id
        INNER JOIN products p ON ci.product_id = p.id
        INNER JOIN product_variants pv ON ci.variant_id = pv.id
        WHERE c.user_id = ?
        `,
        [userId]
    );
}

function calculateSubtotal(cartItems) {
    let subtotal = 0;

    for (const item of cartItems) {
        const quantity = Number(item.quantity);
        const price = Number(item.price);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error("Invalid cart quantity");
        }

        if (!Number.isFinite(price) || price < 0) {
            throw new Error("Invalid product price");
        }

        if (Number(item.stock) < quantity) {
            throw new Error(
                `${item.product_name} (${item.size} / ${item.color}) has insufficient stock`
            );
        }

        subtotal += price * quantity;
    }

    return Number(subtotal.toFixed(2));
}

async function getCoupon(connection, couponCode, subtotal, lock = false) {
    if (!couponCode || !String(couponCode).trim()) {
        return {
            discount: 0,
            couponId: null
        };
    }

    const normalizedCode = String(couponCode).trim().toUpperCase();

    const couponRows = await queryAsync(
        connection,
        `
        SELECT
            id,
            code,
            discount_type,
            discount_value,
            minimum_order_amount,
            maximum_discount,
            usage_limit,
            used_count,
            expiry_date,
            is_active
        FROM coupons
        WHERE code = ?
        LIMIT 1
        ${lock ? "FOR UPDATE" : ""}
        `,
        [normalizedCode]
    );

    if (couponRows.length === 0) {
        throw new Error("Invalid coupon code");
    }

    const coupon = couponRows[0];
    const validationError = validateCoupon(coupon, subtotal);

    if (validationError) {
        throw new Error(validationError);
    }

    return {
        discount: calculateDiscount(subtotal, coupon),
        couponId: coupon.id
    };
}

/*
============================================================
CREATE RAZORPAY ORDER
============================================================

Online payment:
    Pay the full order total.

COD:
    Pay ₹120 in advance, or the total if it is below ₹120.

No Tokyo Trendz database order is created at this stage.
*/

async function createRazorpayOrder(req, res) {
    try {
        const userId = req.user.userId;
        const { couponCode } = req.body;

        const paymentMethod =
            String(req.body.paymentMethod || "online").toLowerCase();

        if (!["online", "cod"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
            });
        }

        const cartItems = await getCartItems(db, userId);

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        const subtotal = calculateSubtotal(cartItems);

        const { discount, couponId } = await getCoupon(
            db,
            couponCode,
            subtotal
        );

        const finalTotal = Number(
            Math.max(0, subtotal - discount).toFixed(2)
        );

        if (finalTotal <= 0) {
            return res.status(400).json({
                success: false,
                message: "Order total must be greater than ₹0"
            });
        }

        const advanceAmount =
            paymentMethod === "cod"
                ? Math.min(COD_ADVANCE_AMOUNT, finalTotal)
                : finalTotal;

        const amountInPaise = Math.round(advanceAmount * 100);

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `tt_${Date.now()}`,
            notes: {
                userId: String(userId),
                paymentMethod,
                finalTotal: finalTotal.toFixed(2),
                advanceAmount: advanceAmount.toFixed(2)
            }
        });

        const orderData = {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            receipt: razorpayOrder.receipt,
            subtotal,
            discount,
            finalTotal,
            advanceAmount,
            balanceDue: Number((finalTotal - advanceAmount).toFixed(2)),
            paymentMethod,
            couponId
        };

        // Return both properties to support either frontend response format.
        return res.status(201).json({
            success: true,
            message: "Razorpay order created successfully",
            data: orderData,
            order: orderData
        });
    } catch (error) {
        console.error("Razorpay create order error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create Razorpay order"
        });
    }
}

/*
============================================================
VERIFY RAZORPAY PAYMENT AND CREATE TOKYO TRENDZ ORDER
============================================================
*/

async function verifyRazorpayPayment(req, res) {
    const userId = req.user.userId;

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        fullName,
        phone,
        address,
        city,
        state,
        postalCode,
        landmark,
        couponCode
    } = req.body;

    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
    ) {
        return res.status(400).json({
            success: false,
            message: "Payment verification details are missing"
        });
    }

    if (
        !fullName ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !postalCode
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required address fields"
        });
    }

    /*
    STEP 1: Verify Razorpay signature.
    */

    try {
        const secret = process.env.RAZORPAY_KEY_SECRET;

        if (!secret) {
            console.error("RAZORPAY_KEY_SECRET is not configured.");

            return res.status(500).json({
                success: false,
                message: "Payment verification is not configured"
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const suppliedSignature = String(razorpay_signature);

        const generatedBuffer = Buffer.from(generatedSignature, "utf8");
        const suppliedBuffer = Buffer.from(suppliedSignature, "utf8");

        if (
            generatedBuffer.length !== suppliedBuffer.length ||
            !crypto.timingSafeEqual(generatedBuffer, suppliedBuffer)
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }
    } catch (error) {
        console.error("Razorpay signature error:", error);

        return res.status(400).json({
            success: false,
            message: "Invalid payment signature"
        });
    }

    /*
    STEP 2: Fetch the order and payment directly from Razorpay.
    */

    let razorpayOrder;
    let razorpayPayment;

    try {
        razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
        razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (error) {
        console.error("Razorpay server verification error:", error);

        return res.status(400).json({
            success: false,
            message: "Unable to verify payment with Razorpay"
        });
    }

    if (
        razorpayPayment.order_id !== razorpay_order_id ||
        razorpayPayment.status !== "captured" ||
        razorpayOrder.status !== "paid"
    ) {
        return res.status(400).json({
            success: false,
            message: "Razorpay payment has not been successfully captured"
        });
    }

    /*
    The payment mode and customer ID come from notes written by our
    backend when the Razorpay order was created.

    Legacy Razorpay orders without notes are accepted for full online
    payments only, never for COD advance payments.
    */

    const notes = razorpayOrder.notes || {};
    let paymentMethod = String(notes.paymentMethod || "").toLowerCase();

    if (!paymentMethod) {
        paymentMethod = "online";
    }

    if (!["online", "cod"].includes(paymentMethod)) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment order configuration"
        });
    }

    if (notes.userId && String(notes.userId) !== String(userId)) {
        return res.status(403).json({
            success: false,
            message: "This payment belongs to another customer"
        });
    }

    // Never allow a COD payment without a backend-created COD Razorpay order.
    if (paymentMethod === "cod" && !notes.userId) {
        return res.status(400).json({
            success: false,
            message: "COD advance payment could not be verified"
        });
    }

    if (
        notes.paymentMethod &&
        !["online", "cod"].includes(notes.paymentMethod)
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment method"
        });
    }

    /*
    STEP 3: Begin database transaction.
    */

    /*
    /*
    STEP 3: Begin database transaction.

    db is a MySQL pool. Get a dedicated connection
    and release it when the transaction finishes.
    */

    let connection;

    try {
connection = await new Promise((resolve, reject) => {
    db.getConnection((error, connection) => {
        if (error) {
            reject(error);
        } else {
            resolve(connection);
        }
    });
});
        await beginTransaction(connection);

        /*
        STEP 4: Idempotency check.
        */

        const existingOrders = await queryAsync(
            connection,
            `
            SELECT
                id,
                user_id,
                order_number,
                subtotal,
                discount,
                shipping_fee,
                total_amount,
                payment_method,
                payment_status,
                order_status,
                advance_paid,
                balance_due
            FROM orders
            WHERE razorpay_order_id = ?
               OR razorpay_payment_id = ?
            LIMIT 1
            FOR UPDATE
            `,
            [razorpay_order_id, razorpay_payment_id]
        );

        if (existingOrders.length > 0) {
            const existing = existingOrders[0];

            if (String(existing.user_id) !== String(userId)) {
                return await failTransaction(
                    connection,
                    res,
                    "Unable to verify this payment",
                    403
                );
            }

            await commitTransaction(connection);

            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                order: {
                    id: existing.id,
                    orderNumber: existing.order_number,
                    subtotal: Number(existing.subtotal),
                    discount: Number(existing.discount),
                    shippingFee: Number(existing.shipping_fee),
                    totalAmount: Number(existing.total_amount),
                    paymentMethod: existing.payment_method,
                    paymentStatus: existing.payment_status,
                    orderStatus: existing.order_status,
                    advancePaid: Number(existing.advance_paid || 0),
                    balanceDue: Number(existing.balance_due || 0)
                }
            });
        }

        /*
        STEP 5: Read cart and check stock under transaction.
        */

        const cartItems = await getCartItems(connection, userId);

        if (cartItems.length === 0) {
            return await failTransaction(
                connection,
                res,
                "Your cart is empty",
                400
            );
        }

        for (const item of cartItems) {
            const variants = await queryAsync(
                connection,
                `
                SELECT id, stock, size, color
                FROM product_variants
                WHERE id = ?
                FOR UPDATE
                `,
                [item.variant_id]
            );

            if (variants.length === 0) {
                return await failTransaction(
                    connection,
                    res,
                    `${item.product_name} variant is no longer available`,
                    400
                );
            }

            const variant = variants[0];

            if (Number(variant.stock) < Number(item.quantity)) {
                return await failTransaction(
                    connection,
                    res,
                    `${item.product_name} (${variant.size} / ${variant.color}) has insufficient stock`,
                    400
                );
            }

            item.stock = Number(variant.stock);
            item.size = variant.size;
            item.color = variant.color;
        }

        const subtotal = calculateSubtotal(cartItems);
        const shippingFee = 0;

        /*
        STEP 6: Revalidate coupon under transaction.
        */

        let couponResult;

        try {
            couponResult = await getCoupon(
                connection,
                couponCode,
                subtotal,
                true
            );
        } catch (couponError) {
            return await failTransaction(
                connection,
                res,
                couponError.message,
                400
            );
        }

        const { discount, couponId } = couponResult;

        const totalAmount = Number(
            (subtotal - discount + shippingFee).toFixed(2)
        );

        if (totalAmount <= 0) {
            return await failTransaction(
                connection,
                res,
                "Order total must be greater than ₹0",
                400
            );
        }

        /*
        STEP 7: Verify payment amount.

        Online: full amount.
        COD: ₹120 or the full total if below ₹120.
        */

        const advanceAmount =
            paymentMethod === "cod"
                ? Math.min(COD_ADVANCE_AMOUNT, totalAmount)
                : totalAmount;

        const balanceDue = Number(
            (totalAmount - advanceAmount).toFixed(2)
        );

        const expectedAmount = Math.round(advanceAmount * 100);

        if (Number(razorpayOrder.amount) !== expectedAmount) {
            return await failTransaction(
                connection,
                res,
                "Payment amount does not match the current order total",
                400
            );
        }

        if (
            notes.finalTotal &&
            Math.round(Number(notes.finalTotal) * 100) !==
                Math.round(totalAmount * 100)
        ) {
            return await failTransaction(
                connection,
                res,
                "The order total changed after payment was initiated. Please contact support.",
                400
            );
        }

        if (
            notes.advanceAmount &&
            Math.round(Number(notes.advanceAmount) * 100) !== expectedAmount
        ) {
            return await failTransaction(
                connection,
                res,
                "Payment advance amount does not match",
                400
            );
        }

        /*
        STEP 8: Save delivery address.
        */

        const addressLine =
            landmark && String(landmark).trim()
                ? `${address}, ${String(landmark).trim()}`
                : address;

        const addressResult = await queryAsync(
            connection,
            `
            INSERT INTO addresses (
                user_id,
                full_name,
                phone,
                address_line,
                city,
                state,
                postal_code,
                country,
                is_default
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'India', 0)
            `,
            [
                userId,
                fullName,
                phone,
                addressLine,
                city,
                state,
                postalCode
            ]
        );

        const addressId = addressResult.insertId;
        const orderNumber = `TT-${Date.now()}-${userId}`;

        /*
        STEP 9: Create order.
        */

        const paymentStatus =
            paymentMethod === "online" ? "paid" : "pending";

        const orderResult = await queryAsync(
            connection,
            `
            INSERT INTO orders (
                user_id,
                address_id,
                order_number,
                subtotal,
                discount,
                shipping_fee,
                total_amount,
                payment_method,
                razorpay_order_id,
                razorpay_payment_id,
                payment_status,
                order_status,
                advance_paid,
                balance_due
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'placed', ?, ?)
            `,
            [
                userId,
                addressId,
                orderNumber,
                subtotal,
                discount,
                shippingFee,
                totalAmount,
                paymentMethod,
                razorpay_order_id,
                razorpay_payment_id,
                paymentStatus,
                advanceAmount,
                balanceDue
            ]
        );

        const orderId = orderResult.insertId;

        /*
        STEP 10: Create order items.
        */

        const orderItemValues = cartItems.map((item) => [
            orderId,
            item.product_id,
            item.variant_id,
            item.product_name,
            item.size,
            item.color,
            item.quantity,
            item.price
        ]);

        await queryAsync(
            connection,
            `
            INSERT INTO order_items (
                order_id,
                product_id,
                variant_id,
                product_name,
                size,
                color,
                quantity,
                price
            )
            VALUES ?
            `,
            [orderItemValues]
        );

        /*
        STEP 11: Deduct stock.
        */

        for (const item of cartItems) {
            const stockResult = await queryAsync(
                connection,
                `
                UPDATE product_variants
                SET stock = stock - ?
                WHERE id = ?
                  AND stock >= ?
                `,
                [
                    item.quantity,
                    item.variant_id,
                    item.quantity
                ]
            );

            if (stockResult.affectedRows === 0) {
                return await failTransaction(
                    connection,
                    res,
                    `${item.product_name} (${item.size} / ${item.color}) is out of stock`,
                    400
                );
            }
        }

        /*
        STEP 12: Clear cart.
        */

        await queryAsync(
            connection,
            `
            DELETE ci
            FROM cart_items ci
            INNER JOIN cart c ON ci.cart_id = c.id
            WHERE c.user_id = ?
            `,
            [userId]
        );

        /*
        STEP 13: Update coupon usage.
        */

        if (couponId) {
            await queryAsync(
                connection,
                `
                UPDATE coupons
                SET used_count = used_count + 1
                WHERE id = ?
                `,
                [couponId]
            );
        }

        /*
        STEP 14: Create notification.
        */

        const notificationMessage =
            paymentMethod === "cod"
                ? `Your order ${orderNumber} has been placed. ₹${advanceAmount.toFixed(2)} advance paid; ₹${balanceDue.toFixed(2)} is due on delivery.`
                : `Your order ${orderNumber} has been placed successfully.`;

        await queryAsync(
            connection,
            `
            INSERT INTO notifications (
                user_id,
                type,
                title,
                message
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                userId,
                "order_placed",
                "Order Placed",
                notificationMessage
            ]
        );

        /*
        STEP 15: Commit everything.
        */

        await commitTransaction(connection);

        return res.status(201).json({
            success: true,
            message: "Payment verified and order placed successfully",
            order: {
                id: orderId,
                orderNumber,
                subtotal,
                discount,
                shippingFee,
                totalAmount,
                paymentMethod,
                paymentStatus,
                orderStatus: "placed",
                advancePaid: advanceAmount,
                balanceDue,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id
            }
        });
    } catch (error) {
        console.error(
            "Payment verification/order creation error:",
            error
        );

        if (connection) {
            await rollbackTransaction(connection);
        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to complete payment verification and order creation"
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment
};