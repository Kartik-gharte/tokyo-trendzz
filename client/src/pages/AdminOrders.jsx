import { useEffect, useMemo, useState } from "react";
import {
    Search,
    RefreshCw,
    Package,
    CreditCard,
    CalendarDays,
    User,
    Mail,
    IndianRupee,
    CheckCircle2,
    Clock3,
    XCircle,
    Truck,
    SlidersHorizontal
} from "lucide-react";

import "./AdminOrders.css";

const API_URL = "/api/admin/orders";

const ORDER_STATUSES = [
    { value: "placed", label: "Order Placed" },
    { value: "confirmed", label: "Confirmed" },
    { value: "packed", label: "Packed" },
    { value: "shipped", label: "Shipped" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
];

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [statusChanges, setStatusChanges] = useState({});
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders(showLoading = true) {
        try {
            if (showLoading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const token = localStorage.getItem("tokyo_trendz_token");

            if (!token) {
                throw new Error(
                    "Please log in as an admin to view orders."
                );
            }

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch orders"
                );
            }

            setOrders(data.orders || []);
        } catch (error) {
            console.error("Admin orders error:", error);
            setError(
                error.message || "Failed to fetch orders"
            );
        } finally {
            if (showLoading) {
                setLoading(false);
            }

            setRefreshing(false);
        }
    }

    function formatStatus(status) {
        const statusMap = {
            placed: "Order Placed",
            confirmed: "Confirmed",
            packed: "Packed",
            shipped: "Shipped",
            out_for_delivery: "Out for Delivery",
            delivered: "Delivered",
            cancelled: "Cancelled"
        };

        return statusMap[status] || status;
    }

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function getStatusClass(status) {
        return `status-${status || "default"}`;
    }

    function getPaymentStatusClass(status) {
        return `payment-${status || "default"}`;
    }

    function getStatusIcon(status) {
        switch (status) {
            case "placed":
                return <Clock3 size={14} />;

            case "confirmed":
                return <CheckCircle2 size={14} />;

            case "packed":
                return <Package size={14} />;

            case "shipped":
            case "out_for_delivery":
                return <Truck size={14} />;

            case "delivered":
                return <CheckCircle2 size={14} />;

            case "cancelled":
                return <XCircle size={14} />;

            default:
                return <Package size={14} />;
        }
    }

    function handleStatusChange(orderId, newStatus) {
        setStatusChanges((previous) => ({
            ...previous,
            [orderId]: newStatus
        }));

        setActionMessage("");
        setActionError("");
    }

    async function updateOrderStatus(order) {
        const newStatus =
            statusChanges[order.id] ?? order.order_status;

        if (newStatus === order.order_status) {
            setActionMessage(
                "This order already has that status."
            );
            setActionError("");
            return;
        }

        try {
            setUpdatingOrderId(order.id);
            setActionMessage("");
            setActionError("");

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Please log in again as an admin."
                );
            }

            const response = await fetch(
                `${API_URL}/${order.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update order status"
                );
            }

            setActionMessage(
                `Order #${order.id} updated to "${formatStatus(
                    newStatus
                )}".`
            );

            setStatusChanges((previous) => {
                const updated = { ...previous };
                delete updated[order.id];
                return updated;
            });

            await fetchOrders(false);
        } catch (error) {
            console.error(
                "Update order status error:",
                error
            );

            setActionError(
                error.message ||
                    "Failed to update order status"
            );
        } finally {
            setUpdatingOrderId(null);
        }
    }

    const filteredOrders = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesStatus =
                statusFilter === "all" ||
                order.order_status === statusFilter;

            if (!matchesStatus) {
                return false;
            }

            if (!search) {
                return true;
            }

            const searchableText = [
                order.id,
                order.order_number,
                order.customer_name,
                order.customer_email,
                order.payment_method,
                order.payment_status,
                order.order_status
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(search);
        });
    }, [orders, searchTerm, statusFilter]);

    const statusCounts = useMemo(() => {
        return {
            all: orders.length,
            placed: orders.filter(
                (order) => order.order_status === "placed"
            ).length,
            confirmed: orders.filter(
                (order) => order.order_status === "confirmed"
            ).length,
            packed: orders.filter(
                (order) => order.order_status === "packed"
            ).length,
            shipped: orders.filter(
                (order) => order.order_status === "shipped"
            ).length,
            out_for_delivery: orders.filter(
                (order) =>
                    order.order_status ===
                    "out_for_delivery"
            ).length,
            delivered: orders.filter(
                (order) =>
                    order.order_status === "delivered"
            ).length,
            cancelled: orders.filter(
                (order) =>
                    order.order_status === "cancelled"
            ).length
        };
    }, [orders]);

    if (loading) {
        return (
            <div className="admin-orders-page">
                <div className="admin-orders-loading">
                    <div className="admin-orders-spinner" />

                    <h2>Loading Orders</h2>

                    <p>
                        Fetching the latest customer orders...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-orders-page">
                <div className="admin-orders-error-card">
                    <XCircle size={42} />

                    <h2>Unable to Load Orders</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        className="admin-orders-primary-btn"
                        onClick={() => fetchOrders()}
                    >
                        <RefreshCw size={17} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-orders-page">
            {/* HEADER */}
            <div className="admin-orders-header">
                <div className="admin-orders-title-area">
                    <span className="admin-orders-eyebrow">
                        TOKYO TRENDZ / ADMIN
                    </span>

                    <h1>Orders</h1>

                    <p>
                        Manage customer orders, payments and
                        delivery status.
                    </p>
                </div>

                <div className="admin-orders-header-actions">
                    <button
                        type="button"
                        className="admin-orders-refresh-btn"
                        onClick={() => fetchOrders(false)}
                        disabled={refreshing}
                    >
                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "admin-orders-spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                    <div className="admin-orders-count">
                        <Package size={18} />
                        <span>{orders.length}</span>
                        Orders
                    </div>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="admin-orders-stats">
                <button
                    type="button"
                    className={`admin-order-stat-card ${
                        statusFilter === "all"
                            ? "active"
                            : ""
                    }`}
                    onClick={() => setStatusFilter("all")}
                >
                    <div className="admin-order-stat-icon">
                        <Package size={19} />
                    </div>

                    <div>
                        <span>Total Orders</span>
                        <strong>{statusCounts.all}</strong>
                    </div>
                </button>

                <button
                    type="button"
                    className={`admin-order-stat-card ${
                        statusFilter === "placed"
                            ? "active"
                            : ""
                    }`}
                    onClick={() => setStatusFilter("placed")}
                >
                    <div className="admin-order-stat-icon">
                        <Clock3 size={19} />
                    </div>

                    <div>
                        <span>Placed</span>
                        <strong>
                            {statusCounts.placed}
                        </strong>
                    </div>
                </button>

                <button
                    type="button"
                    className={`admin-order-stat-card ${
                        statusFilter === "shipped"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        setStatusFilter("shipped")
                    }
                >
                    <div className="admin-order-stat-icon">
                        <Truck size={19} />
                    </div>

                    <div>
                        <span>Shipped</span>
                        <strong>
                            {statusCounts.shipped}
                        </strong>
                    </div>
                </button>

                <button
                    type="button"
                    className={`admin-order-stat-card ${
                        statusFilter === "delivered"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        setStatusFilter("delivered")
                    }
                >
                    <div className="admin-order-stat-icon">
                        <CheckCircle2 size={19} />
                    </div>

                    <div>
                        <span>Delivered</span>
                        <strong>
                            {statusCounts.delivered}
                        </strong>
                    </div>
                </button>

                <button
                    type="button"
                    className={`admin-order-stat-card ${
                        statusFilter === "cancelled"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        setStatusFilter("cancelled")
                    }
                >
                    <div className="admin-order-stat-icon">
                        <XCircle size={19} />
                    </div>

                    <div>
                        <span>Cancelled</span>
                        <strong>
                            {statusCounts.cancelled}
                        </strong>
                    </div>
                </button>
            </div>

            {/* SEARCH + FILTER */}
            <div className="admin-orders-toolbar">
                <div className="admin-orders-search">
                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search by order ID, customer, email..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            className="admin-orders-clear-search"
                            onClick={() =>
                                setSearchTerm("")
                            }
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>

                <div className="admin-orders-filter">
                    <SlidersHorizontal size={17} />

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                        aria-label="Filter orders by status"
                    >
                        <option value="all">
                            All Statuses
                        </option>

                        {ORDER_STATUSES.map((status) => (
                            <option
                                key={status.value}
                                value={status.value}
                            >
                                {status.label} (
                                {statusCounts[status.value] ||
                                    0}
                                )
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ACTION MESSAGE */}
            {actionMessage && (
                <div
                    className="admin-orders-action-message success"
                    role="status"
                >
                    <CheckCircle2 size={18} />
                    <span>{actionMessage}</span>
                </div>
            )}

            {actionError && (
                <div
                    className="admin-orders-action-message error"
                    role="alert"
                >
                    <XCircle size={18} />
                    <span>{actionError}</span>
                </div>
            )}

            {/* RESULTS */}
            <div className="admin-orders-results">
                Showing{" "}
                <strong>{filteredOrders.length}</strong>{" "}
                of <strong>{orders.length}</strong> orders
            </div>

            {filteredOrders.length === 0 ? (
                <div className="admin-orders-empty">
                    <div className="admin-orders-empty-icon">
                        <Search size={28} />
                    </div>

                    <h2>No Orders Found</h2>

                    <p>
                        {searchTerm || statusFilter !== "all"
                            ? "Try changing your search or filter."
                            : "There are currently no customer orders."}
                    </p>

                    {(searchTerm ||
                        statusFilter !== "all") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                            }}
                            className="admin-orders-primary-btn"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="admin-orders-table-wrapper">
                    <table className="admin-orders-table">
                        <thead>
                            <tr>
                                <th>ORDER</th>
                                <th>CUSTOMER</th>
                                <th>TOTAL</th>
                                <th>PAYMENT</th>
                                <th>ORDER STATUS</th>
                                <th>DATE</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredOrders.map((order) => {
                                const selectedStatus =
                                    statusChanges[order.id] ??
                                    order.order_status;

                                const isUpdating =
                                    updatingOrderId ===
                                    order.id;

                                return (
                                    <tr key={order.id}>
                                        {/* ORDER */}
                                        <td>
                                            <div className="admin-order-id">
                                                <span>
                                                    #
                                                    {order.id}
                                                </span>

                                                {order.order_number && (
                                                    <small>
                                                        {
                                                            order.order_number
                                                        }
                                                    </small>
                                                )}
                                            </div>
                                        </td>

                                        {/* CUSTOMER */}
                                        <td>
                                            <div className="admin-order-customer">
                                                <div className="admin-order-avatar">
                                                    <User
                                                        size={
                                                            17
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {
                                                            order.customer_name
                                                        }
                                                    </strong>

                                                    <span>
                                                        <Mail
                                                            size={
                                                                13
                                                            }
                                                        />
                                                        {
                                                            order.customer_email
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* TOTAL */}
                                        <td>
                                            <div className="admin-order-total">
                                                <IndianRupee
                                                    size={
                                                        15
                                                    }
                                                />

                                                {Number(
                                                    order.total_amount
                                                ).toFixed(
                                                    2
                                                )}
                                            </div>
                                        </td>

                                        {/* PAYMENT */}
                                        <td>
                                            <div className="admin-order-payment">
                                                <span
                                                    className={`admin-payment-method ${
                                                        order.payment_method ===
                                                        "online"
                                                            ? "online"
                                                            : "cod"
                                                    }`}
                                                >
                                                    <CreditCard
                                                        size={
                                                            14
                                                        }
                                                    />

                                                    {order.payment_method?.toUpperCase() ||
                                                        "-"}
                                                </span>

                                                <span
                                                    className={`admin-payment-status ${getPaymentStatusClass(
                                                        order.payment_status
                                                    )}`}
                                                >
                                                    {order.payment_status ||
                                                        "Unknown"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td>
                                            <div className="admin-order-status-wrapper">
                                                <div
                                                    className={`admin-order-status-badge ${getStatusClass(
                                                        order.order_status
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        order.order_status
                                                    )}

                                                    <span>
                                                        {formatStatus(
                                                            order.order_status
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="admin-order-status-control">
                                                    <select
                                                        value={
                                                            selectedStatus
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleStatusChange(
                                                                order.id,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            isUpdating
                                                        }
                                                        aria-label={`Status for order ${order.id}`}
                                                    >
                                                        {ORDER_STATUSES.map(
                                                            (
                                                                status
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        status.value
                                                                    }
                                                                    value={
                                                                        status.value
                                                                    }
                                                                >
                                                                    {
                                                                        status.label
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateOrderStatus(
                                                                order
                                                            )
                                                        }
                                                        disabled={
                                                            isUpdating ||
                                                            selectedStatus ===
                                                                order.order_status
                                                        }
                                                    >
                                                        {isUpdating
                                                            ? "..."
                                                            : "Update"}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>

                                        {/* DATE */}
                                        <td>
                                            <div className="admin-order-date">
                                                <CalendarDays
                                                    size={
                                                        15
                                                    }
                                                />

                                                <span>
                                                    {formatDate(
                                                        order.created_at
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;