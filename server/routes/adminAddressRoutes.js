const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllAddresses,
    getAddressById,
    deleteAddress
} = require("../controllers/adminAddressController");


// ==========================================
// GET ALL ADDRESSES
// ==========================================
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllAddresses
);


// ==========================================
// GET ADDRESS BY ID
// ==========================================
router.get(
    "/:addressId",
    authMiddleware,
    adminMiddleware,
    getAddressById
);


// ==========================================
// DELETE ADDRESS
// ==========================================
router.delete(
    "/:addressId",
    authMiddleware,
    adminMiddleware,
    deleteAddress
);


module.exports = router;