import { useState } from "react";
import { ArrowLeft, MapPin, ShoppingBag, Tag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import "./Checkout.css";

function Checkout() {
    const {
        cartItems,
        cartTotal,
        cartOriginalTotal
    } = useCart();

    const { user, token } = useAuth();

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        landmark: ""
    });

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");

    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");

    const totalSavings = cartOriginalTotal - cartTotal;

    const couponDiscount = appliedCoupon
        ? Number(appliedCoupon.discount)
        : 0;

    const finalTotal = Math.max(
        0,
        cartTotal - couponDiscount
    );

    const handleChange = (event) => {
        const { id, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [id]: value
        }));
    };

    const handleApplyCoupon = async () => {
        setCouponError("");

        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code.");
            return;
        }

        if (!user || !token) {
            navigate("/login");
            return;
        }

        try {
            setCouponLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/coupons/validate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        code: couponCode.trim(),
                        orderAmount: cartTotal
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to apply coupon"
                );
            }

            setAppliedCoupon({
                code: data.coupon.code,
                discount: Number(data.discount),
                finalAmount: Number(data.finalAmount)
            });

            setCouponError("");
        } catch (couponApplyError) {
            console.error(
                "Apply coupon error:",
                couponApplyError
            );

            setAppliedCoupon(null);
            setCouponError(
                couponApplyError.message ||
                "Unable to apply coupon."
            );
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    };

    const handlePlaceOrder = async () => {
        setError("");

        if (!user || !token) {
            navigate("/login");
            return;
        }

        if (
            !formData.fullName ||
            !formData.phone ||
            !formData.address ||
            !formData.city ||
            !formData.state ||
            !formData.postalCode
        ) {
            setError(
                "Please fill all required delivery address fields."
            );
            return;
        }

        try {
            setPlacingOrder(true);

            const response = await fetch(
                "http://localhost:5000/api/orders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...formData,
                        couponCode: appliedCoupon
                            ? appliedCoupon.code
                            : null
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to place order"
                );
            }

            alert(
                `Order placed successfully!\nOrder Number: ${data.order.orderNumber}`
            );

            navigate("/account");
        } catch (orderError) {
            console.error(
                "Place order error:",
                orderError
            );

            setError(
                orderError.message ||
                "Something went wrong while placing your order."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <main className="checkout-page">
                <section className="empty-checkout">
                    <div className="empty-checkout-icon">
                        <ShoppingBag size={42} />
                    </div>

                    <p className="checkout-label">
                        TOKYO TRENDZ / CHECKOUT
                    </p>

                    <h1>
                        YOUR <span>CART IS EMPTY.</span>
                    </h1>

                    <p>
                        Add some products to your cart before
                        proceeding to checkout.
                    </p>

                    <Link
                        to="/products"
                        className="continue-shopping-button"
                    >
                        <ArrowLeft size={17} />
                        Continue Shopping
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main className="checkout-page">

            <section className="checkout-header">
                <div>
                    <p className="checkout-label">
                        TOKYO TRENDZ / CHECKOUT
                    </p>

                    <h1>
                        CHECK <span>OUT.</span>
                    </h1>

                    <p className="checkout-description">
                        Enter your delivery details and review
                        your order before placing it.
                    </p>
                </div>
            </section>

            <section className="checkout-container">

                <div className="checkout-form-section">

                    <div className="checkout-section-header">
                        <MapPin size={20} />

                        <div>
                            <h2>DELIVERY ADDRESS</h2>
                            <p>
                                Where should we deliver your order?
                            </p>
                        </div>
                    </div>

                    <div className="checkout-form">

                        <div className="checkout-form-row">

                            <div className="checkout-field">
                                <label htmlFor="fullName">
                                    Full Name
                                </label>

                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="checkout-field">
                                <label htmlFor="phone">
                                    Phone Number
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                        <div className="checkout-field">
                            <label htmlFor="address">
                                Address
                            </label>

                            <textarea
                                id="address"
                                rows="3"
                                placeholder="House no., building, street, area"
                                value={formData.address}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="checkout-form-row">

                            <div className="checkout-field">
                                <label htmlFor="city">
                                    City
                                </label>

                                <input
                                    id="city"
                                    type="text"
                                    placeholder="Enter city"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="checkout-field">
                                <label htmlFor="state">
                                    State
                                </label>

                                <input
                                    id="state"
                                    type="text"
                                    placeholder="Enter state"
                                    value={formData.state}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                        <div className="checkout-form-row">

                            <div className="checkout-field">
                                <label htmlFor="postalCode">
                                    PIN Code
                                </label>

                                <input
                                    id="postalCode"
                                    type="text"
                                    placeholder="6-digit PIN code"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="checkout-field">
                                <label htmlFor="landmark">
                                    Landmark
                                </label>

                                <input
                                    id="landmark"
                                    type="text"
                                    placeholder="Optional"
                                    value={formData.landmark}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                        {error && (
                            <p
                                style={{
                                    color: "#d32f2f",
                                    marginTop: "15px",
                                    fontWeight: "600"
                                }}
                            >
                                {error}
                            </p>
                        )}

                    </div>

                </div>

                <aside className="checkout-summary">

                    <div className="checkout-summary-header">
                        <h2>ORDER SUMMARY</h2>
                    </div>

                    <div className="checkout-products">

                        {cartItems.map((item) => (
                            <div
                                className="checkout-product"
                                key={item.cartItemId}
                            >

                                <div className="checkout-product-image">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                        />
                                    ) : (
                                        <span>TT</span>
                                    )}
                                </div>

                                <div className="checkout-product-info">
                                    <h3>{item.name}</h3>

                                    <p>
                                        {item.size || "N/A"} /{" "}
                                        {item.color || "N/A"}
                                    </p>

                                    <span>
                                        Qty: {item.quantity}
                                    </span>
                                </div>

                                <strong>
                                    ₹
                                    {(
                                        item.price *
                                        item.quantity
                                    ).toLocaleString("en-IN")}
                                </strong>

                            </div>
                        ))}

                    </div>

                    {/* COUPON */}

                    <div
                        style={{
                            marginTop: "20px",
                            paddingTop: "20px",
                            borderTop: "1px solid #e5e5e5"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "10px"
                            }}
                        >
                            <Tag size={18} />

                            <strong>
                                HAVE A COUPON?
                            </strong>
                        </div>

                        {!appliedCoupon ? (
                            <>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px"
                                    }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(event) =>
                                            setCouponCode(
                                                event.target.value.toUpperCase()
                                            )
                                        }
                                        style={{
                                            flex: 1,
                                            minWidth: 0,
                                            padding: "11px 12px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            outline: "none"
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading}
                                        style={{
                                            padding: "11px 16px",
                                            border: "none",
                                            borderRadius: "4px",
                                            background: "#111",
                                            color: "#fff",
                                            fontWeight: "600",
                                            cursor: couponLoading
                                                ? "not-allowed"
                                                : "pointer"
                                        }}
                                    >
                                        {couponLoading
                                            ? "APPLYING..."
                                            : "APPLY"}
                                    </button>
                                </div>

                                {couponError && (
                                    <p
                                        style={{
                                            color: "#d32f2f",
                                            marginTop: "8px",
                                            marginBottom: 0,
                                            fontSize: "13px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        {couponError}
                                    </p>
                                )}
                            </>
                        ) : (
                            <div
                                style={{
                                    padding: "12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px"
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    <div>
                                        <strong>
                                            {appliedCoupon.code}
                                        </strong>

                                        <p
                                            style={{
                                                margin: "4px 0 0",
                                                fontSize: "13px",
                                                color: "#555"
                                            }}
                                        >
                                            Coupon applied successfully
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        style={{
                                            border: "none",
                                            background: "transparent",
                                            color: "#d32f2f",
                                            fontWeight: "600",
                                            cursor: "pointer"
                                        }}
                                    >
                                        REMOVE
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="checkout-summary-details">

                        <div className="summary-row">
                            <span>Subtotal</span>

                            <strong>
                                ₹
                                {cartOriginalTotal.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>
                        </div>

                        {totalSavings > 0 && (
                            <div className="summary-row savings">
                                <span>Product Savings</span>

                                <strong>
                                    - ₹
                                    {totalSavings.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>
                        )}

                        {couponDiscount > 0 && (
                            <div className="summary-row savings">
                                <span>Coupon Discount</span>

                                <strong>
                                    - ₹
                                    {couponDiscount.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>
                        )}

                        <div className="summary-row">
                            <span>Delivery</span>

                            <strong>FREE</strong>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-total">
                            <span>Total</span>

                            <strong>
                                ₹
                                {finalTotal.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="place-order-button"
                        onClick={handlePlaceOrder}
                        disabled={placingOrder}
                    >
                        {placingOrder
                            ? "PLACING ORDER..."
                            : "PLACE ORDER"}
                    </button>

                    <Link
                        to="/cart"
                        className="back-to-cart-link"
                    >
                        <ArrowLeft size={15} />
                        Back to Cart
                    </Link>

                </aside>

            </section>

        </main>
    );
}

export default Checkout;