
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const db = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

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
const adminInventoryRoutes = require("./routes/adminInventoryRoutes");
const adminReportsRoutes = require("./routes/adminReportsRoutes");

const couponRoutes = require("./routes/couponRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Built React frontend
const frontendPath = path.resolve(__dirname, "../client/dist");
const frontendExists = fs.existsSync(path.join(frontendPath, "index.html"));

app.use(cors());
app.use(express.json());

// API health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Tokyo Trendz API is running!"
    });
});

// Database health check
app.get("/api/test-db", (req, res) => {
    db.query("SELECT 1 AS result", (err, results) => {
        if (err) {
            console.error("Database connection failed:", err.message);
            return res.status(500).json({
                success: false,
                message: "Database connection failed"
            });
        }

        res.json({
            success: true,
            message: "Database connected successfully!",
            data: results
        });
    });
});

// Customer routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/product-images", adminProductImageRoutes);
app.use("/api/admin/variants", adminVariantRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/coupons", adminCouponRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/addresses", adminAddressRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/inventory", adminInventoryRoutes);
app.use("/api/admin/reports", adminReportsRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// Serve the React build when it exists
if (frontendExists) {
    app.use(express.static(frontendPath));

    // React Router fallback; keep unknown API requests as JSON 404s.
    app.get(/^(?!\/api(?:\/|$)).*/, (req, res) => {
        res.sendFile(path.join(frontendPath, "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.json({
            success: true,
            message: "Tokyo Trendz API is running. Frontend build not found."
        });
    });
}

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tokyo Trendz server listening on port ${PORT}`);
});
