const db = require("../config/db").promise();


// ==========================================
// GET ALL ADDRESSES
// ==========================================
async function getAllAddresses(req, res) {
    try {
        const [addresses] = await db.query(`
            SELECT
                a.id,
                a.user_id,
                a.full_name,
                a.phone,
                a.address_line,
                a.city,
                a.state,
                a.postal_code,
                a.country,
                a.is_default,
                u.name AS user_name,
                u.email AS user_email
            FROM addresses a
            INNER JOIN users u
                ON a.user_id = u.id
            ORDER BY a.id DESC
        `);

        res.json({
            success: true,
            addresses
        });

    } catch (error) {
        console.error("Get admin addresses error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch addresses"
        });
    }
}


// ==========================================
// GET ADDRESS BY ID
// ==========================================
async function getAddressById(req, res) {
    try {
        const { addressId } = req.params;

        const [addresses] = await db.query(`
            SELECT
                a.id,
                a.user_id,
                a.full_name,
                a.phone,
                a.address_line,
                a.city,
                a.state,
                a.postal_code,
                a.country,
                a.is_default,
                u.name AS user_name,
                u.email AS user_email
            FROM addresses a
            INNER JOIN users u
                ON a.user_id = u.id
            WHERE a.id = ?
        `, [addressId]);

        if (addresses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        res.json({
            success: true,
            address: addresses[0]
        });

    } catch (error) {
        console.error("Get address details error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch address details"
        });
    }
}


// ==========================================
// DELETE ADDRESS
// ==========================================
async function deleteAddress(req, res) {
    try {
        const { addressId } = req.params;

        const [addresses] = await db.query(
            "SELECT id FROM addresses WHERE id = ?",
            [addressId]
        );

        if (addresses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Check whether this address is linked to an existing order
        const [orders] = await db.query(
            "SELECT COUNT(*) AS order_count FROM orders WHERE address_id = ?",
            [addressId]
        );

        if (Number(orders[0].order_count) > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "This address cannot be deleted because it is linked to an existing order."
            });
        }

        await db.query(
            "DELETE FROM addresses WHERE id = ?",
            [addressId]
        );

        res.json({
            success: true,
            message: "Address deleted successfully"
        });

    } catch (error) {
        console.error("Delete address error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete address"
        });
    }
}

module.exports = {
    getAllAddresses,
    getAddressById,
    deleteAddress
};