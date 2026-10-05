const db = require("../config/db");

function createSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function getAllCategories(req, res) {
    try {
        const [categories] = await db.promise().query(`
            SELECT
                c.id,
                c.name,
                c.slug,
                c.image_url,
                c.created_at,
                COUNT(p.id) AS product_count
            FROM categories c
            LEFT JOIN products p
                ON c.id = p.category_id
            GROUP BY
                c.id,
                c.name,
                c.slug,
                c.image_url,
                c.created_at
            ORDER BY c.id ASC
        `);

        return res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error(
            "Get all categories error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
}

async function createCategory(req, res) {
    try {
        const {
            name,
            image_url
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const cleanName = name.trim();
        const slug = createSlug(cleanName);

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Invalid category name"
            });
        }

        const [existingCategory] =
            await db.promise().query(
                `
                SELECT id
                FROM categories
                WHERE name = ?
                   OR slug = ?
                LIMIT 1
                `,
                [cleanName, slug]
            );

        if (existingCategory.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "A category with this name already exists"
            });
        }

        const [result] =
            await db.promise().query(
                `
                INSERT INTO categories
                    (name, slug, image_url)
                VALUES (?, ?, ?)
                `,
                [
                    cleanName,
                    slug,
                    image_url?.trim() || null
                ]
            );

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category: {
                id: result.insertId,
                name: cleanName,
                slug,
                image_url:
                    image_url?.trim() || null
            }
        });
    } catch (error) {
        console.error(
            "Create category error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create category"
        });
    }
}

async function updateCategory(req, res) {
    try {
        const { categoryId } = req.params;

        const {
            name,
            image_url
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const cleanName = name.trim();
        const slug = createSlug(cleanName);

        const [category] =
            await db.promise().query(
                `
                SELECT id
                FROM categories
                WHERE id = ?
                `,
                [categoryId]
            );

        if (category.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const [duplicate] =
            await db.promise().query(
                `
                SELECT id
                FROM categories
                WHERE (name = ? OR slug = ?)
                  AND id != ?
                LIMIT 1
                `,
                [
                    cleanName,
                    slug,
                    categoryId
                ]
            );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "Another category with this name already exists"
            });
        }

        await db.promise().query(
            `
            UPDATE categories
            SET
                name = ?,
                slug = ?,
                image_url = ?
            WHERE id = ?
            `,
            [
                cleanName,
                slug,
                image_url?.trim() || null,
                categoryId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully"
        });
    } catch (error) {
        console.error(
            "Update category error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update category"
        });
    }
}

async function deleteCategory(req, res) {
    try {
        const { categoryId } = req.params;

        const [category] =
            await db.promise().query(
                `
                SELECT id
                FROM categories
                WHERE id = ?
                `,
                [categoryId]
            );

        if (category.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const [products] =
            await db.promise().query(
                `
                SELECT COUNT(*) AS count
                FROM products
                WHERE category_id = ?
                `,
                [categoryId]
            );

        if (Number(products[0].count) > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "Cannot delete this category because products are assigned to it"
            });
        }

        await db.promise().query(
            `
            DELETE FROM categories
            WHERE id = ?
            `,
            [categoryId]
        );

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete category error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete category"
        });
    }
}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};