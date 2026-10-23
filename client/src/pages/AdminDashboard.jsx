import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    async function fetchDashboard() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("tokyo_trendz_token");

            if (!token) {
                throw new Error("Authentication token is required");
            }

            const response = await fetch(
                "/api/admin/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to load dashboard"
                );
            }

            setStats(data.stats);
        } catch (error) {
            console.error("Dashboard error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    function formatCurrency(amount) {
        return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    }

    function formatStatus(status) {
        return status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    }

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-loading">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-error">
                    <h2>Unable to load dashboard</h2>
                    <p>{error}</p>

                    <button onClick={fetchDashboard}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>
                        Welcome back! Here's what's happening
                        with Tokyo Trendz.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={fetchDashboard}
                >
                    Refresh
                </button>
            </div>

            {/* ==========================================
                STAT CARDS
            ========================================== */}

            <div className="dashboard-cards">

                <div className="dashboard-card">
                    <div className="card-icon">
                        📦
                    </div>

                    <div className="card-content">
                        <span>Total Products</span>
                        <h2>
                            {stats.total_products}
                        </h2>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon">
                        🛍️
                    </div>

                    <div className="card-content">
                        <span>Total Orders</span>
                        <h2>
                            {stats.total_orders}
                        </h2>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon">
                        👥
                    </div>

                    <div className="card-content">
                        <span>Total Customers</span>
                        <h2>
                            {stats.total_customers}
                        </h2>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon">
                        ₹
                    </div>

                    <div className="card-content">
                        <span>Total Revenue</span>
                        <h2>
                            {formatCurrency(
                                stats.total_revenue
                            )}
                        </h2>
                    </div>
                </div>

            </div>

            {/* ==========================================
                ORDER STATUS
            ========================================== */}

            <div className="dashboard-section">

                <div className="section-header">
                    <h2>Order Status</h2>
                </div>

                <div className="status-grid">

                    {Object.entries(
                        stats.order_statuses
                    ).map(([status, count]) => (
                        <div
                            className="status-card"
                            key={status}
                        >
                            <span className="status-name">
                                {formatStatus(status)}
                            </span>

                            <strong>
                                {count}
                            </strong>
                        </div>
                    ))}

                </div>

            </div>

            {/* ==========================================
    QUICK ACTIONS
========================================== */}
<div className="dashboard-section">
    <div className="section-header">
        <h2>Quick Actions</h2>
    </div>

    <div className="quick-actions">
        <Link to="/admin/products" className="quick-action">
            <span>📦</span>
            <div>
                <strong>Manage Products</strong>
                <small>Add, edit and delete products</small>
            </div>
        </Link>

        <Link to="/admin/orders" className="quick-action">
            <span>🛒</span>
            <div>
                <strong>Manage Orders</strong>
                <small>View and update orders</small>
            </div>
        </Link>

        <Link to="/admin/customers" className="quick-action">
            <span>👥</span>
            <div>
                <strong>Customers</strong>
                <small>View customer information</small>
            </div>
        </Link>

        <Link to="/admin/users" className="quick-action">
            <span>👤</span>
            <div>
                <strong>Users</strong>
                <small>Manage customer and admin roles</small>
            </div>
        </Link>

        <Link to="/admin/addresses" className="quick-action">
            <span>📍</span>
            <div>
                <strong>Addresses</strong>
                <small>Manage customer addresses</small>
            </div>
        </Link>

        <Link to="/admin/categories" className="quick-action">
            <span>📁</span>
            <div>
                <strong>Categories</strong>
                <small>Manage product categories</small>
            </div>
        </Link>
    </div>
</div>

            {/* ==========================================
                RECENT ORDERS
            ========================================== */}

            <div className="dashboard-section">

                <div className="section-header">
                    <h2>Recent Orders</h2>
                </div>

                {stats.recent_orders.length === 0 ? (
                    <div className="empty-state">
                        No orders found.
                    </div>
                ) : (
                    <div className="orders-table-wrapper">

                        <table className="orders-table">

                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>

                                {stats.recent_orders.map(
                                    (order) => (
                                        <tr key={order.id}>

                                            <td>
                                                <strong>
                                                    {order.order_number}
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="customer-info">
                                                    <strong>
                                                        {order.customer_name ||
                                                            "Unknown Customer"}
                                                    </strong>

                                                    <span>
                                                        {order.customer_email ||
                                                            "-"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    order.total_amount
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={`payment-badge ${order.payment_status}`}
                                                >
                                                    {formatStatus(
                                                        order.payment_status
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`order-status-badge ${order.order_status}`}
                                                >
                                                    {formatStatus(
                                                        order.order_status
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                {new Date(
                                                    order.created_at
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }
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

export default AdminDashboard;