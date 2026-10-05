
const db = require("../config/db");

// Get the logged-in user's wishlist
function getWishlist(req, res) {
    const userId = req.user.userId;

    const sql = `
        SELECT
            wi.id AS wishlist_item_id,
            wi.product_id,
            p.name,
            p.brand,
            p.price,
            p.discount_price,
            pi.image_url
        FROM wishlist w
        INNER JOIN wishlist_items wi
            ON w.id = wi.wishlist_id
        INNER JOIN products p
            ON wi.product_id = p.id
        LEFT JOIN product_images pi
            ON p.id = pi.product_id
            AND pi.is_primary = 1
        WHERE w.user_id = ?
        ORDER BY wi.id DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Get wishlist error:", err);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch wishlist"
            });
        }

        res.json({
            success: true,
            items: results
        });
    });
}

// Add a product to the wishlist
function addToWishlist(req, res) {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!Number.isInteger(Number(productId)) || Number(productId) < 1) {
        return res.status(400).json({
            success: false,
            message: "A valid product ID is required"
        });
    }

    // Find or create the user's wishlist
    const findSql = `
        SELECT id
        FROM wishlist
        WHERE user_id = ?
    `;

    db.query(findSql, [userId], (err, wishlists) => {
        if (err) {
            console.error("Find wishlist error:", err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        function saveProduct(wishlistId) {
            const insertSql = `
                INSERT INTO wishlist_items (wishlist_id, product_id)
                SELECT ?, p.id
                FROM products p
                WHERE p.id = ?
                AND NOT EXISTS (
                    SELECT 1
                    FROM wishlist_items wi
                    WHERE wi.wishlist_id = ?
                    AND wi.product_id = p.id
                )
            `;

            db.query(
                insertSql,
                [wishlistId, Number(productId), wishlistId],
                (insertErr, result) => {
                    if (insertErr) {
                        console.error("Add wishlist item error:", insertErr);

                        return res.status(500).json({
                            success: false,
                            message: "Unable to save product"
                        });
                    }

                    if (result.affectedRows === 0) {
                        // Distinguish a missing product from an existing item
                        const checkSql = `
                            SELECT
                                p.id,
                                wi.id AS wishlist_item_id
                            FROM products p
                            LEFT JOIN wishlist_items wi
                                ON wi.product_id = p.id
                                AND wi.wishlist_id = ?
                            WHERE p.id = ?
                        `;

                        return db.query(
                            checkSql,
                            [wishlistId, Number(productId)],
                            (checkErr, rows) => {
                                if (checkErr) {
                                    console.error(checkErr);

                                    return res.status(500).json({
                                        success: false,
                                        message: "Database error"
                                    });
                                }

                                if (rows.length === 0) {
                                    return res.status(404).json({
                                        success: false,
                                        message: "Product not found"
                                    });
                                }

                                return res.json({
                                    success: true,
                                    message: "Product is already in wishlist"
                                });
                            }
                        );
                    }

                    res.status(201).json({
                        success: true,
                        message: "Product added to wishlist"
                    });
                }
            );
        }

        if (wishlists.length > 0) {
            return saveProduct(wishlists[0].id);
        }

        db.query(
            "INSERT INTO wishlist (user_id) VALUES (?)",
            [userId],
            (createErr, result) => {
                if (createErr) {
                    console.error("Create wishlist error:", createErr);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to create wishlist"
                    });
                }

                saveProduct(result.insertId);
            }
        );
    });
}

// Remove one product from the logged-in user's wishlist
function removeFromWishlist(req, res) {
    const userId = req.user.userId;
    const productId = req.params.productId;

    const sql = `
        DELETE wi
        FROM wishlist_items wi
        INNER JOIN wishlist w
            ON wi.wishlist_id = w.id
        WHERE w.user_id = ?
        AND wi.product_id = ?
    `;

    db.query(sql, [userId, productId], (err, result) => {
        if (err) {
            console.error("Remove wishlist item error:", err);

            return res.status(500).json({
                success: false,
                message: "Unable to remove product"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        res.json({
            success: true,
            message: "Product removed from wishlist"
        });
    });
}

// Clear all products from the logged-in user's wishlist
function clearWishlist(req, res) {
    const userId = req.user.userId;

    const sql = `
        DELETE wi
        FROM wishlist_items wi
        INNER JOIN wishlist w
            ON wi.wishlist_id = w.id
        WHERE w.user_id = ?
    `;

    db.query(sql, [userId], (err) => {
        if (err) {
            console.error("Clear wishlist error:", err);

            return res.status(500).json({
                success: false,
                message: "Unable to clear wishlist"
            });
        }

        res.json({
            success: true,
            message: "Wishlist cleared successfully"
        });
    });
}

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
};
