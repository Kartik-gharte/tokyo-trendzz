const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllCustomers,
    getCustomerById
} = require("../controllers/adminCustomerController");

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllCustomers
);

router.get(
    "/:customerId",
    authMiddleware,
    adminMiddleware,
    getCustomerById
);

module.exports = router;