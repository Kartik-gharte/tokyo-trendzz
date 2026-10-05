const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/adminCategoryController");

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllCategories
);

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createCategory
);

router.put(
    "/:categoryId",
    authMiddleware,
    adminMiddleware,
    updateCategory
);

router.delete(
    "/:categoryId",
    authMiddleware,
    adminMiddleware,
    deleteCategory
);

module.exports = router;