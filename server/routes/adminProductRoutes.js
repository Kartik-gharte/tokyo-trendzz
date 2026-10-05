
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/adminProductController");
// Admin: Get all products
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllProducts
);

// Admin: Create product
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createProduct
);

// UPDATE PRODUCT
router.put(
    "/:productId",
    authMiddleware,
    adminMiddleware,
    updateProduct
);

router.delete(
    "/:productId",
    authMiddleware,
    adminMiddleware,
    deleteProduct
);
module.exports = router;
