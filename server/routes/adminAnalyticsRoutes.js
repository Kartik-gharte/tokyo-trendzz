const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAnalytics
} = require("../controllers/adminAnalyticsController");

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAnalytics
);

module.exports = router;