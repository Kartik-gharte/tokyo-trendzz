import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Package,
    Heart,
    ShoppingBag,
    LogOut
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

import "./Account.css";

function Account() {
    const navigate = useNavigate();

    const { user, logout, token } = useAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [orderError, setOrderError] = useState("");

    useEffect(() => {
        async function fetchOrders() {
            if (!token) {
                setLoadingOrders(false);
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:5000/api/orders",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to fetch orders"
                    );
                }

                setOrders(data.orders || []);
            } catch (error) {
                console.error(
                    "Fetch orders error:",
                    error
                );

                setOrderError(
                    "Unable to load your orders."
                );
            } finally {
                setLoadingOrders(false);
            }
        }

        fetchOrders();
    }, [token]);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="account-page">
            <div className="account-container">

                {/* Account Header */}

                <div className="account-header">
                    <div className="account-avatar">
                        <User size={32} />
                    </div>

                    <div>
                        <h1>My Account</h1>

                        <p>
                            Welcome back,{" "}
                            {user?.name || "User"} 👋
                        </p>
                    </div>
                </div>


                {/* Account Information */}

                <div className="account-info">
                    <h2>Account Information</h2>

                    <div className="account-detail">
                        <span>Name</span>

                        <strong>
                            {user?.name || "Not available"}
                        </strong>
                    </div>

                    <div className="account-detail">
                        <span>Email</span>

                        <strong>
                            {user?.email || "Not available"}
                        </strong>
                    </div>
                </div>


                {/* Account Options */}

                <div className="account-options">

                    <a
                        href="#my-orders"
                        className="account-option"
                    >
                        <Package size={24} />

                        <div>
                            <h3>My Orders</h3>

                            <p>
                                {orders.length} order
                                {orders.length !== 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>
                    </a>


                    <Link
                        to="/wishlist"
                        className="account-option"
                    >
                        <Heart size={24} />

                        <div>
                            <h3>Wishlist</h3>

                            <p>
                                {wishlistCount} saved item
                                {wishlistCount !== 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>
                    </Link>


                    <Link
                        to="/cart"
                        className="account-option"
                    >
                        <ShoppingBag size={24} />

                        <div>
                            <h3>Shopping Bag</h3>

                            <p>
                                {cartCount} item
                                {cartCount !== 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>
                    </Link>

                </div>


                {/* My Orders */}

                <section
                    className="account-info"
                    id="my-orders"
                >
                    <h2>My Orders</h2>


                    {loadingOrders && (
                        <p>
                            Loading your orders...
                        </p>
                    )}


                    {!loadingOrders &&
                        orderError && (
                            <p>
                                {orderError}
                            </p>
                        )}


                    {!loadingOrders &&
                        !orderError &&
                        orders.length === 0 && (
                            <p>
                                You haven't placed any
                                orders yet.
                            </p>
                        )}


                    {!loadingOrders &&
                        !orderError &&
                        orders.length > 0 && (
                            <div>

                                {orders.map((order) => (

                                    <div
                                        key={order.id}
                                        className="account-detail"
                                    >

                                        <div>

                                            <strong>
                                                Order #
                                                {" "}
                                                {order.orderNumber}
                                            </strong>


                                            <p>
                                                Date:{" "}
                                                {new Date(
                                                    order.createdAt
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }
                                                )}
                                            </p>


                                            <p>
                                                {order.items.length} item
                                                {order.items.length !== 1
                                                    ? "s"
                                                    : ""}
                                            </p>


                                            {order.items.map(
                                                (item) => (

                                                    <p
                                                        key={item.id}
                                                    >
                                                        {item.productName}
                                                        {" • "}
                                                        Size:{" "}
                                                        {item.size}
                                                        {" • "}
                                                        Color:{" "}
                                                        {item.color}
                                                        {" • "}
                                                        Qty:{" "}
                                                        {item.quantity}
                                                    </p>

                                                )
                                            )}


                                            <p>
                                                Payment:{" "}
                                                {order.paymentMethod ===
                                                "cod"
                                                    ? "Cash on Delivery"
                                                    : order.paymentMethod}
                                            </p>


                                            <p>
                                                Payment Status:{" "}
                                                {order.paymentStatus}
                                            </p>


                                            <Link
                                                to={`/orders/${order.id}`}
                                                className="order-view-button"
                                            >
                                                View Order Details
                                            </Link>

                                        </div>


                                        <div>

                                            <strong>
                                                ₹
                                                {Number(
                                                    order.totalAmount
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>


                                           <p
    className={
        order.orderStatus === "cancelled"
            ? "order-status-cancelled"
            : ""
    }
>
    {order.orderStatus === "placed"
        ? "Order Placed"
        : order.orderStatus === "confirmed"
        ? "Confirmed"
        : order.orderStatus === "packed"
        ? "Packed"
        : order.orderStatus === "shipped"
        ? "Shipped"
        : order.orderStatus === "out_for_delivery"
        ? "Out for Delivery"
        : order.orderStatus === "delivered"
        ? "Delivered"
        : order.orderStatus === "cancelled"
        ? "Cancelled"
        : order.orderStatus}
</p>

                                        </div>

                                    </div>

                                ))}

                            </div>
                        )}

                </section>


                {/* Logout */}

                <button
                    type="button"
                    className="account-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                    Logout
                </button>

            </div>
        </div>
    );
}

export default Account;