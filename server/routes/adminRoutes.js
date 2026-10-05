const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllOrders
} = require("../controllers/adminController");

// Admin: Get all orders
router.get(
    "/orders",
    authMiddleware,
    adminMiddleware,
    getAllOrders
);

module.exports = router;