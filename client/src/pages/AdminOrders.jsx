import { useEffect, useState } from "react";
import "./AdminOrders.css";

const API_URL = "http://localhost:5000/api/admin/orders";

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
    const [error, setError] = useState("");
    const [statusChanges, setStatusChanges] = useState({});
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders(showLoading = true) {
        try {
            if (showLoading) {
                setLoading(true);
            }

            setError("");

            const token = localStorage.getItem("tokyo_trendz_token");

            if (!token) {
                throw new Error("Please log in as an admin to view orders.");
            }

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch orders");
            }

            setOrders(data.orders || []);
        } catch (error) {
            console.error("Admin orders error:", error);
            setError(error.message || "Failed to fetch orders");
        } finally {
            if (showLoading) {
                setLoading(false);
            }
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
        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
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
        const newStatus = statusChanges[order.id] ?? order.order_status;

        if (newStatus === order.order_status) {
            setActionMessage("This order already has that status.");
            setActionError("");
            return;
        }

        try {
            setUpdatingOrderId(order.id);
            setActionMessage("");
            setActionError("");

            const token = localStorage.getItem("tokyo_trendz_token");

            if (!token) {
                throw new Error("Please log in again as an admin.");
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
                    data.message || "Failed to update order status"
                );
            }

            setActionMessage(
                `Order #${order.id} updated to "${formatStatus(newStatus)}".`
            );

            setStatusChanges((previous) => {
                const updated = { ...previous };
                delete updated[order.id];
                return updated;
            });

            await fetchOrders(false);
        } catch (error) {
            console.error("Update order status error:", error);
            setActionError(error.message || "Failed to update order status");
        } finally {
            setUpdatingOrderId(null);
        }
    }

    if (loading) {
        return (
            <div className="admin-orders-page">
                <h1>Admin Orders</h1>
                <p className="admin-orders-message">
                    Loading orders...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-orders-page">
                <h1>Admin Orders</h1>
                <p className="admin-orders-error">{error}</p>
                <button
                    type="button"
                    onClick={() => fetchOrders()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="admin-orders-page">
            <div className="admin-orders-header">
                <div>
                    <h1>Admin Orders</h1>
                    <p>Manage all customer orders</p>
                </div>

                <div className="admin-orders-count">
                    {orders.length} Orders
                </div>
            </div>

            {actionMessage && (
                <p className="admin-orders-message" role="status">
                    {actionMessage}
                </p>
            )}

            {actionError && (
                <p className="admin-orders-error" role="alert">
                    {actionError}
                </p>
            )}

            {orders.length === 0 ? (
                <div className="admin-orders-empty">
                    <h2>No Orders Found</h2>
                    <p>There are currently no customer orders.</p>
                </div>
            ) : (
                <div className="admin-orders-table-wrapper">
                    <table className="admin-orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Payment Status</th>
                                <th>Order Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => {
                                const selectedStatus =
                                    statusChanges[order.id] ??
                                    order.order_status;

                                const isUpdating =
                                    updatingOrderId === order.id;

                                return (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>

                                        <td>{order.customer_name}</td>

                                        <td>{order.customer_email}</td>

                                        <td>
                                            ₹
                                            {Number(
                                                order.total_amount
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            {order.payment_method?.toUpperCase()}
                                        </td>

                                        <td>{order.payment_status}</td>

                                        <td>
                                            <div className="admin-order-status-control">
                                                <select
                                                    value={selectedStatus}
                                                    onChange={(event) =>
                                                        handleStatusChange(
                                                            order.id,
                                                            event.target.value
                                                        )
                                                    }
                                                    disabled={isUpdating}
                                                    aria-label={`Status for order ${order.id}`}
                                                >
                                                    {ORDER_STATUSES.map(
                                                        (status) => (
                                                            <option
                                                                key={status.value}
                                                                value={status.value}
                                                            >
                                                                {status.label}
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateOrderStatus(order)
                                                    }
                                                    disabled={
                                                        isUpdating ||
                                                        selectedStatus ===
                                                            order.order_status
                                                    }
                                                >
                                                    {isUpdating
                                                        ? "Updating..."
                                                        : "Update"}
                                                </button>
                                            </div>

                                            <small>
                                                Current:{" "}
                                                {formatStatus(
                                                    order.order_status
                                                )}
                                            </small>
                                        </td>

                                        <td>
                                            {formatDate(order.created_at)}
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