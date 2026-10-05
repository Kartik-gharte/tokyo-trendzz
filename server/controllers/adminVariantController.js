const db = require("../config/db");

// Get all variants for one product
async function getProductVariants(req, res) {
    try {
        const { productId } = req.params;

        const [variants] = await db.promise().query(
            `
            SELECT
                id,
                product_id,
                size,
                color,
                sku,
                stock,
                created_at
            FROM product_variants
            WHERE product_id = ?
            ORDER BY id
            `,
            [productId]
        );

        return res.status(200).json({
            success: true,
            variants
        });
    } catch (error) {
        console.error("Get product variants error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch product variants"
        });
    }
}


// Add a new variant
async function addProductVariant(req, res) {
    try {
        const { product_id, size, color, sku, stock } = req.body;

        if (!product_id || !size || !color || !sku) {
            return res.status(400).json({
                success: false,
                message: "Product, size, color and SKU are required"
            });
        }

        const stockValue =
            stock === undefined || stock === ""
                ? 0
                : Number(stock);

        if (Number.isNaN(stockValue) || stockValue < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a valid non-negative number"
            });
        }

        const [products] = await db.promise().query(
            `
            SELECT id
            FROM products
            WHERE id = ?
            `,
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const [existingSku] = await db.promise().query(
            `
            SELECT id
            FROM product_variants
            WHERE sku = ?
            `,
            [sku]
        );

        if (existingSku.length > 0) {
            return res.status(400).json({
                success: false,
                message: "SKU already exists"
            });
        }

        await db.promise().query(
            `
            INSERT INTO product_variants
            (
                product_id,
                size,
                color,
                sku,
                stock
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                product_id,
                size,
                color,
                sku,
                stockValue
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Product variant added successfully"
        });
    } catch (error) {
        console.error("Add product variant error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product variant"
        });
    }
}


// Update an existing variant
async function updateProductVariant(req, res) {
    try {
        const { variantId } = req.params;

        const {
            size,
            color,
            sku,
            stock
        } = req.body;

        if (!size || !color || !sku || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Size, color, SKU and stock are required"
            });
        }

        const stockValue = Number(stock);

        if (Number.isNaN(stockValue) || stockValue < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a valid non-negative number"
            });
        }

        const [variants] = await db.promise().query(
            `
            SELECT id
            FROM product_variants
            WHERE id = ?
            `,
            [variantId]
        );

        if (variants.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product variant not found"
            });
        }

        const [existingSku] = await db.promise().query(
            `
            SELECT id
            FROM product_variants
            WHERE sku = ?
            AND id != ?
            `,
            [sku, variantId]
        );

        if (existingSku.length > 0) {
            return res.status(400).json({
                success: false,
                message: "SKU already exists"
            });
        }

        await db.promise().query(
            `
            UPDATE product_variants
            SET
                size = ?,
                color = ?,
                sku = ?,
                stock = ?
            WHERE id = ?
            `,
            [
                size,
                color,
                sku,
                stockValue,
                variantId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Product variant updated successfully"
        });
    } catch (error) {
        console.error("Update product variant error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update product variant"
        });
    }
}


// Delete a variant
async function deleteProductVariant(req, res) {
    try {
        const { variantId } = req.params;

        const [variants] = await db.promise().query(
            `
            SELECT id
            FROM product_variants
            WHERE id = ?
            `,
            [variantId]
        );

        if (variants.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product variant not found"
            });
        }

        await db.promise().query(
            `
            DELETE FROM product_variants
            WHERE id = ?
            `,
            [variantId]
        );

        return res.status(200).json({
            success: true,
            message: "Product variant deleted successfully"
        });
    } catch (error) {
        console.error("Delete product variant error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product variant"
        });
    }
}


module.exports = {
    getProductVariants,
    addProductVariant,
    updateProductVariant,
    deleteProductVariant
};