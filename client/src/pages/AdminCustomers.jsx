import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Users,
    ShoppingCart,
    IndianRupee,
    Eye,
    X,
    Mail,
    CalendarDays,
    Package,
    CreditCard,
    CheckCircle2,
    Clock3,
    Truck,
    XCircle,
    UserRound,
    RefreshCw
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
                "/api/admin/customers",
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
                `/api/admin/customers/${customerId}`,
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

    function closeCustomerModal() {
        setSelectedCustomer(null);
        setCustomerDetails(null);
    }

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    function formatDateTime(date) {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
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

    function formatOrderStatus(status) {
        if (!status) {
            return "Unknown";
        }

        const statusMap = {
            placed: "Order Placed",
            confirmed: "Confirmed",
            packed: "Packed",
            shipped: "Shipped",
            out_for_delivery: "Out for Delivery",
            delivered: "Delivered",
            cancelled: "Cancelled"
        };

        return (
            statusMap[status] ||
            status
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                )
        );
    }

    function getStatusIcon(status) {
        switch (status) {
            case "placed":
                return <Clock3 size={13} />;

            case "confirmed":
                return <CheckCircle2 size={13} />;

            case "packed":
                return <Package size={13} />;

            case "shipped":
            case "out_for_delivery":
                return <Truck size={13} />;

            case "delivered":
                return <CheckCircle2 size={13} />;

            case "cancelled":
                return <XCircle size={13} />;

            default:
                return <Package size={13} />;
        }
    }

    const filteredCustomers = useMemo(() => {
        const searchValue = search
            .trim()
            .toLowerCase();

        if (!searchValue) {
            return customers;
        }

        return customers.filter((customer) => {
            const name =
                customer.name?.toLowerCase() || "";

            const email =
                customer.email?.toLowerCase() || "";

            return (
                name.includes(searchValue) ||
                email.includes(searchValue)
            );
        });
    }, [customers, search]);

    const totalOrders = useMemo(() => {
        return customers.reduce(
            (total, customer) =>
                total +
                Number(customer.order_count || 0),
            0
        );
    }, [customers]);

    const totalSpent = useMemo(() => {
        return customers.reduce(
            (total, customer) =>
                total +
                Number(customer.total_spent || 0),
            0
        );
    }, [customers]);

    const averageSpent = useMemo(() => {
        if (customers.length === 0) {
            return 0;
        }

        return totalSpent / customers.length;
    }, [customers.length, totalSpent]);

    const customerOrderTotal = useMemo(() => {
        if (!customerDetails?.orders) {
            return 0;
        }

        return customerDetails.orders.reduce(
            (total, order) => {
                if (
                    order.order_status ===
                    "cancelled"
                ) {
                    return total;
                }

                return (
                    total +
                    Number(
                        order.total_amount || 0
                    )
                );
            },
            0
        );
    }, [customerDetails]);

    return (
        <div className="admin-customers">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-customers-header">
                <div>
                    <span className="customers-eyebrow">
                        TOKYO TRENDZ / ADMIN
                    </span>

                    <h1>Customers</h1>

                    <p>
                        Manage registered customers and
                        review their order activity.
                    </p>
                </div>

                <button
                    type="button"
                    className="customers-refresh-button"
                    onClick={fetchCustomers}
                    disabled={loading}
                >
                    <RefreshCw
                        size={16}
                        className={
                            loading
                                ? "customers-refresh-spin"
                                : ""
                        }
                    />

                    Refresh
                </button>
            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

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

                        <small>
                            Registered accounts
                        </small>
                    </div>
                </div>

                <div className="customer-summary-card">
                    <div className="customer-summary-icon">
                        <ShoppingCart size={21} />
                    </div>

                    <div>
                        <span>Total Orders</span>

                        <strong>
                            {totalOrders}
                        </strong>

                        <small>
                            Orders from customers
                        </small>
                    </div>
                </div>

                <div className="customer-summary-card">
                    <div className="customer-summary-icon">
                        <IndianRupee size={21} />
                    </div>

                    <div>
                        <span>Total Customer Spending</span>

                        <strong>
                            ₹{formatAmount(totalSpent)}
                        </strong>

                        <small>
                            All customer spending
                        </small>
                    </div>
                </div>

                <div className="customer-summary-card">
                    <div className="customer-summary-icon">
                        <IndianRupee size={21} />
                    </div>

                    <div>
                        <span>Average Spending</span>

                        <strong>
                            ₹{formatAmount(averageSpent)}
                        </strong>

                        <small>
                            Per registered customer
                        </small>
                    </div>
                </div>
            </div>

            {/* =================================================
                MAIN PANEL
            ================================================= */}

            <div className="customers-panel">
                <div className="customers-panel-header">
                    <div>
                        <span className="customers-panel-eyebrow">
                            CUSTOMER DIRECTORY
                        </span>

                        <h2>All Customers</h2>

                        <p>
                            Showing{" "}
                            <strong>
                                {filteredCustomers.length}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {customers.length}
                            </strong>{" "}
                            customers
                        </p>
                    </div>

                    <div className="customer-search">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                className="customer-search-clear"
                                onClick={() =>
                                    setSearch("")
                                }
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="customers-state">
                        <div className="customers-spinner" />

                        <h3>
                            Loading Customers
                        </h3>

                        <p>
                            Fetching customer data...
                        </p>
                    </div>
                ) : error ? (
                    <div className="customers-state error">
                        <XCircle size={40} />

                        <h3>
                            Unable to Load Customers
                        </h3>

                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={fetchCustomers}
                        >
                            <RefreshCw size={15} />
                            Try Again
                        </button>
                    </div>
                ) : filteredCustomers.length ===
                  0 ? (
                    <div className="customers-state">
                        <div className="customers-empty-icon">
                            <Users size={30} />
                        </div>

                        <h3>
                            No Customers Found
                        </h3>

                        <p>
                            {search
                                ? "Try changing your search."
                                : "No customers are available yet."}
                        </p>

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="customers-table-wrapper">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>CUSTOMER</th>
                                    <th>EMAIL</th>
                                    <th>ORDERS</th>
                                    <th>TOTAL SPENT</th>
                                    <th>JOINED</th>
                                    <th>ACTION</th>
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

                                                    <div className="customer-name-info">
                                                        <strong>
                                                            {customer.name ||
                                                                "Unknown Customer"}
                                                        </strong>

                                                        <span>
                                                            ID #
                                                            {
                                                                customer.id
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="customer-email">
                                                    <Mail
                                                        size={
                                                            14
                                                        }
                                                    />

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
                                                <strong className="customer-spending">
                                                    ₹
                                                    {formatAmount(
                                                        customer.total_spent
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="customer-joined">
                                                    <CalendarDays
                                                        size={
                                                            14
                                                        }
                                                    />

                                                    {formatDate(
                                                        customer.created_at
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="customer-view-button"
                                                    title="View customer"
                                                    onClick={() =>
                                                        fetchCustomerDetails(
                                                            customer.id
                                                        )
                                                    }
                                                >
                                                    <Eye
                                                        size={
                                                            17
                                                        }
                                                    />

                                                    <span>
                                                        View
                                                    </span>
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

            {/* =================================================
                CUSTOMER DETAILS MODAL
            ================================================= */}

            {selectedCustomer && (
                <div
                    className="customer-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCustomerModal();
                        }
                    }}
                >
                    <div className="customer-modal">
                        <div className="customer-modal-header">
                            <div>
                                <span>
                                    CUSTOMER PROFILE
                                </span>

                                <h2>
                                    Customer Details
                                </h2>

                                <p>
                                    Complete customer
                                    information and order
                                    history.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="customer-modal-close"
                                onClick={
                                    closeCustomerModal
                                }
                                aria-label="Close customer details"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="customer-modal-loading">
                                <div className="customers-spinner" />

                                <h3>
                                    Loading Details
                                </h3>

                                <p>
                                    Fetching customer
                                    information...
                                </p>
                            </div>
                        ) : customerDetails ? (
                            <>
                                {/* PROFILE */}

                                <div className="customer-details-profile">
                                    <div className="customer-details-avatar">
                                        {selectedCustomer.name
                                            ?.charAt(0)
                                            .toUpperCase() ||
                                            "C"}
                                    </div>

                                    <div className="customer-details-profile-info">
                                        <h3>
                                            {selectedCustomer.name ||
                                                "Unknown Customer"}
                                        </h3>

                                        <p>
                                            <Mail
                                                size={14}
                                            />

                                            {
                                                selectedCustomer.email
                                            }
                                        </p>

                                        <span>
                                            Customer ID: #
                                            {
                                                selectedCustomer.id
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* STATS */}

                                <div className="customer-details-stats">
                                    <div>
                                        <div className="customer-detail-stat-icon">
                                            <ShoppingCart
                                                size={
                                                    17
                                                }
                                            />
                                        </div>

                                        <span>
                                            Total Orders
                                        </span>

                                        <strong>
                                            {
                                                customerDetails
                                                    .orders
                                                    .length
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <div className="customer-detail-stat-icon">
                                            <IndianRupee
                                                size={
                                                    17
                                                }
                                            />
                                        </div>

                                        <span>
                                            Total Spent
                                        </span>

                                        <strong>
                                            ₹
                                            {formatAmount(
                                                customerOrderTotal
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <div className="customer-detail-stat-icon">
                                            <CalendarDays
                                                size={
                                                    17
                                                }
                                            />
                                        </div>

                                        <span>
                                            Joined
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedCustomer.created_at
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                {/* ORDER HISTORY */}

                                <div className="customer-orders-section">
                                    <div className="customer-orders-section-header">
                                        <div>
                                            <span>
                                                PURCHASE ACTIVITY
                                            </span>

                                            <h3>
                                                Order History
                                            </h3>
                                        </div>

                                        <div className="customer-order-history-count">
                                            {
                                                customerDetails
                                                    .orders
                                                    .length
                                            }{" "}
                                            Orders
                                        </div>
                                    </div>

                                    {customerDetails.orders
                                        .length ===
                                    0 ? (
                                        <div className="customer-no-orders">
                                            <ShoppingCart
                                                size={32}
                                            />

                                            <h4>
                                                No Orders Yet
                                            </h4>

                                            <p>
                                                This customer
                                                has not placed
                                                any orders.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="customer-orders-table-wrapper">
                                            <table className="customer-orders-table">
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            ORDER
                                                        </th>

                                                        <th>
                                                            AMOUNT
                                                        </th>

                                                        <th>
                                                            PAYMENT
                                                        </th>

                                                        <th>
                                                            STATUS
                                                        </th>

                                                        <th>
                                                            DATE
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {customerDetails.orders.map(
                                                        (
                                                            order
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    order.id
                                                                }
                                                            >
                                                                <td>
                                                                    <div className="customer-modal-order-id">
                                                                        <Package
                                                                            size={
                                                                                14
                                                                            }
                                                                        />

                                                                        <strong>
                                                                            {order.order_number ||
                                                                                `#${order.id}`}
                                                                        </strong>
                                                                    </div>
                                                                </td>

                                                                <td>
                                                                    <strong className="customer-modal-amount">
                                                                        ₹
                                                                        {formatAmount(
                                                                            order.total_amount
                                                                        )}
                                                                    </strong>
                                                                </td>

                                                                <td>
                                                                    <span
                                                                        className={`customer-payment-badge ${
                                                                            order.payment_method ===
                                                                            "online"
                                                                                ? "online"
                                                                                : "cod"
                                                                        }`}
                                                                    >
                                                                        <CreditCard
                                                                            size={
                                                                                12
                                                                            }
                                                                        />

                                                                        {order.payment_method?.toUpperCase() ||
                                                                            "-"}
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    <span
                                                                        className={`customer-status-badge ${order.order_status}`}
                                                                    >
                                                                        {getStatusIcon(
                                                                            order.order_status
                                                                        )}

                                                                        {
                                                                            formatOrderStatus(
                                                                                order.order_status
                                                                            )
                                                                        }
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    <span className="customer-modal-date">
                                                                        {formatDateTime(
                                                                            order.created_at
                                                                        )}
                                                                    </span>
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