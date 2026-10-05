const db = require("../config/db");

// ==========================================
// ADD PRODUCT IMAGE
// ==========================================
async function addProductImage(req, res) {
    try {
        const {
            product_id,
            image_url,
            is_primary = false,
            display_order = 0
        } = req.body;

        if (!product_id || !image_url) {
            return res.status(400).json({
                success: false,
                message: "Product ID and image URL are required"
            });
        }

        // Check product exists
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

        // If this image is primary,
        // remove primary status from existing images
        if (is_primary) {
            await db.promise().query(
                `
                UPDATE product_images
                SET is_primary = 0
                WHERE product_id = ?
                `,
                [product_id]
            );
        }

        const [result] = await db.promise().query(
            `
            INSERT INTO product_images
            (
                product_id,
                image_url,
                is_primary,
                display_order
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                product_id,
                image_url,
                is_primary ? 1 : 0,
                display_order
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Product image added successfully",
            imageId: result.insertId
        });

    } catch (error) {
        console.error("Add product image error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product image"
        });
    }
}


// ==========================================
// GET PRODUCT IMAGES
// ==========================================
async function getProductImages(req, res) {
    try {
        const { productId } = req.params;

        const [images] = await db.promise().query(
            `
            SELECT
                id,
                product_id,
                image_url,
                is_primary,
                display_order
            FROM product_images
            WHERE product_id = ?
            ORDER BY display_order ASC, id ASC
            `,
            [productId]
        );

        return res.status(200).json({
            success: true,
            images
        });

    } catch (error) {
        console.error("Get product images error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch product images"
        });
    }
}


// ==========================================
// DELETE PRODUCT IMAGE
// ==========================================
async function deleteProductImage(req, res) {
    try {
        const { imageId } = req.params;

        const [images] = await db.promise().query(
            `
            SELECT
                id,
                product_id,
                is_primary
            FROM product_images
            WHERE id = ?
            `,
            [imageId]
        );

        if (images.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product image not found"
            });
        }

        await db.promise().query(
            `
            DELETE FROM product_images
            WHERE id = ?
            `,
            [imageId]
        );

        return res.status(200).json({
            success: true,
            message: "Product image deleted successfully"
        });

    } catch (error) {
        console.error("Delete product image error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product image"
        });
    }
}


// ==========================================
// SET PRIMARY PRODUCT IMAGE
// ==========================================
async function setPrimaryProductImage(req, res) {
    try {
        const { imageId } = req.params;

        // Check image exists
        const [images] = await db.promise().query(
            `
            SELECT
                id,
                product_id
            FROM product_images
            WHERE id = ?
            `,
            [imageId]
        );

        if (images.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product image not found"
            });
        }

        const productId = images[0].product_id;

        // Remove primary status from all images
        // belonging to this product
        await db.promise().query(
            `
            UPDATE product_images
            SET is_primary = 0
            WHERE product_id = ?
            `,
            [productId]
        );

        // Make selected image primary
        await db.promise().query(
            `
            UPDATE product_images
            SET is_primary = 1
            WHERE id = ?
            `,
            [imageId]
        );

        return res.status(200).json({
            success: true,
            message: "Primary image updated successfully"
        });

    } catch (error) {
        console.error(
            "Set primary product image error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update primary image"
        });
    }
}

// ==========================================
// UPDATE IMAGE DISPLAY ORDER
// ==========================================
async function updateProductImageOrder(req, res) {
    try {
        const { imageId } = req.params;
        const { display_order } = req.body;

        if (
            display_order === undefined ||
            display_order === null ||
            Number.isNaN(Number(display_order))
        ) {
            return res.status(400).json({
                success: false,
                message: "Display order is required"
            });
        }

        // Check image exists
        const [images] = await db.promise().query(
            `
            SELECT id
            FROM product_images
            WHERE id = ?
            `,
            [imageId]
        );

        if (images.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product image not found"
            });
        }

        await db.promise().query(
            `
            UPDATE product_images
            SET display_order = ?
            WHERE id = ?
            `,
            [
                Number(display_order),
                imageId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Image display order updated successfully"
        });

    } catch (error) {
        console.error(
            "Update image display order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update image display order"
        });
    }
}

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
    addProductImage,
    getProductImages,
    deleteProductImage,
    setPrimaryProductImage,
    updateProductImageOrder
};