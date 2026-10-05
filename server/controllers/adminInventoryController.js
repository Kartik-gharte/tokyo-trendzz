const db = require("../config/db").promise();

// Get all inventory
async function getAllInventory(req, res) {
    try {
        const [inventory] = await db.query(`
            SELECT
                pv.id,
                pv.product_id,
                p.name AS product_name,
                pv.size,
                pv.color,
                pv.sku,
                pv.stock,
                pv.created_at
            FROM product_variants pv
            INNER JOIN products p
                ON pv.product_id = p.id
            ORDER BY p.name ASC, pv.size ASC, pv.color ASC
        `);

        return res.json({
            success: true,
            inventory
        });

    } catch (error) {
        console.error("Get inventory error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch inventory"
        });
    }
}


// Update stock
async function updateStock(req, res) {
    try {
        const { variantId } = req.params;
        const { stock } = req.body;

        if (stock === undefined || stock === null) {
            return res.status(400).json({
                success: false,
                message: "Stock value is required"
            });
        }

        const stockValue = Number(stock);

        if (!Number.isInteger(stockValue) || stockValue < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative integer"
            });
        }

        const [result] = await db.query(
            `
            UPDATE product_variants
            SET stock = ?
            WHERE id = ?
            `,
            [stockValue, variantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product variant not found"
            });
        }

        return res.json({
            success: true,
            message: "Stock updated successfully"
        });

    } catch (error) {
        console.error("Update stock error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update stock"
        });
    }
}


// Get inventory statistics
async function getInventoryStats(req, res) {
    try {
        const [stats] = await db.query(`
            SELECT
                COUNT(*) AS total_variants,
                COALESCE(SUM(stock), 0) AS total_stock,
                SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS out_of_stock,
                SUM(CASE WHEN stock > 0 AND stock <= 5 THEN 1 ELSE 0 END) AS low_stock
            FROM product_variants
        `);

        return res.json({
            success: true,
            stats: {
                total_variants: Number(stats[0].total_variants),
                total_stock: Number(stats[0].total_stock),
                out_of_stock: Number(stats[0].out_of_stock),
                low_stock: Number(stats[0].low_stock)
            }
        });

    } catch (error) {
        console.error("Get inventory stats error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch inventory statistics"
        });
    }
}


module.exports = {
    getAllInventory,
    updateStock,
    getInventoryStats
};