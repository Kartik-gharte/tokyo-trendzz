const db = require("../config/db");

// Get user's cart
function getCart(req, res) {
    const userId = req.user.userId;

    const sql = `
        SELECT
            ci.id AS cart_item_id,
            ci.product_id,
            ci.variant_id,
            ci.quantity,

            p.name,
            p.brand,
            p.price,
            p.discount_price,

            pv.size,
            pv.color,
            pv.stock,

            pi.image_url

        FROM cart c

        INNER JOIN cart_items ci
            ON c.id = ci.cart_id

        INNER JOIN products p
            ON ci.product_id = p.id

        INNER JOIN product_variants pv
            ON ci.variant_id = pv.id

        LEFT JOIN product_images pi
            ON p.id = pi.product_id
            AND pi.is_primary = 1

        WHERE c.user_id = ?

        ORDER BY ci.id DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Get cart error:", err);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch cart"
            });
        }

        res.json({
            success: true,
            items: results
        });
    });
}


// Add item to cart
function addToCart(req, res) {
    const userId = req.user.userId;

    const {
        productId,
        variantId,
        quantity = 1
    } = req.body;

    if (!productId || !variantId) {
        return res.status(400).json({
            success: false,
            message: "Product and variant are required"
        });
    }

    if (quantity < 1) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be at least 1"
        });
    }

    // Check whether cart exists
    const findCartSql = `
        SELECT id
        FROM cart
        WHERE user_id = ?
    `;

    db.query(findCartSql, [userId], (err, cartResults) => {
        if (err) {
            console.error("Find cart error:", err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        function continueWithCart(cartId) {
            const findItemSql = `
                SELECT id, quantity
                FROM cart_items
                WHERE cart_id = ?
                AND product_id = ?
                AND variant_id = ?
            `;

            db.query(
                findItemSql,
                [cartId, productId, variantId],
                (err, itemResults) => {
                    if (err) {
                        console.error("Find cart item error:", err);

                        return res.status(500).json({
                            success: false,
                            message: "Database error"
                        });
                    }

                    if (itemResults.length > 0) {
                        const newQuantity =
                            itemResults[0].quantity + quantity;

                        const updateSql = `
                            UPDATE cart_items
                            SET quantity = ?
                            WHERE id = ?
                        `;

                        db.query(
                            updateSql,
                            [
                                newQuantity,
                                itemResults[0].id
                            ],
                            (err) => {
                                if (err) {
                                    console.error(
                                        "Update cart item error:",
                                        err
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message: "Unable to update cart"
                                    });
                                }

                                res.json({
                                    success: true,
                                    message: "Cart updated successfully"
                                });
                            }
                        );

                        return;
                    }

                    const insertItemSql = `
                        INSERT INTO cart_items
                        (
                            cart_id,
                            product_id,
                            variant_id,
                            quantity
                        )
                        VALUES (?, ?, ?, ?)
                    `;

                    db.query(
                        insertItemSql,
                        [
                            cartId,
                            productId,
                            variantId,
                            quantity
                        ],
                        (err) => {
                            if (err) {
                                console.error(
                                    "Add cart item error:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Unable to add item to cart"
                                });
                            }

                            res.status(201).json({
                                success: true,
                                message: "Item added to cart"
                            });
                        }
                    );
                }
            );
        }

        // Cart already exists
        if (cartResults.length > 0) {
            continueWithCart(cartResults[0].id);
            return;
        }

        // Create cart
        const createCartSql = `
            INSERT INTO cart (user_id)
            VALUES (?)
        `;

        db.query(
            createCartSql,
            [userId],
            (err, result) => {
                if (err) {
                    console.error("Create cart error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to create cart"
                    });
                }

                continueWithCart(result.insertId);
            }
        );
    });
}


// Update cart item quantity
function updateCartItem(req, res) {
    const userId = req.user.userId;
    const cartItemId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be at least 1"
        });
    }

    const sql = `
        UPDATE cart_items ci

        INNER JOIN cart c
            ON ci.cart_id = c.id

        SET ci.quantity = ?

        WHERE ci.id = ?
        AND c.user_id = ?
    `;

    db.query(
        sql,
        [quantity, cartItemId, userId],
        (err, result) => {
            if (err) {
                console.error(
                    "Update cart quantity error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to update cart"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Cart item not found"
                });
            }

            res.json({
                success: true,
                message: "Cart updated successfully"
            });
        }
    );
}


// Remove item from cart
function removeFromCart(req, res) {
    const userId = req.user.userId;
    const cartItemId = req.params.id;

    const sql = `
        DELETE ci
        FROM cart_items ci

        INNER JOIN cart c
            ON ci.cart_id = c.id

        WHERE ci.id = ?
        AND c.user_id = ?
    `;

    db.query(
        sql,
        [cartItemId, userId],
        (err, result) => {
            if (err) {
                console.error(
                    "Remove cart item error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to remove item"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Cart item not found"
                });
            }

            res.json({
                success: true,
                message: "Item removed from cart"
            });
        }
    );
}


// Clear entire cart
function clearCart(req, res) {
    const userId = req.user.userId;

    const sql = `
        DELETE ci
        FROM cart_items ci

        INNER JOIN cart c
            ON ci.cart_id = c.id

        WHERE c.user_id = ?
    `;

    db.query(sql, [userId], (err) => {
        if (err) {
            console.error(
                "Clear cart error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Unable to clear cart"
            });
        }

        res.json({
            success: true,
            message: "Cart cleared successfully"
        });
    });
}


module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};