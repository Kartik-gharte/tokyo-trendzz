import { useEffect, useState } from "react";
import {
    TrendingUp,
    ShoppingCart,
    IndianRupee,
    Package,
    RefreshCw,
    BarChart3,
    Activity,
    Layers3,
    AlertCircle
} from "lucide-react";

import "./AdminAnalytics.css";

function AdminAnalytics() {

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAnalytics();
    }, []);

    // ==========================================
    // FETCH ANALYTICS
    // ==========================================
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
                "/api/admin/analytics",
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

            setError(
                error.message ||
                "Failed to load analytics"
            );

        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // FORMAT CURRENCY
    // ==========================================
    function formatCurrency(amount) {
        return `₹${Number(
            amount || 0
        ).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        })}`;
    }

    // ==========================================
    // FORMAT STATUS
    // ==========================================
    function formatStatus(status) {
        return status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    }

    // ==========================================
    // FORMAT MONTH
    // ==========================================
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

    // ==========================================
    // LOADING
    // ==========================================
    if (loading) {
        return (
            <div className="admin-analytics">

                <div className="analytics-loading">

                    <div className="analytics-loading-icon">
                        <BarChart3 size={28} />
                    </div>

                    <h3>
                        Loading analytics
                    </h3>

                    <p>
                        Preparing your store performance data...
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================
    if (error) {
        return (
            <div className="admin-analytics">

                <div className="analytics-error">

                    <div className="analytics-error-icon">
                        <AlertCircle size={28} />
                    </div>

                    <h2>
                        Unable to load analytics
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={fetchAnalytics}
                    >
                        <RefreshCw size={15} />
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

                <div className="analytics-header-content">

                    <div className="analytics-title-icon">
                        <BarChart3 size={24} />
                    </div>

                    <div>

                        <div className="analytics-eyebrow">
                            TOKYO TRENDZ / PERFORMANCE
                        </div>

                        <h1>
                            Analytics
                        </h1>

                        <p>
                            Track sales, orders and
                            product performance.
                        </p>

                    </div>

                </div>

                <button
                    className="analytics-refresh"
                    onClick={fetchAnalytics}
                >
                    <RefreshCw size={16} />
                    Refresh Analytics
                </button>

            </div>


            {/* ==========================================
                SUMMARY
            ========================================== */}

            <div className="analytics-summary">

                <div className="analytics-card">

                    <div className="analytics-card-icon">
                        <IndianRupee size={21} />
                    </div>

                    <div className="analytics-card-content">

                        <span>
                            TOTAL REVENUE
                        </span>

                        <strong>
                            {formatCurrency(
                                analytics.total_revenue
                            )}
                        </strong>

                        <small>
                            Overall store revenue
                        </small>

                    </div>

                </div>


                <div className="analytics-card">

                    <div className="analytics-card-icon">
                        <ShoppingCart size={21} />
                    </div>

                    <div className="analytics-card-content">

                        <span>
                            TOTAL ORDERS
                        </span>

                        <strong>
                            {analytics.total_orders}
                        </strong>

                        <small>
                            Orders recorded
                        </small>

                    </div>

                </div>


                <div className="analytics-card">

                    <div className="analytics-card-icon">
                        <TrendingUp size={21} />
                    </div>

                    <div className="analytics-card-content">

                        <span>
                            AVERAGE ORDER VALUE
                        </span>

                        <strong>
                            {formatCurrency(
                                analytics.average_order_value
                            )}
                        </strong>

                        <small>
                            Average per order
                        </small>

                    </div>

                </div>


                <div className="analytics-card">

                    <div className="analytics-card-icon">
                        <Package size={21} />
                    </div>

                    <div className="analytics-card-content">

                        <span>
                            TOP PRODUCTS
                        </span>

                        <strong>
                            {analytics.top_products.length}
                        </strong>

                        <small>
                            Products with sales data
                        </small>

                    </div>

                </div>

            </div>


            {/* ==========================================
                MONTHLY SALES
            ========================================== */}

            <div className="analytics-section">

                <div className="analytics-section-header">

                    <div className="analytics-section-title">

                        <div className="analytics-section-icon">
                            <TrendingUp size={18} />
                        </div>

                        <div>
                            <h2>
                                Monthly Sales
                            </h2>

                            <p>
                                Revenue and order performance
                                by month.
                            </p>
                        </div>

                    </div>

                    <span className="analytics-section-badge">
                        SALES
                    </span>

                </div>

                {analytics.monthly_sales.length === 0 ? (

                    <div className="analytics-empty">

                        <div className="analytics-empty-icon">
                            <TrendingUp size={24} />
                        </div>

                        <strong>
                            No sales data available
                        </strong>

                        <span>
                            Monthly sales information will
                            appear here.
                        </span>

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
                                                <div className="analytics-primary-cell">
                                                    <span className="analytics-row-icon">
                                                        <Activity
                                                            size={15}
                                                        />
                                                    </span>

                                                    <strong>
                                                        {formatMonth(
                                                            item.month
                                                        )}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td>
                                                {item.orders}
                                            </td>

                                            <td>
                                                <strong className="analytics-revenue">
                                                    {formatCurrency(
                                                        item.revenue
                                                    )}
                                                </strong>
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

                    <div className="analytics-section-title">

                        <div className="analytics-section-icon">
                            <ShoppingCart size={18} />
                        </div>

                        <div>
                            <h2>
                                Order Status
                            </h2>

                            <p>
                                Current distribution of orders.
                            </p>
                        </div>

                    </div>

                    <span className="analytics-section-badge">
                        ORDERS
                    </span>

                </div>


                {analytics.order_statuses.length === 0 ? (

                    <div className="analytics-empty">

                        <div className="analytics-empty-icon">
                            <ShoppingCart size={24} />
                        </div>

                        <strong>
                            No order status data
                        </strong>

                        <span>
                            Order statistics will appear here.
                        </span>

                    </div>

                ) : (

                    <div className="analytics-status-grid">

                        {analytics.order_statuses.map(
                            (item) => (

                                <div
                                    className="analytics-status-card"
                                    key={item.order_status}
                                >

                                    <div className="analytics-status-top">

                                        <div className="analytics-status-icon">
                                            <ShoppingCart
                                                size={17}
                                            />
                                        </div>

                                        <span>
                                            STATUS
                                        </span>

                                    </div>

                                    <strong>
                                        {item.count}
                                    </strong>

                                    <p>
                                        {formatStatus(
                                            item.order_status
                                        )}
                                    </p>

                                </div>

                            )
                        )}

                    </div>
                )}

            </div>


            {/* ==========================================
                TOP PRODUCTS
            ========================================== */}

            <div className="analytics-section">

                <div className="analytics-section-header">

                    <div className="analytics-section-title">

                        <div className="analytics-section-icon">
                            <Package size={18} />
                        </div>

                        <div>
                            <h2>
                                Top Products
                            </h2>

                            <p>
                                Best-performing products by sales.
                            </p>
                        </div>

                    </div>

                    <span className="analytics-section-badge">
                        PRODUCTS
                    </span>

                </div>

                {analytics.top_products.length === 0 ? (

                    <div className="analytics-empty">

                        <div className="analytics-empty-icon">
                            <Package size={24} />
                        </div>

                        <strong>
                            No product sales available
                        </strong>

                        <span>
                            Product performance will appear
                            after sales are recorded.
                        </span>

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

                                                <div className="analytics-primary-cell">

                                                    <span className="analytics-row-icon">
                                                        <Package
                                                            size={15}
                                                        />
                                                    </span>

                                                    <strong>
                                                        {
                                                            product.product_name
                                                        }
                                                    </strong>

                                                </div>

                                            </td>

                                            <td>
                                                {
                                                    product.units_sold
                                                }
                                            </td>

                                            <td>
                                                <strong className="analytics-revenue">
                                                    {formatCurrency(
                                                        product.revenue
                                                    )}
                                                </strong>
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

                    <div className="analytics-section-title">

                        <div className="analytics-section-icon">
                            <Layers3 size={18} />
                        </div>

                        <div>
                            <h2>
                                Top Categories
                            </h2>

                            <p>
                                Category performance across
                                your store.
                            </p>

                        </div>

                    </div>

                    <span className="analytics-section-badge">
                        CATEGORIES
                    </span>

                </div>

                {analytics.top_categories.length === 0 ? (

                    <div className="analytics-empty">

                        <div className="analytics-empty-icon">
                            <Layers3 size={24} />
                        </div>

                        <strong>
                            No category sales available
                        </strong>

                        <span>
                            Category performance will appear
                            after sales are recorded.
                        </span>

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

                                                <div className="analytics-primary-cell">

                                                    <span className="analytics-row-icon">
                                                        <Layers3
                                                            size={15}
                                                        />
                                                    </span>

                                                    <strong>
                                                        {
                                                            category.category_name
                                                        }
                                                    </strong>

                                                </div>

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
                                                <strong className="analytics-revenue">
                                                    {formatCurrency(
                                                        category.revenue
                                                    )}
                                                </strong>
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