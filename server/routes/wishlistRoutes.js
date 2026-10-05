
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
} = require("../controllers/wishlistController");

const router = express.Router();

// Get logged-in user's wishlist
router.get("/", authMiddleware, getWishlist);

// Add product to wishlist
router.post("/", authMiddleware, addToWishlist);

// Clear wishlist — keep this before the product ID route
router.delete("/clear", authMiddleware, clearWishlist);

// Remove a product from wishlist
router.delete("/:productId", authMiddleware, removeFromWishlist);

module.exports = router;
