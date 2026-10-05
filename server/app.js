const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const adminProductImageRoutes = require("./routes/adminProductImageRoutes");
const adminVariantRoutes = require("./routes/adminVariantRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const adminCategoryRoutes = require("./routes/adminCategoryRoutes");
const adminCouponRoutes = require("./routes/adminCouponRoutes");
const adminReviewRoutes = require("./routes/adminReviewRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const adminAddressRoutes = require("./routes/adminAddressRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
const app = express();
const couponRoutes = require("./routes/couponRoutes");
const PORT = process.env.PORT || 5000;
const adminInventoryRoutes = require("./routes/adminInventoryRoutes");
const adminReportsRoutes = require("./routes/adminReportsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Tokyo Trendz API is running!"
    });
});

app.get("/api/test-db", (req, res) => {
    db.query("SELECT 1 AS result", (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database connection failed",
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "Database connected successfully!",
            data: results
        });
    });
});

app.use("/api/products", productRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/coupons", couponRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/admin/orders", adminOrderRoutes);

app.use("/api/admin/products", adminProductRoutes);

app.use("/api/admin/product-images", adminProductImageRoutes);

app.use("/api/admin/variants", adminVariantRoutes);

app.use("/api/admin/dashboard", adminDashboardRoutes);

app.use("/api/admin/customers", adminCustomerRoutes);

app.use(
    "/api/admin/categories",
    adminCategoryRoutes
);

app.use(
    "/api/admin/coupons",
    adminCouponRoutes
);

app.use("/api/admin/reviews", adminReviewRoutes);

app.use("/api/admin/users", adminUserRoutes);

app.use("/api/admin/addresses", adminAddressRoutes);

app.use(
    "/api/admin/analytics",
    adminAnalyticsRoutes
);

app.use(
    "/api/admin/inventory",
    adminInventoryRoutes
);

app.use(
    "/api/admin/reports",
    adminReportsRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});