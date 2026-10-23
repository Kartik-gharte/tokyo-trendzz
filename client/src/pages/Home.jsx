
import {
    ArrowRight,
    Heart,
    ShoppingBag,
    Mail,
    Phone,
    MessageCircle,
    ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { getProducts } from "../services/productService";
import { useWishlist } from "../context/WishlistContext";

import "./Home.css";

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openFaq, setOpenFaq] = useState(null);

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

            setProducts(Array.isArray(data) ? data : []);
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

    /*
    =========================================================
    PRODUCT CARD
    =========================================================
    */

    function ProductCard({ product }) {
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
    }

    /*
    =========================================================
    HOME PAGE PRODUCT GROUPS
    =========================================================
    */

    const featuredProducts = products.slice(0, 8);

    const newArrivals = [...products]
        .sort((a, b) => {
            const dateA = new Date(
                a.created_at || 0
            ).getTime();

            const dateB = new Date(
                b.created_at || 0
            ).getTime();

            if (
                !Number.isNaN(dateA) &&
                !Number.isNaN(dateB) &&
                dateA !== dateB
            ) {
                return dateB - dateA;
            }

            return Number(b.id || 0) - Number(a.id || 0);
        })
        .slice(0, 4);

    const faqItems = [
        {
            question: "How can I place an order?",
            answer:
                "Browse our products, select the product you want, choose your preferred variant, add it to your cart, and continue to checkout. You can then select your available payment method and place your order."
        },
        {
            question: "Can I cancel my order?",
            answer:
                "Yes. Orders can be cancelled while they are still in the eligible order status. You can manage your order from the My Orders section of your account."
        },
        {
            question: "How can I track my order?",
            answer:
                "You can track your order from the My Orders section after logging into your Tokyo Trendz account. The latest order status will be displayed there."
        },
        {
            question: "What payment methods are available?",
            answer:
                "Tokyo Trendz supports the payment methods currently displayed during checkout, including Cash on Delivery and Online Payment where available."
        },
        {
            question: "Can I return or exchange a product?",
            answer:
                "Return and exchange availability depends on the product and order policy. Please contact customer support with your order details if you need assistance."
        },
        {
            question: "How can I contact Tokyo Trendz support?",
            answer:
                "You can contact our support team using the support options below. Please keep your order number ready when contacting us about an existing order."
        }
    ];

    return (
        <main className="home">

            {/* =================================================
                HERO — DISCOUNT FOCUSED
            ================================================= */}

            <section className="hero-section">

                <div className="hero-content">

                    <p className="hero-label">
                        TOKYO TRENDZ / SPECIAL SALE
                    </p>

                    <h1>
                        BIG STYLE.
                        <br />
                        <span>LOW PRICES.</span>
                    </h1>

                    <p className="hero-description">
                        Upgrade your everyday streetwear without
                        breaking the bank. Discover selected styles
                        at special prices.
                    </p>

                    <div className="hero-discount">
                        <span>
                            UP TO
                        </span>

                        <strong>
                            50% OFF
                        </strong>
                    </div>

                    <div className="hero-buttons">

                        <Link
                            to="/products"
                            className="hero-button primary"
                        >
                            Shop Deals
                            <ArrowRight size={18} />
                        </Link>

                        <Link
                            to="/products"
                            className="hero-button secondary"
                        >
                            View Collection
                        </Link>

                    </div>

                </div>

                <div className="hero-visual">

                    <div className="hero-card">
                        <span>SALE</span>
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
                            BEST DEALS
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


                {loading && (
                    <div className="featured-placeholder">
                        <p>
                            Loading products...
                        </p>
                    </div>
                )}


                {!loading && error && (
                    <div className="featured-placeholder">
                        <p>
                            {error}
                        </p>
                    </div>
                )}


                {!loading &&
                    !error &&
                    featuredProducts.length === 0 && (
                        <div className="featured-placeholder">
                            <p>
                                No products available.
                            </p>
                        </div>
                    )}


                {!loading &&
                    !error &&
                    featuredProducts.length > 0 && (
                        <div className="home-product-grid">

                            {featuredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}

                        </div>
                    )}

            </section>


            {/* =================================================
                NEW ARRIVALS
            ================================================= */}

            {!loading &&
                !error &&
                newArrivals.length > 0 && (
                    <section className="featured-section new-arrivals-section">

                        <div className="section-heading">

                            <div>

                                <p className="section-label">
                                    JUST DROPPED
                                </p>

                                <h2>
                                    New Arrivals
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

                        <div className="home-product-grid">

                            {newArrivals.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}

                        </div>

                    </section>
                )}


            {/* =================================================
                CUSTOMER SUPPORT
            ================================================= */}

            <section className="customer-support-section">

                <div className="customer-support-header">

                    <p className="section-label">
                        TOKYO TRENDZ SUPPORT
                    </p>

                    <h2>
                        Need Help?
                    </h2>

                    <p>
                        We're here to help you with your orders,
                        products, payments, and anything else you
                        need.
                    </p>

                </div>


                <div className="support-grid">

                    <a
                        href="mailto:admin@tokyotrendz.com"
                        className="support-card"
                    >
                        <div className="support-icon">
                            <Mail size={22} />
                        </div>

                        <div>
                            <h3>
                                Email Support
                            </h3>

                            <p>
                                Get help from our support team
                            </p>

                            <span>
                                admin@tokyotrendz.com
                            </span>
                        </div>
                    </a>


                    <div className="support-card">

                        <div className="support-icon">
                            <MessageCircle size={22} />
                        </div>

                        <div>
                            <h3>
                                Order Assistance
                            </h3>

                            <p>
                                Need help with an existing order?
                            </p>

                            <Link to="/orders">
                                View My Orders
                                <ArrowRight size={14} />
                            </Link>
                        </div>

                    </div>


                    <div className="support-card">

                        <div className="support-icon">
                            <Phone size={22} />
                        </div>

                        <div>
                            <h3>
                                Customer Care
                            </h3>

                            <p>
                                We're here to help with your
                                shopping experience.
                            </p>

                            <span>
                                Support available online
                            </span>
                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                FAQ
            ================================================= */}

            <section className="faq-section">

                <div className="faq-header">

                    <p className="section-label">
                        FREQUENTLY ASKED QUESTIONS
                    </p>

                    <h2>
                        Got Questions?
                    </h2>

                    <p>
                        Find quick answers to the most common
                        questions about Tokyo Trendz.
                    </p>

                </div>


                <div className="faq-list">

                    {faqItems.map((faq, index) => {

                        const isOpen = openFaq === index;

                        return (
                            <div
                                className={`faq-item ${
                                    isOpen ? "open" : ""
                                }`}
                                key={index}
                            >

                                <button
                                    type="button"
                                    className="faq-question"
                                    onClick={() =>
                                        setOpenFaq(
                                            isOpen
                                                ? null
                                                : index
                                        )
                                    }
                                    aria-expanded={isOpen}
                                >

                                    <span>
                                        {faq.question}
                                    </span>

                                    <ChevronDown
                                        size={20}
                                        className="faq-arrow"
                                    />

                                </button>


                                {isOpen && (
                                    <div className="faq-answer">
                                        <p>
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}

                            </div>
                        );
                    })}

                </div>

            </section>

        </main>
    );
}

export default Home;
