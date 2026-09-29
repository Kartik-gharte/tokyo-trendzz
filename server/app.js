const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});