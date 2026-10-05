const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getProductVariants,
    addProductVariant,
    updateProductVariant,
    deleteProductVariant
} = require("../controllers/adminVariantController");


// Get all variants for a product
router.get(
    "/product/:productId",
    authMiddleware,
    adminMiddleware,
    getProductVariants
);


// Add a new variant
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    addProductVariant
);


// Update a variant
router.put(
    "/:variantId",
    authMiddleware,
    adminMiddleware,
    updateProductVariant
);


// Delete a variant
router.delete(
    "/:variantId",
    authMiddleware,
    adminMiddleware,
    deleteProductVariant
);


module.exports = router;