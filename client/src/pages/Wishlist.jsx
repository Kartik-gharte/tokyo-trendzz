import {
    ArrowRight,
    Heart,
    ShoppingBag,
    Trash2
} from "lucide-react";

import { Link } from "react-router-dom";

import { useWishlist } from "../context/WishlistContext";

import "./Wishlist.css";

function Wishlist() {
    const {
        wishlistItems,
        removeFromWishlist
    } = useWishlist();

    console.log("Wishlist Items:", wishlistItems);

    function handleAddToCart(product) {
    window.location.href = `/products/${product.product_id}`;
}

    if (wishlistItems.length === 0) {
        return (
            <main className="wishlist-page">

                <section className="empty-wishlist">

                    <div className="empty-wishlist-icon">
                        <Heart size={42} />
                    </div>

                    <p className="wishlist-label">
                        TOKYO TRENDZ / WISHLIST
                    </p>

                    <h1>
                        YOUR WISHLIST IS{" "}
                        <span>EMPTY.</span>
                    </h1>

                    <p>
                        Save products you love and
                        find them here later.
                    </p>

                    <Link
                        to="/products"
                        className="wishlist-shop-button"
                    >
                        Explore Collection
                        <ArrowRight size={17} />
                    </Link>

                </section>

            </main>
        );
    }

    return (
        <main className="wishlist-page">

            {/* HEADER */}

            <section className="wishlist-header">

                <div>

                    <p className="wishlist-label">
                        TOKYO TRENDZ / WISHLIST
                    </p>

                    <h1>
                        YOUR <span>WISHLIST.</span>
                    </h1>

                    <p className="wishlist-description">
                        Your saved pieces, all in one place.
                    </p>

                </div>

                <div className="wishlist-count">
                    {wishlistItems.length} SAVED
                </div>

            </section>

            {/* PRODUCTS */}

            <section className="wishlist-container">

                <div className="wishlist-grid">

                    {wishlistItems.map((product) => (

                        <article
                            className="wishlist-card"
                            key={product.product_id}
                        >

                            <div className="wishlist-image">

                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                    />
                                ) : (
                                    <div className="wishlist-no-image">
                                        TT
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="wishlist-remove"
                                    aria-label="Remove from wishlist"
                                    onClick={() =>
                                        removeFromWishlist(
                                            product.product_id
                                        )
                                    }
                                >
                                    <Trash2 size={17} />
                                </button>

                                {product.discount_price && (
                                    <span className="wishlist-sale">
                                        SALE
                                    </span>
                                )}

                            </div>

                            <div className="wishlist-info">

                                <p className="wishlist-brand">
                                    {product.brand}
                                </p>

                                <h2>
                                    {product.name}
                                </h2>

                                <div className="wishlist-price">

                                    <strong>
                                        ₹
                                        {Number(
                                            product.discount_price ||
                                            product.price
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>

                                    {product.discount_price && (
                                        <span>
                                            ₹
                                            {Number(
                                                product.price
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>
                                    )}

                                </div>

                                <div className="wishlist-actions">

                                    <button
                                        type="button"
                                        className="wishlist-cart-button"
                                        onClick={() =>
                                            handleAddToCart(
                                                product
                                            )
                                        }
                                    >
                                        <ShoppingBag size={16} /> Choose Options
                                    </button>

                                    <Link
                                        to={`/products/${product.product_id}`}
                                        className="wishlist-view-button"
                                    >
                                        View
                                    </Link>

                                </div>

                            </div>

                        </article>

                    ))}

                </div>

            </section>

        </main>
    );
}

export default Wishlist;