const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getSalesReport,
    getProductSalesReport
} = require("../controllers/adminReportsController");


// Sales report
router.get(
    "/sales",
    authMiddleware,
    adminMiddleware,
    getSalesReport
);


// Product sales report
router.get(
    "/products",
    authMiddleware,
    adminMiddleware,
    getProductSalesReport
);


module.exports = router;