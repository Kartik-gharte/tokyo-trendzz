
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    Check,
    MapPin
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import "./OrderDetails.css";

function OrderDetails() {
    const { orderId } = useParams();

    const { token } = useAuth();

    const {
        addExistingVariantToCart
    } = useCart();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);

    const orderStatuses = [
        "placed",
        "confirmed",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered"
    ];


    // --------------------------------
    // Fetch order
    // --------------------------------

    useEffect(() => {
        async function fetchOrder() {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:5000/api/orders",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to fetch order"
                    );
                }

                const foundOrder =
                    (data.orders || []).find(
                        (item) =>
                            String(item.id) ===
                            String(orderId)
                    );

                if (!foundOrder) {
                    setError(
                        "Order not found."
                    );

                    return;
                }

                setOrder(foundOrder);

            } catch (error) {
                console.error(
                    "Fetch order error:",
                    error
                );

                setError(
                    "Unable to load order details."
                );

            } finally {
                setLoading(false);
            }
        }

        fetchOrder();

    }, [token, orderId]);


    // --------------------------------
    // Reorder
    // --------------------------------

    async function handleReorder() {
        if (
            !order ||
            !order.items ||
            order.items.length === 0
        ) {
            alert(
                "No items found in this order."
            );

            return;
        }

        try {
            for (const item of order.items) {

                const response = await fetch(
                    `http://localhost:5000/api/products/${item.productId}`
                );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.product
                ) {
                    throw new Error(
                        `Unable to load ${item.productName}`
                    );
                }

                const product =
                    data.product;

                await addExistingVariantToCart(
                    product,
                    item.variantId,
                    item.quantity
                );
            }

            alert(
                "Items added to your cart successfully."
            );

        } catch (error) {
            console.error(
                "Reorder error:",
                error
            );

            alert(
                error.message ||
                "Unable to reorder these items."
            );
        }
    }


    // --------------------------------
    // Cancel order
    // --------------------------------

    async function handleCancelOrder() {
        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this order?"
            );

        if (!confirmed) {
            return;
        }

        setCancelling(true);

        try {
            const response = await fetch(
                `http://localhost:5000/api/orders/${orderId}/cancel`,
                {
                    method: "PATCH",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to cancel order"
                );
            }

            setOrder(
                (previousOrder) => ({
                    ...previousOrder,
                    orderStatus:
                        "cancelled"
                })
            );

            alert(
                "Order cancelled successfully."
            );

        } catch (error) {
            console.error(
                "Cancel order error:",
                error
            );

            alert(
                error.message ||
                "Unable to cancel order."
            );

        } finally {
            setCancelling(false);
        }
    }


    // --------------------------------
    // Loading
    // --------------------------------

    if (loading) {
        return (
            <div className="order-details-page">
                <div className="order-details-container">

                    <p className="order-details-message">
                        Loading order details...
                    </p>

                </div>
            </div>
        );
    }


    // --------------------------------
    // Error
    // --------------------------------

    if (error || !order) {
        return (
            <div className="order-details-page">
                <div className="order-details-container">

                    <Link
                        to="/account"
                        className="order-back-link"
                    >
                        <ArrowLeft size={18} />
                        Back to Account
                    </Link>

                    <div className="order-details-card">

                        <Package size={40} />

                        <h2>
                            {error ||
                                "Order not found."}
                        </h2>

                        <Link
                            to="/account"
                            className="order-primary-button"
                        >
                            Go to My Orders
                        </Link>

                    </div>

                </div>
            </div>
        );
    }


    // --------------------------------
    // Current order status
    // --------------------------------

    const currentStatusIndex =
        orderStatuses.indexOf(
            order.orderStatus
        );


    // --------------------------------
    // Page
    // --------------------------------

    return (
        <div className="order-details-page">

            <div className="order-details-container">

                {/* Back */}

                <Link
                    to="/account"
                    className="order-back-link"
                >
                    <ArrowLeft size={18} />
                    Back to Account
                </Link>


                {/* Header */}

                <div className="order-details-header">

                    <div>
                        <h1>
                            Order Details
                        </h1>

                        <p>
                            Order #{" "}
                            {order.orderNumber}
                        </p>
                    </div>

                    <div
                        className={
                            `order-status-badge ${
                                order.orderStatus ===
                                "cancelled"
                                    ? "cancelled"
                                    : ""
                            }`
                        }
                    >
                        {order.orderStatus}
                    </div>

                </div>


                {/* Order Tracking */}

                <div className="order-details-card">

                    <h2>
                        Order Tracking
                    </h2>

                    {order.orderStatus ===
                    "cancelled" ? (

                        <div className="cancelled-order-message">

                            <strong>
                                Order Cancelled
                            </strong>

                            <p>
                                This order has been
                                cancelled successfully.
                            </p>

                        </div>

                    ) : (

                        <div className="order-tracking">

                            {orderStatuses.map(
                                (
                                    status,
                                    index
                                ) => {

                                    const isCompleted =
                                        index <=
                                        currentStatusIndex;

                                    return (
                                        <div
                                            key={status}
                                            className={
                                                `tracking-step ${
                                                    isCompleted
                                                        ? "completed"
                                                        : ""
                                                }`
                                            }
                                        >

                                            <div className="tracking-icon">

                                                {isCompleted ? (
                                                    <Check
                                                        size={18}
                                                    />
                                                ) : (
                                                    <Package
                                                        size={18}
                                                    />
                                                )}

                                            </div>

                                            <div className="tracking-content">

                                                <strong>
                                                    {status
                                                        .replace(
                                                            /_/g,
                                                            " "
                                                        )
                                                        .replace(
                                                            /\b\w/g,
                                                            (
                                                                letter
                                                            ) =>
                                                                letter.toUpperCase()
                                                        )}
                                                </strong>

                                                {index ===
                                                    currentStatusIndex && (
                                                    <span>
                                                        Current Status
                                                    </span>
                                                )}

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </div>


                {/* Delivery Address */}

                <div className="order-details-card">

                    <div className="order-address-header">

                        <div className="order-address-icon">
                            <MapPin size={22} />
                        </div>

                        <div>

                            <h2>
                                Delivery Address
                            </h2>

                            <p>
                                Your order will be
                                delivered to this address.
                            </p>

                        </div>

                    </div>


                    <div className="order-address">

                        <strong>
                            {order.address.fullName}
                        </strong>

                        <p>
                            {order.address.phone}
                        </p>

                        <p>
                            {order.address.addressLine}
                        </p>

                        <p>
                            {order.address.city},{" "}
                            {order.address.state} -{" "}
                            {order.address.postalCode}
                        </p>

                        <p>
                            {order.address.country}
                        </p>

                    </div>

                </div>


                {/* Order Information */}

                <div className="order-details-card">

                    <div className="order-section-header">

                        <div>

                            <h2>
                                Order Information
                            </h2>

                            <p>
                                Placed on{" "}
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

                        </div>

                    </div>


                    <div className="order-items">

                        {order.items.map(
                            (item) => (

                                <div
                                    key={item.id}
                                    className="order-item"
                                >

                                    <div className="order-item-icon">

                                        <Package
                                            size={24}
                                        />

                                    </div>


                                    <div className="order-item-info">

                                        <h3>
                                            {item.productName}
                                        </h3>

                                        <p>
                                            Size:{" "}
                                            {item.size}
                                            {" • "}
                                            Color:{" "}
                                            {item.color}
                                        </p>

                                        <p>
                                            Quantity:{" "}
                                            {item.quantity}
                                        </p>

                                    </div>


                                    <strong>
                                        ₹
                                        {Number(
                                            item.price
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>

                                </div>

                            )
                        )}

                    </div>

                </div>


                {/* Payment + Summary */}

                <div className="order-details-grid">

                    {/* Payment */}

                    <div className="order-details-card">

                        <h2>
                            Payment
                        </h2>

                        <div className="order-info-row">

                            <span>
                                Method
                            </span>

                            <strong>
                                {order.paymentMethod ===
                                "cod"
                                    ? "Cash on Delivery"
                                    : order.paymentMethod}
                            </strong>

                        </div>


                        <div className="order-info-row">

                            <span>
                                Status
                            </span>

                            <strong>
                                {order.paymentStatus}
                            </strong>

                        </div>

                    </div>


                    {/* Summary */}

                    <div className="order-details-card">

                        <h2>
                            Order Summary
                        </h2>


                        <div className="order-info-row">

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    order.subtotal
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>


                        <div className="order-info-row">

                            <span>
                                Discount
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    order.discount
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>


                        <div className="order-info-row">

                            <span>
                                Shipping
                            </span>

                            <strong>
                                {Number(
                                    order.shippingFee
                                ) === 0
                                    ? "Free"
                                    : `₹${Number(
                                          order.shippingFee
                                      ).toLocaleString(
                                          "en-IN"
                                      )}`}
                            </strong>

                        </div>


                        <div className="order-total-row">

                            <span>
                                Total
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    order.totalAmount
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* Cancel Order */}

                {order.orderStatus ===
                    "placed" && (

                    <button
                        type="button"
                        className="order-cancel-button"
                        onClick={
                            handleCancelOrder
                        }
                        disabled={
                            cancelling
                        }
                    >
                        {cancelling
                            ? "Cancelling..."
                            : "Cancel Order"}
                    </button>

                )}


                {/* Reorder */}

                {(order.orderStatus ===
                    "delivered" ||
                    order.orderStatus ===
                    "cancelled") && (

                    <button
                        type="button"
                        className="order-reorder-button"
                        onClick={
                            handleReorder
                        }
                    >
                        Reorder Items
                    </button>

                )}


                {/* Back to Orders */}

                <Link
                    to="/account"
                    className="order-primary-button"
                >
                    Back to My Orders
                </Link>

            </div>

        </div>
    );
}

export default OrderDetails;
