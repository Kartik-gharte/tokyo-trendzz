import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Heart,
    Minus,
    Plus,
    ShoppingBag,
    Zap
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getProductById } from "../services/productService";

import "./ProductDetails.css";

function ProductDetails() {
    const { id } = useParams();

    const { addToCart } = useCart();

    const {
        toggleWishlist,
        isInWishlist
    } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadProduct();
    }, [id]);

    async function loadProduct() {
        try {
            setLoading(true);
            setError("");

            const data = await getProductById(id);

            setProduct(data);

            if (data.variants?.length > 0) {
                setSelectedSize(data.variants[0].size);
                setSelectedColor(data.variants[0].color);
            }
        } catch (err) {
            console.error(err);
            setError("Unable to load this product.");
        } finally {
            setLoading(false);
        }
    }

    function increaseQuantity() {
        setQuantity((current) => current + 1);
    }

    function decreaseQuantity() {
        setQuantity((current) =>
            Math.max(1, current - 1)
        );
    }

    function handleAddToCart() {
        if (!product) {
            return;
        }

        addToCart(
            product,
            selectedSize,
            selectedColor,
            quantity
        );

        alert("Product added to cart!");
    }

    function handleWishlistToggle() {
        if (!product) {
            return;
        }

        toggleWishlist(product);
    }

    if (loading) {
        return (
            <main className="product-details-page">
                <div className="product-details-message">
                    Loading product...
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="product-details-page">
                <div className="product-details-message error">

                    <h2>
                        Product not found
                    </h2>

                    <p>
                        {error}
                    </p>

                    <Link
                        to="/products"
                        className="back-to-products"
                    >
                        <ArrowLeft size={17} />
                        Back to Collection
                    </Link>

                </div>
            </main>
        );
    }

    const currentPrice =
        product.discount_price || product.price;

    const sizes = [
        ...new Set(
            product.variants
                ?.map((variant) => variant.size)
                .filter(Boolean)
        )
    ];

    const colors = [
        ...new Set(
            product.variants
                ?.map((variant) => variant.color)
                .filter(Boolean)
        )
    ];

    const liked = isInWishlist(product.id);

    return (
        <main className="product-details-page">

            {/* BACK */}

            <div className="product-details-top">

                <Link
                    to="/products"
                    className="back-link"
                >
                    <ArrowLeft size={17} />
                    Back to Collection
                </Link>

            </div>

            {/* PRODUCT */}

            <section className="product-details-container">

                {/* GALLERY */}

                <div className="product-details-gallery">

                    <div className="product-main-image">

                        {product.images?.[0]?.image_url ? (
                            <img
                                src={
                                    product.images[0].image_url
                                }
                                alt={product.name}
                            />
                        ) : (
                            <div className="details-no-image">
                                TT
                            </div>
                        )}

                        {product.discount_price && (
                            <span className="details-sale-badge">
                                SALE
                            </span>
                        )}

                    </div>

                    {product.images?.length > 1 && (
                        <div className="product-thumbnails">

                            {product.images.map((image) => (
                                <div
                                    className="product-thumbnail"
                                    key={image.id}
                                >
                                    <img
                                        src={image.image_url}
                                        alt={product.name}
                                    />
                                </div>
                            ))}

                        </div>
                    )}

                </div>

                {/* PRODUCT INFORMATION */}

                <div className="product-details-info">

                    <p className="details-brand">
                        {product.brand}
                    </p>

                    <h1>
                        {product.name}
                    </h1>

                    <p className="details-category">
                        {product.category_name}
                    </p>

                    {/* PRICE */}

                    <div className="details-price">

                        <span className="details-current-price">
                            ₹
                            {Number(
                                currentPrice
                            ).toLocaleString("en-IN")}
                        </span>

                        {product.discount_price && (
                            <span className="details-original-price">
                                ₹
                                {Number(
                                    product.price
                                ).toLocaleString("en-IN")}
                            </span>
                        )}

                        {product.discount_price &&
                            product.price && (
                                <span className="details-discount">
                                    {Math.round(
                                        (
                                            (
                                                Number(
                                                    product.price
                                                ) -
                                                Number(
                                                    product.discount_price
                                                )
                                            ) /
                                            Number(
                                                product.price
                                            )
                                        ) *
                                        100
                                    )}
                                    % OFF
                                </span>
                            )}

                    </div>

                    <p className="tax-note">
                        Inclusive of all taxes
                    </p>

                    <div className="details-divider"></div>

                    {/* DESCRIPTION */}

                    <div className="details-description">

                        <h3>
                            ABOUT THE PRODUCT
                        </h3>

                        <p>
                            {product.description ||
                                "Designed for everyday comfort and effortless street style."}
                        </p>

                    </div>

                    {/* SIZE */}

                    {sizes.length > 0 && (
                        <div className="variant-section">

                            <div className="variant-heading">

                                <h3>
                                    Select Size
                                </h3>

                                <span>
                                    Size Guide
                                </span>

                            </div>

                            <div className="size-options">

                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        className={
                                            selectedSize === size
                                                ? "size-option active"
                                                : "size-option"
                                        }
                                        onClick={() =>
                                            setSelectedSize(size)
                                        }
                                    >
                                        {size}
                                    </button>
                                ))}

                            </div>

                        </div>
                    )}

                    {/* COLOR */}

                    {colors.length > 0 && (
                        <div className="variant-section">

                            <div className="variant-heading">

                                <h3>
                                    Color
                                </h3>

                                <span>
                                    {selectedColor}
                                </span>

                            </div>

                            <div className="color-options">

                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={
                                            selectedColor === color
                                                ? "color-option active"
                                                : "color-option"
                                        }
                                        onClick={() =>
                                            setSelectedColor(color)
                                        }
                                    >
                                        {color}
                                    </button>
                                ))}

                            </div>

                        </div>
                    )}

                    {/* QUANTITY */}

                    <div className="quantity-section">

                        <h3>
                            Quantity
                        </h3>

                        <div className="quantity-control">

                            <button
                                type="button"
                                onClick={decreaseQuantity}
                            >
                                <Minus size={16} />
                            </button>

                            <span>
                                {quantity}
                            </span>

                            <button
                                type="button"
                                onClick={increaseQuantity}
                            >
                                <Plus size={16} />
                            </button>

                        </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="details-actions">

                        <button
                            type="button"
                            className="add-cart-button"
                            onClick={handleAddToCart}
                        >
                            <ShoppingBag size={19} />
                            Add to Cart
                        </button>

                        <button
                            type="button"
                            className="buy-now-button"
                        >
                            <Zap size={19} />
                            Buy Now
                        </button>

                        <button
                            type="button"
                            className={
                                liked
                                    ? "details-wishlist-button active"
                                    : "details-wishlist-button"
                            }
                            aria-label={
                                liked
                                    ? "Remove from wishlist"
                                    : "Add to wishlist"
                            }
                            onClick={
                                handleWishlistToggle
                            }
                        >
                            <Heart
                                size={20}
                                fill={
                                    liked
                                        ? "currentColor"
                                        : "none"
                                }
                            />
                        </button>

                    </div>

                    {/* EXTRA INFORMATION */}

                    <div className="product-extra-info">

                        <div>

                            <span>
                                Gender
                            </span>

                            <strong>
                                {product.gender}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Material
                            </span>

                            <strong>
                                {product.material ||
                                    "Premium fabric"}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Delivery
                            </span>

                            <strong>
                                Available across India
                            </strong>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default ProductDetails;