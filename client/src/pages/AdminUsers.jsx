import { useEffect, useState } from "react";
import {
    Search,
    Users,
    User,
    ShieldCheck,
    ShoppingCart,
    Eye,
    X,
    Shield,
    UserRound
} from "lucide-react";

import "./AdminUsers.css";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const response = await fetch(
                "http://localhost:5000/api/admin/users",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch users"
                );
            }

            setUsers(data.users || []);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function fetchUserDetails(userId) {
        try {
            setSelectedUser(userId);
            setLoadingDetails(true);
            setUserDetails(null);

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const response = await fetch(
                `http://localhost:5000/api/admin/users/${userId}`,
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
                        "Failed to fetch user details"
                );
            }

            setUserDetails(data);
        } catch (error) {
            console.error(error);
            alert(error.message);
            setSelectedUser(null);
        } finally {
            setLoadingDetails(false);
        }
    }

    async function handleRoleChange(userId, currentRole) {
        const newRole =
            currentRole === "admin"
                ? "customer"
                : "admin";

        const confirmed = window.confirm(
            `Change this user's role from ${currentRole} to ${newRole}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const response = await fetch(
                `http://localhost:5000/api/admin/users/${userId}/role`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        role: newRole
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to update user role"
                );
            }

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === userId
                        ? {
                              ...user,
                              role: newRole
                          }
                        : user
                )
            );

            if (
                userDetails?.user?.id === userId
            ) {
                setUserDetails((current) => ({
                    ...current,
                    user: {
                        ...current.user,
                        role: newRole
                    }
                }));
            }

            alert("User role updated successfully.");
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
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

    function formatAmount(amount) {
        return `₹${Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;
    }

    const currentUser = JSON.parse(
        localStorage.getItem(
            "tokyo_trendz_user"
        ) || "null"
    );

    const filteredUsers = users.filter((user) => {
        const searchText = search
            .trim()
            .toLowerCase();

        if (!searchText) {
            return true;
        }

        return (
            user.name
                ?.toLowerCase()
                .includes(searchText) ||
            user.email
                ?.toLowerCase()
                .includes(searchText) ||
            user.phone
                ?.toLowerCase()
                .includes(searchText) ||
            user.role
                ?.toLowerCase()
                .includes(searchText)
        );
    });

    const totalUsers = users.length;

    const totalCustomers = users.filter(
        (user) => user.role === "customer"
    ).length;

    const totalAdmins = users.filter(
        (user) => user.role === "admin"
    ).length;

    const totalOrders = users.reduce(
        (total, user) =>
            total + Number(user.order_count || 0),
        0
    );

    return (
        <div className="admin-users-page">

            {/* Header */}

            <div className="admin-page-header">
                <div>
                    <h1>Users</h1>
                    <p>
                        Manage customers and administrator
                        accounts
                    </p>
                </div>
            </div>


            {/* Statistics */}

            <div className="admin-users-stats">

                <div className="admin-user-stat-card">

                    <div className="admin-user-stat-icon">
                        <Users size={22} />
                    </div>

                    <div>
                        <span>Total Users</span>
                        <strong>
                            {totalUsers}
                        </strong>
                    </div>

                </div>


                <div className="admin-user-stat-card">

                    <div className="admin-user-stat-icon">
                        <UserRound size={22} />
                    </div>

                    <div>
                        <span>Customers</span>
                        <strong>
                            {totalCustomers}
                        </strong>
                    </div>

                </div>


                <div className="admin-user-stat-card">

                    <div className="admin-user-stat-icon">
                        <ShieldCheck size={22} />
                    </div>

                    <div>
                        <span>Admins</span>
                        <strong>
                            {totalAdmins}
                        </strong>
                    </div>

                </div>


                <div className="admin-user-stat-card">

                    <div className="admin-user-stat-icon">
                        <ShoppingCart size={22} />
                    </div>

                    <div>
                        <span>Total Orders</span>
                        <strong>
                            {totalOrders}
                        </strong>
                    </div>

                </div>

            </div>


            {/* Toolbar */}

            <div className="admin-users-toolbar">

                <div className="admin-user-count">
                    <strong>
                        {filteredUsers.length}
                    </strong>

                    <span>
                        users found
                    </span>
                </div>


                <div className="admin-user-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>

            </div>


            {/* Content */}

            {loading ? (
                <div className="admin-user-state">
                    Loading users...
                </div>
            ) : error ? (
                <div className="admin-user-state error">
                    {error}
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="admin-user-empty">

                    <div className="admin-user-empty-icon">
                        <Users size={34} />
                    </div>

                    <h2>
                        No users found
                    </h2>

                    <p>
                        Try searching with a different
                        name, email, phone number, or role.
                    </p>

                </div>
            ) : (

                <div className="admin-users-table-wrapper">

                    <table className="admin-users-table">

                        <thead>

                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Orders</th>
                                <th>Total Spent</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>

                        </thead>


                        <tbody>

                            {filteredUsers.map(
                                (user) => {

                                    const isCurrentUser =
                                        Number(
                                            currentUser?.id
                                        ) ===
                                        Number(user.id);

                                    return (
                                        <tr
                                            key={user.id}
                                        >

                                            {/* User */}

                                            <td>

                                                <div className="admin-user-profile">

                                                    <div className="admin-user-avatar">

                                                        {user.name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            .toUpperCase() ||
                                                            "U"}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                user.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                user.email
                                                            }
                                                        </span>

                                                        {user.phone && (
                                                            <small>
                                                                {
                                                                    user.phone
                                                                }
                                                            </small>
                                                        )}

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Role */}

                                            <td>

                                                <div
                                                    className={`admin-user-role ${
                                                        user.role ===
                                                        "admin"
                                                            ? "admin"
                                                            : "customer"
                                                    }`}
                                                >

                                                    {user.role ===
                                                    "admin" ? (
                                                        <Shield
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    ) : (
                                                        <User
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    )}

                                                    <span>
                                                        {
                                                            user.role
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* Orders */}

                                            <td>

                                                <strong>
                                                    {
                                                        user.order_count
                                                    }
                                                </strong>

                                            </td>


                                            {/* Total Spent */}

                                            <td>

                                                <strong>
                                                    {formatAmount(
                                                        user.total_spent
                                                    )}
                                                </strong>

                                            </td>


                                            {/* Joined */}

                                            <td>
                                                {formatDate(
                                                    user.created_at
                                                )}
                                            </td>


                                            {/* Actions */}

                                            <td>

                                                <div className="admin-user-actions">

                                                    <button
                                                        className="admin-user-view"
                                                        onClick={() =>
                                                            fetchUserDetails(
                                                                user.id
                                                            )
                                                        }
                                                        title="View details"
                                                    >
                                                        <Eye
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>


                                                    {!isCurrentUser && (
                                                        <button
                                                            className="admin-user-role-button"
                                                            onClick={() =>
                                                                handleRoleChange(
                                                                    user.id,
                                                                    user.role
                                                                )
                                                            }
                                                            title={
                                                                user.role ===
                                                                "admin"
                                                                    ? "Make customer"
                                                                    : "Make admin"
                                                            }
                                                        >
                                                            <ShieldCheck
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>
                                                    )}

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                        </tbody>

                    </table>

                </div>

            )}


            {/* User Details Modal */}

            {selectedUser && (
                <div
                    className="admin-user-modal-overlay"
                    onClick={() =>
                        setSelectedUser(null)
                    }
                >

                    <div
                        className="admin-user-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="admin-user-modal-header">

                            <div>
                                <h2>
                                    User Details
                                </h2>

                                <p>
                                    Account and order
                                    information
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedUser(
                                        null
                                    )
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {loadingDetails ? (
                            <div className="admin-user-modal-loading">
                                Loading details...
                            </div>
                        ) : userDetails ? (

                            <>

                                <div className="admin-user-detail-profile">

                                    <div className="admin-user-detail-avatar">
                                        {userDetails.user.name
                                            ?.charAt(
                                                0
                                            )
                                            .toUpperCase()}
                                    </div>

                                    <div>
                                        <h3>
                                            {
                                                userDetails
                                                    .user
                                                    .name
                                            }
                                        </h3>

                                        <p>
                                            {
                                                userDetails
                                                    .user
                                                    .email
                                            }
                                        </p>

                                        <span
                                            className={`admin-user-detail-role ${
                                                userDetails
                                                    .user
                                                    .role ===
                                                "admin"
                                                    ? "admin"
                                                    : "customer"
                                            }`}
                                        >
                                            {
                                                userDetails
                                                    .user
                                                    .role
                                            }
                                        </span>
                                    </div>

                                </div>


                                <div className="admin-user-detail-grid">

                                    <div>
                                        <span>
                                            User ID
                                        </span>
                                        <strong>
                                            #
                                            {
                                                userDetails
                                                    .user
                                                    .id
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Phone
                                        </span>
                                        <strong>
                                            {userDetails
                                                .user
                                                .phone ||
                                                "Not provided"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Joined
                                        </span>
                                        <strong>
                                            {formatDate(
                                                userDetails
                                                    .user
                                                    .created_at
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Last Updated
                                        </span>
                                        <strong>
                                            {formatDate(
                                                userDetails
                                                    .user
                                                    .updated_at
                                            )}
                                        </strong>
                                    </div>

                                </div>


                                <div className="admin-user-orders-section">

                                    <div className="admin-user-orders-header">

                                        <h3>
                                            Order History
                                        </h3>

                                        <span>
                                            {
                                                userDetails
                                                    .orders
                                                    .length
                                            }{" "}
                                            orders
                                        </span>

                                    </div>


                                    {userDetails.orders
                                        .length === 0 ? (

                                        <div className="admin-user-no-orders">
                                            No orders found.
                                        </div>

                                    ) : (

                                        <div className="admin-user-orders-table">

                                            {userDetails.orders.map(
                                                (order) => (

                                                    <div
                                                        className="admin-user-order-row"
                                                        key={
                                                            order.id
                                                        }
                                                    >

                                                        <div>
                                                            <strong>
                                                                {
                                                                    order.order_number
                                                                }
                                                            </strong>

                                                            <span>
                                                                {formatDate(
                                                                    order.created_at
                                                                )}
                                                            </span>
                                                        </div>


                                                        <div>
                                                            <strong>
                                                                {formatAmount(
                                                                    order.total_amount
                                                                )}
                                                            </strong>

                                                            <span>
                                                                {
                                                                    order.payment_method
                                                                }
                                                            </span>
                                                        </div>


                                                        <span
                                                            className={`admin-user-order-status ${String(
                                                                order.order_status
                                                            ).replace(
                                                                /_/g,
                                                                "-"
                                                            )}`}
                                                        >
                                                            {String(
                                                                order.order_status
                                                            ).replace(
                                                                /_/g,
                                                                " "
                                                            )}
                                                        </span>

                                                    </div>

                                                )
                                            )}

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

export default AdminUsers;