const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require("../controllers/cartController");

const router = express.Router();

// Get logged-in user's cart
router.get(
    "/",
    authMiddleware,
    getCart
);

// Add item to cart
router.post(
    "/",
    authMiddleware,
    addToCart
);

// Update cart item quantity
router.put(
    "/:id",
    authMiddleware,
    updateCartItem
);

// Remove item from cart
router.delete(
    "/:id",
    authMiddleware,
    removeFromCart
);

// Clear entire cart
router.delete(
    "/",
    authMiddleware,
    clearCart
);

module.exports = router;