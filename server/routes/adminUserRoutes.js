const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllUsers,
    getUserById,
    updateUserRole
} = require("../controllers/adminUserController");


// Get all users
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllUsers
);


// Get single user details
router.get(
    "/:userId",
    authMiddleware,
    adminMiddleware,
    getUserById
);


// Update user role
router.patch(
    "/:userId/role",
    authMiddleware,
    adminMiddleware,
    updateUserRole
);


module.exports = router;