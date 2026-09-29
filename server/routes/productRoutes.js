const express = require("express");
const router = express.Router();

const db = require("../config/db");

// GET all products
router.get("/", (req, res) => {
    const query = `
        SELECT
            p.id,
            p.name,
            p.slug,
            p.description,
            p.brand,
            p.price,
            p.discount_price,
            p.gender,
            p.material,
            p.is_featured,
            c.name AS category_name,

            (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = p.id
                AND pi.is_primary = TRUE
                LIMIT 1
            ) AS image_url

        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = TRUE
        ORDER BY p.created_at DESC
    `;

    db.query(query, (err, products) => {
        if (err) {
            console.error("Error fetching products:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch products"
            });
        }

        res.json({
            success: true,
            count: products.length,
            products
        });
    });
});


// GET single product by ID
router.get("/:id", (req, res) => {
    const productId = req.params.id;

    const productQuery = `
        SELECT
            p.id,
            p.name,
            p.slug,
            p.description,
            p.brand,
            p.price,
            p.discount_price,
            p.gender,
            p.material,
            p.is_featured,
            c.name AS category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? AND p.is_active = TRUE
    `;

    db.query(productQuery, [productId], (err, products) => {
        if (err) {
            console.error("Error fetching product:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch product"
            });
        }

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = products[0];

        // Get product images
        const imageQuery = `
            SELECT id, image_url, is_primary, display_order
            FROM product_images
            WHERE product_id = ?
            ORDER BY display_order ASC
        `;

        // Get product variants
        const variantQuery = `
            SELECT id, size, color, sku, stock
            FROM product_variants
            WHERE product_id = ?
            ORDER BY id ASC
        `;

        db.query(imageQuery, [productId], (imageErr, images) => {
            if (imageErr) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch product images"
                });
            }

            db.query(variantQuery, [productId], (variantErr, variants) => {
                if (variantErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to fetch product variants"
                    });
                }

                res.json({
                    success: true,
                    product: {
                        ...product,
                        images,
                        variants
                    }
                });
            });
        });
    });
});

module.exports = router;