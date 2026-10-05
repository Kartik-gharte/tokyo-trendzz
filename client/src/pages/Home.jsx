import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { getProducts } from "../services/productService";
import { useWishlist } from "../context/WishlistContext";

import "./Home.css";

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const {
        toggleWishlist,
        isInWishlist
    } = useWishlist();

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const data = await getProducts();

            setProducts(data.slice(0, 8));
        } catch (error) {
            console.error(error);
            setError("Unable to load products.");
        } finally {
            setLoading(false);
        }
    }

    async function handleWishlist(product) {
        try {
            await toggleWishlist(product);
        } catch (error) {
            console.error("Wishlist error:", error);
        }
    }

    return (
        <main className="home">

            {/* =================================================
                HERO
            ================================================= */}

            <section className="hero-section">

                <div className="hero-content">

                    <p className="hero-label">
                        TOKYO TRENDZ / 2026
                    </p>

                    <h1>
                        WEAR YOUR
                        <br />
                        <span>OWN TREND.</span>
                    </h1>

                    <p className="hero-description">
                        Streetwear made for people who don't follow
                        the crowd. Discover your next everyday look.
                    </p>

                    <div className="hero-buttons">

                        <Link
                            to="/products"
                            className="hero-button primary"
                        >
                            Shop Collection
                            <ArrowRight size={18} />
                        </Link>

                        <Link
                            to="/products?gender=men"
                            className="hero-button secondary"
                        >
                            Explore
                        </Link>

                    </div>

                </div>

                <div className="hero-visual">

                    <div className="hero-card">
                        <span>TT</span>
                    </div>

                </div>

            </section>


            {/* =================================================
                CATEGORIES
            ================================================= */}

            <section className="categories-section">

                <div className="section-heading">

                    <div>

                        <p className="section-label">
                            SHOP BY STYLE
                        </p>

                        <h2>
                            Find Your Look
                        </h2>

                    </div>

                    <Link
                        to="/products"
                        className="view-all"
                    >
                        View All
                        <ArrowRight size={16} />
                    </Link>

                </div>


                <div className="category-grid">

                    <Link
                        to="/products?category=t-shirts"
                        className="category-card"
                    >

                        <div className="category-image tshirt-category">
                            <span>01</span>
                        </div>

                        <h3>
                            T-Shirts
                        </h3>

                    </Link>


                    <Link
                        to="/products?category=hoodies"
                        className="category-card"
                    >

                        <div className="category-image hoodie-category">
                            <span>02</span>
                        </div>

                        <h3>
                            Hoodies
                        </h3>

                    </Link>


                    <Link
                        to="/products?category=cargo-pants"
                        className="category-card"
                    >

                        <div className="category-image cargo-category">
                            <span>03</span>
                        </div>

                        <h3>
                            Cargo Pants
                        </h3>

                    </Link>


                    <Link
                        to="/products?category=sneakers"
                        className="category-card"
                    >

                        <div className="category-image sneaker-category">
                            <span>04</span>
                        </div>

                        <h3>
                            Sneakers
                        </h3>

                    </Link>

                </div>

            </section>


            {/* =================================================
                FEATURED PRODUCTS
            ================================================= */}

            <section className="featured-section">

                <div className="section-heading">

                    <div>

                        <p className="section-label">
                            CURATED FOR YOU
                        </p>

                        <h2>
                            Featured Drops
                        </h2>

                    </div>

                    <Link
                        to="/products"
                        className="view-all"
                    >
                        Shop All
                        <ArrowRight size={16} />
                    </Link>

                </div>


                {/* Loading */}

                {loading && (
                    <div className="featured-placeholder">
                        <p>
                            Loading products...
                        </p>
                    </div>
                )}


                {/* Error */}

                {!loading && error && (
                    <div className="featured-placeholder">
                        <p>
                            {error}
                        </p>
                    </div>
                )}


                {/* Products */}

                {!loading && !error && (
                    <div className="home-product-grid">

                        {products.map((product) => {

                            const liked = isInWishlist(product.id);

                            return (
                                <article
                                    className="home-product-card"
                                    key={product.id}
                                >

                                    <div className="home-product-image">

                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className="no-product-image">
                                                TT
                                            </div>
                                        )}


                                        {product.discount_price && (
                                            <span className="product-sale-badge">
                                                SALE
                                            </span>
                                        )}


                                        <button
                                            className={`product-wishlist ${
                                                liked ? "active" : ""
                                            }`}
                                            type="button"
                                            aria-label={
                                                liked
                                                    ? "Remove from wishlist"
                                                    : "Add to wishlist"
                                            }
                                            title={
                                                liked
                                                    ? "Remove from wishlist"
                                                    : "Add to wishlist"
                                            }
                                            onClick={() =>
                                                handleWishlist(product)
                                            }
                                        >
                                            <Heart
                                                size={18}
                                                fill={
                                                    liked
                                                        ? "currentColor"
                                                        : "none"
                                                }
                                            />
                                        </button>

                                    </div>


                                    <div className="home-product-info">

                                        <p className="product-brand">
                                            {product.brand}
                                        </p>

                                        <h3>
                                            {product.name}
                                        </h3>

                                        <div className="product-price">

                                            {product.discount_price ? (
                                                <>
                                                    <span className="sale-price">
                                                        ₹{Number(
                                                            product.discount_price
                                                        ).toLocaleString("en-IN")}
                                                    </span>

                                                    <span className="original-price">
                                                        ₹{Number(
                                                            product.price
                                                        ).toLocaleString("en-IN")}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="sale-price">
                                                    ₹{Number(
                                                        product.price
                                                    ).toLocaleString("en-IN")}
                                                </span>
                                            )}

                                        </div>


                                        <Link
                                            to={`/products/${product.id}`}
                                            className="product-view-button"
                                        >
                                            <ShoppingBag size={16} />
                                            View Product
                                        </Link>

                                    </div>

                                </article>
                            );
                        })}

                    </div>
                )}

            </section>


            {/* =================================================
                PROMOTIONAL BANNER
            ================================================= */}

            <section className="promo-section">

                <div className="promo-content">

                    <p className="section-label">
                        TOKYO TRENDZ
                    </p>

                    <h2>
                        STYLE DOESN'T
                        <br />
                        NEED A RULEBOOK.
                    </h2>

                    <Link
                        to="/products"
                        className="promo-button"
                    >
                        Explore Collection
                        <ArrowRight size={18} />
                    </Link>

                </div>

            </section>

        </main>
    );
}

export default Home;