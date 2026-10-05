const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    addProductImage,
    getProductImages,
    deleteProductImage,
    setPrimaryProductImage,
    updateProductImageOrder
} = require("../controllers/adminProductImageController");

// GET PRODUCT IMAGES
router.get(
    "/:productId",
    authMiddleware,
    adminMiddleware,
    getProductImages
);


// ADD PRODUCT IMAGE
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    addProductImage
);


// DELETE PRODUCT IMAGE
router.delete(
    "/:imageId",
    authMiddleware,
    adminMiddleware,
    deleteProductImage
);


// SET PRIMARY IMAGE
router.patch(
    "/:imageId/primary",
    authMiddleware,
    adminMiddleware,
    setPrimaryProductImage
);

// UPDATE IMAGE DISPLAY ORDER
router.patch(
    "/:imageId/order",
    authMiddleware,
    adminMiddleware,
    updateProductImageOrder
);


module.exports = router;