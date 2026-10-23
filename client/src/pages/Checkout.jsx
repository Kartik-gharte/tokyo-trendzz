
import { useEffect, useState } from "react";
import {
    ArrowLeft,
    MapPin,
    ShoppingBag,
    Tag,
    Minus,
    Plus,
    Trash2,
    ShieldCheck,
    CreditCard,
    Truck,
    LoaderCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Checkout.css";

const API_URL = "/api";
const COD_ADVANCE_AMOUNT = 120;

function Checkout() {
    const {
        cartItems,
        cartTotal,
        cartOriginalTotal,
        updateQuantity,
        removeFromCart
    } = useCart();

    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: user?.name || "",
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

    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");

    const cartSignature = cartItems
        .map((item) => `${item.cartItemId}:${item.quantity}`)
        .join("|");

    useEffect(() => {
        setAppliedCoupon(null);
        setCouponError("");
    }, [cartSignature]);

    const originalTotal = Number(cartOriginalTotal || 0);
    const subtotal = Number(cartTotal || 0);

    const totalSavings = Math.max(0, originalTotal - subtotal);

    const couponDiscount = appliedCoupon
        ? Number(
              appliedCoupon.discount ??
              appliedCoupon.discountAmount ??
              appliedCoupon.discount_amount ??
              0
          )
        : 0;

    const finalTotal = Number(
        Math.max(0, subtotal - couponDiscount).toFixed(2)
    );

    // Display amounts only. The backend independently calculates
    // and verifies the actual payment amount.
    const codAdvanceAmount = Number(
        Math.min(COD_ADVANCE_AMOUNT, finalTotal).toFixed(2)
    );

    const codBalanceDue = Number(
        Math.max(0, finalTotal - codAdvanceAmount).toFixed(2)
    );

    const amountDueNow =
        paymentMethod === "cod" ? codAdvanceAmount : finalTotal;

    const formatPrice = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    const getProductImage = (item) =>
        item.image ||
        item.image_url ||
        item.productImage ||
        item.product_image ||
        "";

    const getProductPrice = (item) =>
        Number(item.discount_price ?? item.price ?? 0);

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };

    const handleQuantityChange = (item, nextQuantity) => {
        if (placingOrder || nextQuantity < 1) {
            return;
        }

        updateQuantity(item.cartItemId, nextQuantity);
    };

    const handleRemoveItem = (item) => {
        if (placingOrder) {
            return;
        }

        removeFromCart(item.cartItemId);
    };

    const validateAddress = () => {
        const requiredFields = [
            ["fullName", "Please enter your full name."],
            ["phone", "Please enter your phone number."],
            ["address", "Please enter your address."],
            ["city", "Please enter your city."],
            ["state", "Please enter your state."],
            ["postalCode", "Please enter your PIN code."]
        ];

        for (const [field, message] of requiredFields) {
            if (!String(formData[field] || "").trim()) {
                setError(message);
                return false;
            }
        }

        const phoneDigits = formData.phone.replace(/\D/g, "");

        if (phoneDigits.length !== 10) {
            setError("Please enter a valid 10-digit phone number.");
            return false;
        }

        const pinCode = formData.postalCode.replace(/\D/g, "");

        if (pinCode.length !== 6) {
            setError("Please enter a valid 6-digit PIN code.");
            return false;
        }

        if (!cartItems.length) {
            setError("Your cart is empty.");
            return false;
        }

        return true;
    };

    const getAddressPayload = () => ({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        landmark: formData.landmark.trim()
    });

    const getCouponCode = () =>
        appliedCoupon ? couponCode.trim() : "";

    const applyCoupon = async (event) => {
        event.preventDefault();

        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code.");
            return;
        }

        if (!token) {
            setCouponError("Please log in to apply a coupon.");
            return;
        }

        try {
            setCouponLoading(true);
            setCouponError("");

            const response = await fetch(`${API_URL}/coupons/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: couponCode.trim(),
                    orderAmount: subtotal
                })
            });

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(
                    data.message || data.error || "Invalid coupon code."
                );
            }

            const couponData = data.coupon || data.data || data;

            const discount = Number(
                couponData.discount ??
                couponData.discountAmount ??
                couponData.discount_amount ??
                data.discount ??
                data.discountAmount ??
                data.discount_amount ??
                0
            );

            setAppliedCoupon({
                ...couponData,
                discount
            });

            setCouponError("");
        } catch (err) {
            setAppliedCoupon(null);
            setCouponError(err.message || "Unable to apply coupon.");
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    };

    /*
    ============================================================
    RAZORPAY PAYMENT — ONLINE AND COD ADVANCE
    ============================================================

    Online:
        Pay the full amount.

    COD:
        Pay ₹120 in advance, or the full amount when the
        order total is below ₹120.

    The backend verifies the payment and creates the order.
    This function never directly creates a COD order.
    */

    const placeRazorpayOrder = async () => {
        if (!window.Razorpay) {
            throw new Error(
                "Razorpay could not be loaded. Please refresh the page and try again."
            );
        }

        const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

        if (!key) {
            throw new Error(
                "Razorpay Key ID is missing. Please configure VITE_RAZORPAY_KEY_ID."
            );
        }

        // Ask the backend to calculate the amount for the selected method.
        const createResponse = await fetch(
            `${API_URL}/payment/create-order`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    couponCode: getCouponCode(),
                    paymentMethod
                })
            }
        );

        const createData = await createResponse.json();

        // The backend supports both response shapes.
        const razorpayOrder =
            createData.order || createData.data;

        if (
            !createResponse.ok ||
            createData.success === false ||
            !razorpayOrder?.id ||
            !razorpayOrder?.amount
        ) {
            throw new Error(
                createData.message ||
                createData.error ||
                "Unable to start payment."
            );
        }

        await new Promise((resolve, reject) => {
            let paymentCompleted = false;
            let verificationStarted = false;

            const options = {
                key,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency || "INR",
                name: "Tokyo Trendz",
                description:
                    paymentMethod === "cod"
                        ? "COD order advance payment"
                        : "Fashion order payment",
                order_id: razorpayOrder.id,

                prefill: {
                    name: formData.fullName,
                    contact: formData.phone,
                    email: user?.email || ""
                },

                notes: {
                    address: formData.address,
                    city: formData.city
                },

                theme: {
                    color: "#ff3030"
                },

                handler: async (paymentResponse) => {
                    if (verificationStarted) {
                        return;
                    }

                    verificationStarted = true;
                    paymentCompleted = true;

                    try {
                        const verifyResponse = await fetch(
                            `${API_URL}/payment/verify`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    razorpay_order_id:
                                        paymentResponse.razorpay_order_id,

                                    razorpay_payment_id:
                                        paymentResponse.razorpay_payment_id,

                                    razorpay_signature:
                                        paymentResponse.razorpay_signature,

                                    ...getAddressPayload(),

                                    couponCode: getCouponCode(),
                                    paymentMethod
                                })
                            }
                        );

                        const verifyData = await verifyResponse.json();

                        if (
                            !verifyResponse.ok ||
                            verifyData.success === false
                        ) {
                            throw new Error(
                                verifyData.message ||
                                verifyData.error ||
                                "Payment verification failed."
                            );
                        }

                        const order =
                            verifyData.order ||
                            verifyData.data ||
                            {};

                        const orderNumber =
                            order.orderNumber ||
                            order.order_number ||
                            order.id ||
                            order.order_id;

                        if (paymentMethod === "cod") {
                            const paidAdvance = Number(
                                order.advancePaid ??
                                razorpayOrder.advanceAmount ??
                                codAdvanceAmount
                            );

                            const remainingBalance = Number(
                                order.balanceDue ??
                                razorpayOrder.balanceDue ??
                                codBalanceDue
                            );

                            alert(
                                `COD order placed successfully!` +
                                (orderNumber
                                    ? ` Order number: ${orderNumber}.`
                                    : "") +
                                `\n\nAdvance paid: ${formatPrice(paidAdvance)}` +
                                `\nBalance due on delivery: ${formatPrice(remainingBalance)}`
                            );
                        } else {
                            alert(
                                orderNumber
                                    ? `Payment successful! Your order number is ${orderNumber}.`
                                    : "Payment successful! Your order has been placed."
                            );
                        }

                        navigate("/account");
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                },

                modal: {
                    ondismiss: () => {
                        if (!paymentCompleted) {
                            reject(
                                new Error(
                                    "Payment was cancelled. No order was placed."
                                )
                            );
                        }
                    }
                }
            };

            try {
                const razorpay = new window.Razorpay(options);

                razorpay.on("payment.failed", (event) => {
                    if (!verificationStarted) {
                        reject(
                            new Error(
                                event?.error?.description ||
                                "Payment failed. Please try again."
                            )
                        );
                    }
                });

                razorpay.open();
            } catch (err) {
                reject(err);
            }
        });
    };

    const handlePlaceOrder = async (event) => {
        event.preventDefault();

        if (placingOrder) {
            return;
        }

        setError("");

        if (!token) {
            setError("Please log in before placing your order.");
            return;
        }

        if (!validateAddress()) {
            return;
        }

        if (paymentMethod === "cod" && amountDueNow <= 0) {
            setError(
                "Your order total must be greater than ₹0 to continue."
            );
            return;
        }

        try {
            setPlacingOrder(true);

            // Both methods go through Razorpay.
            // COD pays only the advance; online pays the full total.
            await placeRazorpayOrder();
        } catch (err) {
            setError(
                err.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    if (!cartItems.length) {
        return (
            <main className="checkout-page checkout-empty-page">
                <div className="checkout-empty">
                    <div className="checkout-empty-icon">
                        <ShoppingBag size={42} strokeWidth={1.6} />
                    </div>

                    <p className="checkout-eyebrow">TOKYO TRENDZ</p>
                    <h1>Your bag is empty</h1>
                    <p className="checkout-empty-description">
                        Looks like you haven't added anything to your bag yet.
                    </p>

                    <Link to="/shop" className="checkout-primary-button">
                        Continue Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <div className="checkout-container">
                <header className="checkout-header">
                    <Link to="/cart" className="checkout-back-link">
                        <ArrowLeft size={17} />
                        <span>Back to Bag</span>
                    </Link>

                    <p className="checkout-eyebrow">
                        TOKYO TRENDZ / CHECKOUT
                    </p>

                    <h1>Complete Your Order</h1>

                    <p className="checkout-header-description">
                        Almost yours. Confirm your details and get your fit.
                    </p>
                </header>

                <form
                    className="checkout-layout"
                    onSubmit={handlePlaceOrder}
                >
                    <div className="checkout-main-column">
                        {/* DELIVERY ADDRESS */}
                        <section className="checkout-section">
                            <div className="checkout-section-heading">
                                <div className="checkout-heading-icon">
                                    <MapPin size={19} />
                                </div>

                                <div>
                                    <span className="checkout-step-label">
                                        STEP 01
                                    </span>
                                    <h2>Delivery Address</h2>
                                    <p>
                                        Where should we deliver your order?
                                    </p>
                                </div>
                            </div>

                            <div className="checkout-address-grid">
                                <div className="checkout-field checkout-field-full">
                                    <label htmlFor="fullName">
                                        Full Name *
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        autoComplete="name"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        required
                                        disabled={placingOrder}
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label htmlFor="phone">
                                        Phone Number *
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        maxLength={10}
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="10-digit mobile number"
                                        required
                                        disabled={placingOrder}
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label htmlFor="postalCode">
                                        PIN Code *
                                    </label>
                                    <input
                                        id="postalCode"
                                        name="postalCode"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="postal-code"
                                        maxLength={6}
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        placeholder="6-digit PIN code"
                                        required
                                        disabled={placingOrder}
                                    />
                                </div>

                                <div className="checkout-field checkout-field-full">
                                    <label htmlFor="address">
                                        House / Street Address *
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        autoComplete="street-address"
                                        rows={3}
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Flat, house number, street and area"
                                        required
                                        disabled={placingOrder}
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label htmlFor="city">City *</label>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        autoComplete="address-level2"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Your city"
                                        required
                                        disabled={placingOrder}
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label htmlFor="state">State *</label>
                                    <input
                                        id="state"
                                        name="state"
                                        type="text"
                                        autoComplete="address-level1"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="Your state"
                                        required
                                        disabled={placingOrder}
                                    />
                                </div>

                                <div className="checkout-field checkout-field-full">
                                    <label htmlFor="landmark">
                                        Landmark (Optional)
                                    </label>
                                    <input
                                        id="landmark"
                                        name="landmark"
                                        type="text"
                                        value={formData.landmark}
                                        onChange={handleInputChange}
                                        placeholder="Nearby landmark"
                                        disabled={placingOrder}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* CART ITEMS */}
                        <section className="checkout-section">
                            <div className="checkout-section-heading">
                                <div className="checkout-heading-icon">
                                    <ShoppingBag size={19} />
                                </div>

                                <div>
                                    <span className="checkout-step-label">
                                        STEP 02
                                    </span>
                                    <h2>Your Items</h2>
                                    <p>
                                        {cartItems.length}{" "}
                                        {cartItems.length === 1
                                            ? "product"
                                            : "products"}{" "}
                                        in your bag
                                    </p>
                                </div>
                            </div>

                            <div className="checkout-products">
                                {cartItems.map((item) => {
                                    const image = getProductImage(item);
                                    const price = getProductPrice(item);

                                    return (
                                        <article
                                            className="checkout-product"
                                            key={item.cartItemId}
                                        >
                                            <div className="checkout-product-image">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={
                                                            item.name ||
                                                            "Product"
                                                        }
                                                    />
                                                ) : (
                                                    <div className="checkout-product-image-placeholder">
                                                        <ShoppingBag size={25} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="checkout-product-details">
                                                <h3>{item.name}</h3>

                                                {item.size && (
                                                    <p className="checkout-product-meta">
                                                        Size: {item.size}
                                                    </p>
                                                )}

                                                {item.color && (
                                                    <p className="checkout-product-meta">
                                                        Colour: {item.color}
                                                    </p>
                                                )}

                                                <p className="checkout-product-price">
                                                    {formatPrice(price)}
                                                </p>

                                                <div className="checkout-product-actions">
                                                    <div
                                                        className="checkout-quantity-controls"
                                                        aria-label={`Quantity controls for ${item.name}`}
                                                    >
                                                        <button
                                                            className="checkout-quantity-button"
                                                            type="button"
                                                            aria-label={`Decrease quantity of ${item.name}`}
                                                            disabled={
                                                                placingOrder ||
                                                                item.quantity <= 1
                                                            }
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item,
                                                                    item.quantity - 1
                                                                )
                                                            }
                                                        >
                                                            <Minus
                                                                size={17}
                                                                strokeWidth={2.8}
                                                                aria-hidden="true"
                                                            />
                                                        </button>

                                                        <span
                                                            className="checkout-quantity-value"
                                                            aria-live="polite"
                                                        >
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            className="checkout-quantity-button"
                                                            type="button"
                                                            aria-label={`Increase quantity of ${item.name}`}
                                                            disabled={placingOrder}
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item,
                                                                    item.quantity + 1
                                                                )
                                                            }
                                                        >
                                                            <Plus
                                                                size={17}
                                                                strokeWidth={2.8}
                                                                aria-hidden="true"
                                                            />
                                                        </button>
                                                    </div>

                                                    <button
                                                        className="checkout-remove-button"
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveItem(item)
                                                        }
                                                        disabled={placingOrder}
                                                    >
                                                        <Trash2
                                                            size={14}
                                                            strokeWidth={2}
                                                        />
                                                        <span>Remove</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="checkout-product-line-total">
                                                {formatPrice(
                                                    price * item.quantity
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>

                        {/* PAYMENT METHOD */}
                        <section className="checkout-section">
                            <div className="checkout-section-heading">
                                <div className="checkout-heading-icon">
                                    <CreditCard size={19} />
                                </div>

                                <div>
                                    <span className="checkout-step-label">
                                        STEP 03
                                    </span>
                                    <h2>Payment Method</h2>
                                    <p>Choose how you want to pay.</p>
                                </div>
                            </div>

                            <div className="checkout-payment-options">
                                <label
                                    className={`checkout-payment-option ${
                                        paymentMethod === "cod"
                                            ? "checkout-payment-option-active"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={() => {
                                            setPaymentMethod("cod");
                                            setError("");
                                        }}
                                        disabled={placingOrder}
                                    />

                                    <span className="checkout-payment-radio" />

                                    <span className="checkout-payment-icon">
                                        <Truck size={21} />
                                    </span>

                                    <span className="checkout-payment-text">
                                        <strong>Cash on Delivery</strong>
                                        <small>
                                            Pay {formatPrice(codAdvanceAmount)}{" "}
                                            online now; pay the remaining
                                            balance on delivery.
                                        </small>
                                    </span>
                                </label>

                                <label
                                    className={`checkout-payment-option ${
                                        paymentMethod === "online"
                                            ? "checkout-payment-option-active"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="online"
                                        checked={paymentMethod === "online"}
                                        onChange={() => {
                                            setPaymentMethod("online");
                                            setError("");
                                        }}
                                        disabled={placingOrder}
                                    />

                                    <span className="checkout-payment-radio" />

                                    <span className="checkout-payment-icon">
                                        <CreditCard size={21} />
                                    </span>

                                    <span className="checkout-payment-text">
                                        <strong>Online Payment</strong>
                                        <small>
                                            Pay the full amount securely using
                                            Razorpay.
                                        </small>
                                    </span>

                                    <span className="checkout-payment-badge">
                                        SECURE
                                    </span>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* ORDER SUMMARY */}
                    <aside className="checkout-summary">
                        <div className="checkout-summary-heading">
                            <span className="checkout-step-label">
                                ORDER SUMMARY
                            </span>
                            <h2>Your Order</h2>
                        </div>

                        <div className="checkout-summary-items">
                            {cartItems.map((item) => (
                                <div
                                    className="checkout-summary-item"
                                    key={item.cartItemId}
                                >
                                    <span>
                                        {item.name} × {item.quantity}
                                    </span>
                                    <strong>
                                        {formatPrice(
                                            getProductPrice(item) *
                                            item.quantity
                                        )}
                                    </strong>
                                </div>
                            ))}
                        </div>

                        <div className="checkout-coupon">
                            <div className="checkout-coupon-heading">
                                <Tag size={17} />
                                <span>Have a coupon?</span>
                            </div>

                            {appliedCoupon ? (
                                <div className="checkout-applied-coupon">
                                    <div>
                                        <strong>
                                            {couponCode.toUpperCase()}
                                        </strong>
                                        <span>
                                            Coupon applied successfully
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={removeCoupon}
                                        disabled={placingOrder}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="checkout-coupon-form">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(event) => {
                                            setCouponCode(event.target.value);
                                            setCouponError("");
                                        }}
                                        placeholder="Enter coupon code"
                                        aria-label="Coupon code"
                                        disabled={
                                            couponLoading || placingOrder
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={applyCoupon}
                                        disabled={
                                            couponLoading ||
                                            placingOrder ||
                                            !couponCode.trim()
                                        }
                                    >
                                        {couponLoading
                                            ? "Applying..."
                                            : "Apply"}
                                    </button>
                                </div>
                            )}

                            {couponError && (
                                <p className="checkout-coupon-error">
                                    {couponError}
                                </p>
                            )}
                        </div>

                        <div className="checkout-price-breakdown">
                            <div className="checkout-price-row">
                                <span>Original Price</span>
                                <span>{formatPrice(originalTotal)}</span>
                            </div>

                            {totalSavings > 0 && (
                                <div className="checkout-price-row checkout-savings-row">
                                    <span>Product Savings</span>
                                    <span>
                                        -{formatPrice(totalSavings)}
                                    </span>
                                </div>
                            )}

                            <div className="checkout-price-row">
                                <span>Delivery</span>
                                <span className="checkout-free-delivery">
                                    FREE
                                </span>
                            </div>

                            {couponDiscount > 0 && (
                                <div className="checkout-price-row checkout-savings-row">
                                    <span>Coupon Discount</span>
                                    <span>
                                        -{formatPrice(couponDiscount)}
                                    </span>
                                </div>
                            )}

                            <div className="checkout-price-row">
                                <span>Order Total</span>
                                <span>{formatPrice(finalTotal)}</span>
                            </div>

                            {paymentMethod === "cod" ? (
                                <>
                                    <div className="checkout-price-row checkout-total-row">
                                        <strong>Pay Online Now</strong>
                                        <strong>
                                            {formatPrice(codAdvanceAmount)}
                                        </strong>
                                    </div>

                                    <div className="checkout-price-row">
                                        <span>Balance Due on Delivery</span>
                                        <strong>
                                            {formatPrice(codBalanceDue)}
                                        </strong>
                                    </div>
                                </>
                            ) : (
                                <div className="checkout-price-row checkout-total-row">
                                    <strong>Total Payable Now</strong>
                                    <strong>{formatPrice(finalTotal)}</strong>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="checkout-error" role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="checkout-place-order-button"
                            disabled={placingOrder || !cartItems.length}
                        >
                            {placingOrder ? (
                                <>
                                    <LoaderCircle
                                        size={18}
                                        className="checkout-spinner"
                                    />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {paymentMethod === "online"
                                        ? "Pay Securely"
                                        : "Pay Advance & Place Order"}
                                    <span>{formatPrice(amountDueNow)}</span>
                                </>
                            )}
                        </button>

                        <div className="checkout-secure-note">
                            <ShieldCheck size={17} />
                            <span>
                                Your payment is verified securely by Razorpay.
                            </span>
                        </div>

                        <div className="checkout-summary-footer">
                            <p>
                                By placing your order, you agree to our
                                applicable terms and policies.
                            </p>
                            <Link to="/shop">Continue Shopping</Link>
                        </div>
                    </aside>
                </form>
            </div>
        </main>
    );
}

export default Checkout;
