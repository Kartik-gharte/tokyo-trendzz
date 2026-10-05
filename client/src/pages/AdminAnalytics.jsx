import { useEffect, useState } from "react";
import {
    TrendingUp,
    ShoppingCart,
    IndianRupee,
    Package,
    RefreshCw
} from "lucide-react";

import "./AdminAnalytics.css";

function AdminAnalytics() {

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAnalytics();
    }, []);

    async function fetchAnalytics() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Authentication token is required"
                );
            }

            const response = await fetch(
                "http://localhost:5000/api/admin/analytics",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to load analytics"
                );
            }

            setAnalytics(data.analytics);

        } catch (error) {
            console.error(
                "Analytics error:",
                error
            );

            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    function formatCurrency(amount) {
        return `₹${Number(
            amount || 0
        ).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        })}`;
    }

    function formatStatus(status) {
        return status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    }

    function formatMonth(month) {
        if (!month) {
            return "-";
        }

        const date = new Date(
            `${month}-01T00:00:00`
        );

        return date.toLocaleDateString(
            "en-IN",
            {
                month: "short",
                year: "numeric"
            }
        );
    }

    if (loading) {
        return (
            <div className="admin-analytics">
                <div className="analytics-loading">
                    Loading analytics...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-analytics">
                <div className="analytics-error">
                    <h2>
                        Unable to load analytics
                    </h2>

                    <p>{error}</p>

                    <button
                        onClick={fetchAnalytics}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-analytics">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="analytics-header">

                <div>
                    <h1>Analytics</h1>

                    <p>
                        Track Tokyo Trendz sales,
                        orders and product performance.
                    </p>
                </div>

                <button
                    className="analytics-refresh"
                    onClick={fetchAnalytics}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>

            </div>

            {/* ==========================================
                SUMMARY CARDS
            ========================================== */}

            <div className="analytics-summary">

                <div className="analytics-card">

                    <div className="analytics-card-icon">
                        <IndianRupee size={22} />
                    </div>

                    <div>
                        <span>Total Revenue</span>

                        <strong>
                            {formatCurrency(
                                analytics.total_revenue
                            )}
                        </strong>
                    </div>

                </div>

                <div className="analytics-card">

                    <div className="analytics-card-icon">
                        <ShoppingCart size={22} />
                    </div>

                    <div>
                        <span>Total Orders</span>

                        <strong>
                            {analytics.total_orders}
                        </strong>
                    </div>

                </div>

                <div className="analytics-card">

                    <div className="analytics-card-icon">
                        <TrendingUp size={22} />
                    </div>

                    <div>
                        <span>Average Order Value</span>

                        <strong>
                            {formatCurrency(
                                analytics.average_order_value
                            )}
                        </strong>
                    </div>

                </div>

                <div className="analytics-card">

                    <div className="analytics-card-icon">
                        <Package size={22} />
                    </div>

                    <div>
                        <span>Top Products</span>

                        <strong>
                            {analytics.top_products.length}
                        </strong>
                    </div>

                </div>

            </div>

            {/* ==========================================
                MONTHLY SALES
            ========================================== */}

            <div className="analytics-section">

                <div className="analytics-section-header">
                    <h2>Monthly Sales</h2>
                </div>

                {analytics.monthly_sales.length === 0 ? (
                    <div className="analytics-empty">
                        No sales data available.
                    </div>
                ) : (
                    <div className="analytics-table-wrapper">

                        <table className="analytics-table">

                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>

                            <tbody>

                                {analytics.monthly_sales.map(
                                    (item) => (
                                        <tr key={item.month}>

                                            <td>
                                                <strong>
                                                    {formatMonth(
                                                        item.month
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                {item.orders}
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    item.revenue
                                                )}
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* ==========================================
                ORDER STATUS
            ========================================== */}

            <div className="analytics-section">

                <div className="analytics-section-header">
                    <h2>Order Status</h2>
                </div>

                <div className="analytics-status-grid">

                    {analytics.order_statuses.map(
                        (item) => (
                            <div
                                className="analytics-status-card"
                                key={item.order_status}
                            >

                                <span>
                                    {formatStatus(
                                        item.order_status
                                    )}
                                </span>

                                <strong>
                                    {item.count}
                                </strong>

                            </div>
                        )
                    )}

                </div>

            </div>

            {/* ==========================================
                TOP PRODUCTS
            ========================================== */}

            <div className="analytics-section">

                <div className="analytics-section-header">
                    <h2>Top Products</h2>
                </div>

                {analytics.top_products.length === 0 ? (
                    <div className="analytics-empty">
                        No product sales available.
                    </div>
                ) : (
                    <div className="analytics-table-wrapper">

                        <table className="analytics-table">

                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Units Sold</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>

                            <tbody>

                                {analytics.top_products.map(
                                    (product) => (
                                        <tr
                                            key={
                                                product.product_id
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    {
                                                        product.product_name
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    product.units_sold
                                                }
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    product.revenue
                                                )}
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* ==========================================
                TOP CATEGORIES
            ========================================== */}

            <div className="analytics-section">

                <div className="analytics-section-header">
                    <h2>Top Categories</h2>
                </div>

                {analytics.top_categories.length === 0 ? (
                    <div className="analytics-empty">
                        No category sales available.
                    </div>
                ) : (
                    <div className="analytics-table-wrapper">

                        <table className="analytics-table">

                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Orders</th>
                                    <th>Units Sold</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>

                            <tbody>

                                {analytics.top_categories.map(
                                    (category) => (
                                        <tr
                                            key={
                                                category.category_id
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    {
                                                        category.category_name
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    category.orders
                                                }
                                            </td>

                                            <td>
                                                {
                                                    category.units_sold
                                                }
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    category.revenue
                                                )}
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}

export default AdminAnalytics;