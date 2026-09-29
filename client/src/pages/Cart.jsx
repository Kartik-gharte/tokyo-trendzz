import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

import "./Cart.css";

function Cart() {
    const {
        cartItems,
        cartTotal,
        cartOriginalTotal,
        removeFromCart,
        updateQuantity,
        clearCart
    } = useCart();

    const totalSavings = cartOriginalTotal - cartTotal;

    if (cartItems.length === 0) {
        return (
            <main className="cart-page">
                <section className="empty-cart">
                    <div className="empty-cart-icon">
                        <ShoppingBag size={42} />
                    </div>

                    <p className="cart-label">
                        TOKYO TRENDZ / CART
                    </p>

                    <h1>
                        YOUR CART IS <span>EMPTY.</span>
                    </h1>

                    <p>
                        Looks like you haven't added anything
                        to your cart yet.
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
        <main className="cart-page">

            {/* HEADER */}

            <section className="cart-header">

                <div>
                    <p className="cart-label">
                        TOKYO TRENDZ / CART
                    </p>

                    <h1>
                        YOUR <span>CART.</span>
                    </h1>

                    <p className="cart-description">
                        Review your selected products before
                        checkout.
                    </p>
                </div>

                <div className="cart-item-count">
                    {cartItems.length} ITEMS
                </div>

            </section>

            {/* CART CONTENT */}

            <section className="cart-container">

                {/* ITEMS */}

                <div className="cart-items">

                    <div className="cart-items-heading">
                        <h2>
                            SHOPPING BAG
                        </h2>

                        <button
                            type="button"
                            onClick={clearCart}
                            className="clear-cart-button"
                        >
                            Clear Cart
                        </button>
                    </div>

                    {cartItems.map((item) => (
                        <article
                            className="cart-item"
                            key={item.cartItemId}
                        >

                            {/* IMAGE */}

                            <div className="cart-item-image">

                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                    />
                                ) : (
                                    <div className="cart-no-image">
                                        TT
                                    </div>
                                )}

                            </div>

                            {/* INFORMATION */}

                            <div className="cart-item-info">

                                <p className="cart-item-brand">
                                    {item.brand}
                                </p>

                                <h3>
                                    {item.name}
                                </h3>

                                <div className="cart-item-variants">

                                    <span>
                                        Size: {item.size || "N/A"}
                                    </span>

                                    <span>
                                        Color: {item.color || "N/A"}
                                    </span>

                                </div>

                                {/* QUANTITY */}

                                <div className="cart-item-bottom">

                                    <div className="cart-quantity">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateQuantity(
                                                    item.cartItemId,
                                                    item.quantity - 1
                                                )
                                            }
                                        >
                                            <Minus size={14} />
                                        </button>

                                        <span>
                                            {item.quantity}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateQuantity(
                                                    item.cartItemId,
                                                    item.quantity + 1
                                                )
                                            }
                                        >
                                            <Plus size={14} />
                                        </button>

                                    </div>

                                    <button
                                        type="button"
                                        className="remove-item-button"
                                        onClick={() =>
                                            removeFromCart(
                                                item.cartItemId
                                            )
                                        }
                                    >
                                        <Trash2 size={15} />
                                        Remove
                                    </button>

                                </div>

                            </div>

                            {/* PRICE */}

                            <div className="cart-item-price">

                                <strong>
                                    ₹
                                    {(
                                        item.price *
                                        item.quantity
                                    ).toLocaleString("en-IN")}
                                </strong>

                                {item.originalPrice >
                                    item.price && (
                                    <span>
                                        ₹
                                        {(
                                            item.originalPrice *
                                            item.quantity
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>
                                )}

                            </div>

                        </article>
                    ))}

                </div>

                {/* SUMMARY */}

                <aside className="cart-summary">

                    <div className="summary-header">
                        <h2>
                            ORDER SUMMARY
                        </h2>
                    </div>

                    <div className="summary-row">
                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ₹
                            {cartOriginalTotal.toLocaleString(
                                "en-IN"
                            )}
                        </strong>
                    </div>

                    {totalSavings > 0 && (
                        <div className="summary-row savings">
                            <span>
                                You Save
                            </span>

                            <strong>
                                - ₹
                                {totalSavings.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>
                        </div>
                    )}

                    <div className="summary-row">
                        <span>
                            Delivery
                        </span>

                        <strong>
                            FREE
                        </strong>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-total">
                        <span>
                            Total
                        </span>

                        <strong>
                            ₹
                            {cartTotal.toLocaleString(
                                "en-IN"
                            )}
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="checkout-button"
                    >
                        Proceed to Checkout
                    </button>

                    <Link
                        to="/products"
                        className="continue-shopping-link"
                    >
                        <ArrowLeft size={15} />
                        Continue Shopping
                    </Link>

                </aside>

            </section>

        </main>
    );
}

export default Cart;