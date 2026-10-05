import { useEffect, useState } from "react";
import {
    Search,
    Users,
    ShoppingCart,
    IndianRupee,
    Eye
} from "lucide-react";

import "./AdminCustomers.css";

function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCustomer, setSelectedCustomer] =
        useState(null);

    const [customerDetails, setCustomerDetails] =
        useState(null);

    const [loadingDetails, setLoadingDetails] =
        useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Authentication token is missing."
                );
            }

            const response = await fetch(
                "http://localhost:5000/api/admin/customers",
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
                    "Failed to fetch customers."
                );
            }

            setCustomers(data.customers || []);
        } catch (error) {
            console.error(
                "Fetch customers error:",
                error
            );

            setError(
                error.message ||
                "Failed to load customers."
            );
        } finally {
            setLoading(false);
        }
    }

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            customer.email
                ?.toLowerCase()
                .includes(search.toLowerCase())
    );
    async function fetchCustomerDetails(customerId) {
        try {
            setLoadingDetails(true);
            setCustomerDetails(null);

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Authentication token is missing."
                );
            }

            const response = await fetch(
                `http://localhost:5000/api/admin/customers/${customerId}`,
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
                    "Failed to fetch customer details."
                );
            }

            setSelectedCustomer(data.customer);
            setCustomerDetails(data);
        } catch (error) {
            console.error(
                "Fetch customer details error:",
                error
            );

            alert(
                error.message ||
                "Failed to load customer details."
            );
        } finally {
            setLoadingDetails(false);
        }
    }


    function formatDate(date) {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    function formatAmount(amount) {
        return Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    }

    return (
        <div className="admin-customers">
            <div className="admin-customers-header">
                <div>
                    <h1>Customers</h1>
                    <p>
                        Manage and view your registered
                        customers.
                    </p>
                </div>
            </div>

            <div className="customer-summary">
                <div className="customer-summary-card">
                    <div className="customer-summary-icon">
                        <Users size={21} />
                    </div>

                    <div>
                        <span>Total Customers</span>
                        <strong>
                            {customers.length}
                        </strong>
                    </div>
                </div>

                <div className="customer-summary-card">
                    <div className="customer-summary-icon">
                        <ShoppingCart size={21} />
                    </div>

                    <div>
                        <span>Total Orders</span>
                        <strong>
                            {customers.reduce(
                                (total, customer) =>
                                    total +
                                    Number(
                                        customer.order_count ||
                                        0
                                    ),
                                0
                            )}
                        </strong>
                    </div>
                </div>

                <div className="customer-summary-card">
                    <div className="customer-summary-icon">
                        <IndianRupee size={21} />
                    </div>

                    <div>
                        <span>Total Customer Spending</span>
                        <strong>
                            ₹
                            {formatAmount(
                                customers.reduce(
                                    (total, customer) =>
                                        total +
                                        Number(
                                            customer.total_spent ||
                                            0
                                        ),
                                    0
                                )
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="customers-panel">
                <div className="customers-panel-header">
                    <div>
                        <h2>All Customers</h2>
                        <span>
                            {filteredCustomers.length}{" "}
                            customer
                            {filteredCustomers.length !==
                                1
                                ? "s"
                                : ""}
                        </span>
                    </div>

                    <div className="customer-search">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="customers-state">
                        <div className="customers-spinner"></div>
                        <p>
                            Loading customers...
                        </p>
                    </div>
                ) : error ? (
                    <div className="customers-state error">
                        <p>{error}</p>

                        <button
                            onClick={fetchCustomers}
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredCustomers.length ===
                    0 ? (
                    <div className="customers-state">
                        <Users size={40} />
                        <p>
                            {search
                                ? "No customers found."
                                : "No customers available."}
                        </p>
                    </div>
                ) : (
                    <div className="customers-table-wrapper">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Orders</th>
                                    <th>Total Spent</th>
                                    <th>Joined</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCustomers.map(
                                    (customer) => (
                                        <tr
                                            key={
                                                customer.id
                                            }
                                        >
                                            <td>
                                                <div className="customer-name-cell">
                                                    <div className="customer-avatar">
                                                        {customer.name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            .toUpperCase() ||
                                                            "C"}
                                                    </div>

                                                    <strong>
                                                        {customer.name ||
                                                            "Unknown"}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="customer-email">
                                                    {
                                                        customer.email
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <span className="customer-order-count">
                                                    {
                                                        customer.order_count
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <strong>
                                                    ₹
                                                    {formatAmount(
                                                        customer.total_spent
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    customer.created_at
                                                )}
                                            </td>

                                            <td>
                                                <button
                                                    className="customer-view-button"
                                                    title="View customer"
                                                    onClick={() =>
                                                        fetchCustomerDetails(customer.id)
                                                    }
                                                >
                                                    <Eye size={17} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedCustomer && (
    <div className="customer-modal-overlay">
        <div className="customer-modal">
            <div className="customer-modal-header">
                <div>
                    <h2>Customer Details</h2>
                    <p>
                        Complete customer information
                    </p>
                </div>

                <button
                    className="customer-modal-close"
                    onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerDetails(null);
                    }}
                >
                    ×
                </button>
            </div>

            {loadingDetails ? (
                <div className="customer-modal-loading">
                    <div className="customers-spinner"></div>
                    <p>
                        Loading customer details...
                    </p>
                </div>
            ) : customerDetails ? (
                <>
                    <div className="customer-details-profile">
                        <div className="customer-details-avatar">
                            {selectedCustomer.name
                                ?.charAt(0)
                                .toUpperCase() || "C"}
                        </div>

                        <div>
                            <h3>
                                {selectedCustomer.name ||
                                    "Unknown Customer"}
                            </h3>

                            <p>
                                {selectedCustomer.email}
                            </p>

                            <span>
                                Customer ID: #
                                {selectedCustomer.id}
                            </span>
                        </div>
                    </div>

                    <div className="customer-details-stats">
                        <div>
                            <span>Total Orders</span>
                            <strong>
                                {
                                    customerDetails.orders
                                        .length
                                }
                            </strong>
                        </div>

                        <div>
                            <span>Total Spent</span>
                            <strong>
                                ₹
                                {formatAmount(
                                    customerDetails.orders.reduce(
                                        (total, order) =>
                                            order.order_status !==
                                            "cancelled"
                                                ? total +
                                                  Number(
                                                      order.total_amount ||
                                                          0
                                                  )
                                                : total,
                                        0
                                    )
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Joined</span>
                            <strong>
                                {formatDate(
                                    selectedCustomer.created_at
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="customer-orders-section">
                        <h3>Order History</h3>

                        {customerDetails.orders.length ===
                        0 ? (
                            <div className="customer-no-orders">
                                <ShoppingCart size={30} />
                                <p>
                                    This customer has no
                                    orders yet.
                                </p>
                            </div>
                        ) : (
                            <div className="customer-orders-table-wrapper">
                                <table className="customer-orders-table">
                                    <thead>
                                        <tr>
                                            <th>Order</th>
                                            <th>Amount</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {customerDetails.orders.map(
                                            (order) => (
                                                <tr
                                                    key={
                                                        order.id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                order.order_number
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        ₹
                                                        {formatAmount(
                                                            order.total_amount
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span className="customer-payment-badge">
                                                            {order.payment_method?.toUpperCase()}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`customer-status-badge ${order.order_status}`}
                                                        >
                                                            {order.order_status
                                                                ?.replace(
                                                                    /_/g,
                                                                    " "
                                                                )
                                                                .replace(
                                                                    /\b\w/g,
                                                                    (char) =>
                                                                        char.toUpperCase()
                                                                )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            order.created_at
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
                </>
            ) : null}
        </div>
    </div>
)}
        </div>
    );
}

export default AdminCustomers;