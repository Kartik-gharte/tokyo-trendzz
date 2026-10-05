
const db = require("../config/db");

// Get all products for admin
async function getAllProducts(req, res) {
    try {
        const [products] = await db.promise().query(`
            SELECT
                p.id,
                p.category_id,
                p.name,
                p.slug,
                p.description,
                p.brand,
                p.price,
                p.discount_price,
                p.gender,
                p.material,
                p.is_featured,
                p.is_active,
                p.created_at,
                p.updated_at,
                c.name AS category_name,

                (
                    SELECT pi.image_url
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    AND pi.is_primary = TRUE
                    LIMIT 1
                ) AS image_url,

                (
                    SELECT COALESCE(SUM(pv.stock), 0)
                    FROM product_variants pv
                    WHERE pv.product_id = p.id
                ) AS total_stock

            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error("Get admin products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
}


// Add new product
async function createProduct(req, res) {
    try {
        const {
            name,
            category_id,
            description,
            brand,
            price,
            discount_price,
            gender,
            material,
            is_featured,
            is_active
        } = req.body;

        // Validate required fields
        if (!name || !category_id || !price) {
            return res.status(400).json({
                success: false,
                message: "Product name, category and price are required"
            });
        }

        // Check category exists
        const [categories] = await db.promise().query(
            `
            SELECT id
            FROM categories
            WHERE id = ?
            `,
            [category_id]
        );

        if (categories.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Selected category does not exist"
            });
        }

        // Create URL-friendly slug
        const baseSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        let slug = baseSlug;

        // Check whether slug already exists
        const [existingSlug] = await db.promise().query(
            `
            SELECT id
            FROM products
            WHERE slug = ?
            `,
            [slug]
        );

        if (existingSlug.length > 0) {
            slug = `${baseSlug}-${Date.now()}`;
        }

        const [result] = await db.promise().query(
            `
            INSERT INTO products (
                category_id,
                name,
                slug,
                description,
                brand,
                price,
                discount_price,
                gender,
                material,
                is_featured,
                is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                category_id,
                name.trim(),
                slug,
                description || null,
                brand || "Tokyo Trendz",
                price,
                discount_price || null,
                gender || "unisex",
                material || null,
                is_featured ? 1 : 0,
                is_active === false ? 0 : 1
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            productId: result.insertId
        });

    } catch (error) {
        console.error("Create product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create product"
        });
    }
}

// ==========================================
// UPDATE PRODUCT
// ==========================================
async function updateProduct(req, res) {
    try {
        const { productId } = req.params;

        const {
            name,
            category_id,
            brand,
            material,
            price,
            discount_price,
            gender,
            description,
            is_featured,
            is_active
        } = req.body;

        if (!name || !category_id || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, category and price are required"
            });
        }

        // Check product exists
        const [products] = await db.promise().query(
            `
            SELECT id
            FROM products
            WHERE id = ?
            `,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check category exists
        const [categories] = await db.promise().query(
            `
            SELECT id
            FROM categories
            WHERE id = ?
            `,
            [category_id]
        );

        if (categories.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Category not found"
            });
        }

        await db.promise().query(
            `
            UPDATE products
            SET
                name = ?,
                category_id = ?,
                brand = ?,
                material = ?,
                price = ?,
                discount_price = ?,
                gender = ?,
                description = ?,
                is_featured = ?,
                is_active = ?
            WHERE id = ?
            `,
            [
                name,
                category_id,
                brand || null,
                material || null,
                price,
                discount_price || null,
                gender || null,
                description || null,
                is_featured ? 1 : 0,
                is_active ? 1 : 0,
                productId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error("Update product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
}

async function deleteProduct(req, res) {
    try {
        const { productId } = req.params;

        const [products] = await db.promise().query(
            `
            SELECT id
            FROM products
            WHERE id = ?
            `,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await db.promise().query(
            `
            DELETE FROM products
            WHERE id = ?
            `,
            [productId]
        );

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Delete product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product"
        });
    }
}

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct
};