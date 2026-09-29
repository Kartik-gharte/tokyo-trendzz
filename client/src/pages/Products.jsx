import { useEffect, useMemo, useState } from "react";
import {
    Heart,
    Search,
    SlidersHorizontal,
    ShoppingBag
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { getProducts } from "../services/productService";
import { useWishlist } from "../context/WishlistContext";

import "./Products.css";

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

    const {
        toggleWishlist,
        isInWishlist
    } = useWishlist();

    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );

    const [category, setCategory] = useState(
        searchParams.get("category") || "all"
    );

    const [gender, setGender] = useState(
        searchParams.get("gender") || "all"
    );

    const [sort, setSort] = useState("featured");

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            setLoading(true);

            const data = await getProducts();

            setProducts(data);
        } catch (err) {
            console.error(err);

            setError("Unable to load products.");
        } finally {
            setLoading(false);
        }
    }

    function updateFilter(type, value) {
        const params = new URLSearchParams(searchParams);

        if (type === "category") {
            setCategory(value);

            if (value === "all") {
                params.delete("category");
            } else {
                params.set("category", value);
            }
        }

        if (type === "gender") {
            setGender(value);

            if (value === "all") {
                params.delete("gender");
            } else {
                params.set("gender", value);
            }
        }

        setSearchParams(params);
    }

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (search.trim()) {
            const searchText = search.toLowerCase();

            result = result.filter(
                (product) =>
                    product.name
                        .toLowerCase()
                        .includes(searchText) ||
                    product.brand
                        ?.toLowerCase()
                        .includes(searchText) ||
                    product.category_name
                        ?.toLowerCase()
                        .includes(searchText)
            );
        }

        if (category !== "all") {
            result = result.filter(
                (product) =>
                    product.slug === category ||
                    product.category_name
                        ?.toLowerCase()
                        .replace(/\s+/g, "-") === category
            );
        }

        if (gender !== "all") {
            result = result.filter(
                (product) =>
                    product.gender === gender ||
                    product.gender === "unisex"
            );
        }

        if (sort === "price-low") {
            result.sort(
                (a, b) =>
                    Number(
                        a.discount_price || a.price
                    ) -
                    Number(
                        b.discount_price || b.price
                    )
            );
        }

        if (sort === "price-high") {
            result.sort(
                (a, b) =>
                    Number(
                        b.discount_price || b.price
                    ) -
                    Number(
                        a.discount_price || a.price
                    )
            );
        }

        if (sort === "name") {
            result.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        }

        return result;
    }, [
        products,
        search,
        category,
        gender,
        sort
    ]);

    return (
        <main className="products-page">

            {/* HEADER */}

            <section className="products-header">

                <div>

                    <p className="products-label">
                        TOKYO TRENDZ / COLLECTION
                    </p>

                    <h1>
                        SHOP <span>ALL</span>
                    </h1>

                    <p className="products-description">
                        Discover streetwear made for people
                        who create their own style.
                    </p>

                </div>

                <div className="products-count">
                    {filteredProducts.length} PRODUCTS
                </div>

            </section>

            {/* FILTERS */}

            <section className="filter-section">

                <div className="filter-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

                <div className="filter-group">

                    <SlidersHorizontal size={17} />

                    <select
                        value={gender}
                        onChange={(e) =>
                            updateFilter(
                                "gender",
                                e.target.value
                            )
                        }
                    >
                        <option value="all">
                            All
                        </option>

                        <option value="men">
                            Men
                        </option>

                        <option value="women">
                            Women
                        </option>

                        <option value="unisex">
                            Unisex
                        </option>
                    </select>

                    <select
                        value={category}
                        onChange={(e) =>
                            updateFilter(
                                "category",
                                e.target.value
                            )
                        }
                    >
                        <option value="all">
                            All Categories
                        </option>

                        <option value="t-shirts">
                            T-Shirts
                        </option>

                        <option value="shirts">
                            Shirts
                        </option>

                        <option value="hoodies">
                            Hoodies
                        </option>

                        <option value="jeans">
                            Jeans
                        </option>

                        <option value="cargo-pants">
                            Cargo Pants
                        </option>

                        <option value="jackets">
                            Jackets
                        </option>

                        <option value="dresses">
                            Dresses
                        </option>

                        <option value="sneakers">
                            Sneakers
                        </option>
                    </select>

                    <select
                        value={sort}
                        onChange={(e) =>
                            setSort(e.target.value)
                        }
                    >
                        <option value="featured">
                            Featured
                        </option>

                        <option value="price-low">
                            Price: Low to High
                        </option>

                        <option value="price-high">
                            Price: High to Low
                        </option>

                        <option value="name">
                            Name: A-Z
                        </option>
                    </select>

                </div>

            </section>

            {/* PRODUCTS */}

            <section className="products-content">

                {loading && (
                    <div className="products-message">
                        Loading collection...
                    </div>
                )}

                {!loading && error && (
                    <div className="products-message error">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    filteredProducts.length === 0 && (
                        <div className="products-message">

                            <h2>
                                No products found.
                            </h2>

                            <p>
                                Try changing your search
                                or filters.
                            </p>

                        </div>
                    )}

                {!loading &&
                    !error &&
                    filteredProducts.length > 0 && (

                    <div className="products-grid">

                        {filteredProducts.map((product) => {

                            const liked =
                                isInWishlist(product.id);

                            return (
                                <article
                                    className="product-card"
                                    key={product.id}
                                >

                                    <div className="product-image">

                                        {product.image_url ? (
                                            <img
                                                src={
                                                    product.image_url
                                                }
                                                alt={
                                                    product.name
                                                }
                                            />
                                        ) : (
                                            <div className="product-no-image">
                                                TT
                                            </div>
                                        )}

                                        {product.discount_price && (
                                            <span className="product-badge">
                                                SALE
                                            </span>
                                        )}

                                        <button
                                            className={
                                                liked
                                                    ? "product-heart active"
                                                    : "product-heart"
                                            }
                                            type="button"
                                            aria-label={
                                                liked
                                                    ? "Remove from wishlist"
                                                    : "Add to wishlist"
                                            }
                                            onClick={() =>
                                                toggleWishlist(
                                                    product
                                                )
                                            }
                                        >
                                            <Heart
                                                size={19}
                                                fill={
                                                    liked
                                                        ? "currentColor"
                                                        : "none"
                                                }
                                            />
                                        </button>

                                    </div>

                                    <div className="product-info">

                                        <p className="product-category">
                                            {
                                                product.category_name
                                            }
                                        </p>

                                        <h2>
                                            {product.name}
                                        </h2>

                                        <div className="product-price">

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

                                        <Link
                                            to={`/products/${product.id}`}
                                            className="product-button"
                                        >
                                            <ShoppingBag
                                                size={16}
                                            />
                                            View Product
                                        </Link>

                                    </div>

                                </article>
                            );
                        })}

                    </div>
                )}

            </section>

        </main>
    );
}

export default Products;