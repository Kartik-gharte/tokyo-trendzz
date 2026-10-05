const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllInventory,
    updateStock,
    getInventoryStats
} = require("../controllers/adminInventoryController");


// Get all inventory
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllInventory
);


// Get inventory statistics
router.get(
    "/stats",
    authMiddleware,
    adminMiddleware,
    getInventoryStats
);


// Update stock
router.patch(
    "/:variantId/stock",
    authMiddleware,
    adminMiddleware,
    updateStock
);


module.exports = router;