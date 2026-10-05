import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

const API_URL = "http://localhost:5000/api/wishlist";

export function WishlistProvider({ children }) {
    const { user, token, isAuthenticated } = useAuth();

    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // =====================================================
    // LOAD WISHLIST
    // =====================================================

    useEffect(() => {
        let cancelled = false;

        async function loadWishlist() {
            // Logged-in user → load from MySQL
            if (isAuthenticated && token) {
                setWishlistLoading(true);

                try {
                    const response = await fetch(API_URL, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.message || "Unable to load wishlist"
                        );
                    }

                    if (!cancelled) {
                        setWishlistItems(
                            Array.isArray(data.items)
                                ? data.items
                                : []
                        );
                    }
                } catch (error) {
                    console.error(
                        "Load wishlist error:",
                        error
                    );
                } finally {
                    if (!cancelled) {
                        setWishlistLoading(false);
                    }
                }

                return;
            }

            // Guest user → load from localStorage
            try {
                const savedWishlist =
                    localStorage.getItem(
                        "tokyo_trendz_wishlist"
                    );

                if (!cancelled) {
                    setWishlistItems(
                        savedWishlist
                            ? JSON.parse(savedWishlist)
                            : []
                    );
                }
            } catch (error) {
                console.error(
                    "Guest wishlist loading error:",
                    error
                );

                if (!cancelled) {
                    setWishlistItems([]);
                }
            }
        }

        loadWishlist();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, token, user?.id]);

    // =====================================================
    // SAVE GUEST WISHLIST
    // =====================================================

    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem(
                "tokyo_trendz_wishlist",
                JSON.stringify(wishlistItems)
            );
        }
    }, [wishlistItems, isAuthenticated]);

    // =====================================================
    // REFRESH WISHLIST
    // =====================================================

    async function refreshWishlist() {
        if (!isAuthenticated || !token) {
            return;
        }

        try {
            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to refresh wishlist"
                );
            }

            setWishlistItems(
                Array.isArray(data.items)
                    ? data.items
                    : []
            );
        } catch (error) {
            console.error(
                "Refresh wishlist error:",
                error
            );

            throw error;
        }
    }

    // =====================================================
    // ADD TO WISHLIST
    // =====================================================

    async function addToWishlist(product) {
        if (!product?.id) {
            console.error(
                "A valid product is required."
            );
            return;
        }

        // Guest wishlist
        if (!isAuthenticated || !token) {
            setWishlistItems((currentItems) => {
                const exists = currentItems.some(
                    (item) =>
                        Number(
                            item.id ??
                            item.product_id
                        ) === Number(product.id)
                );

                if (exists) {
                    return currentItems;
                }

                return [
                    ...currentItems,
                    product
                ];
            });

            return;
        }

        // Logged-in wishlist → MySQL
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to add product"
                );
            }

            await refreshWishlist();
        } catch (error) {
            console.error(
                "Add wishlist error:",
                error
            );

            throw error;
        }
    }

    // =====================================================
    // REMOVE FROM WISHLIST
    // =====================================================

    async function removeFromWishlist(productId) {
        if (!isAuthenticated || !token) {
            setWishlistItems((currentItems) =>
                currentItems.filter(
                    (item) =>
                        Number(
                            item.id ??
                            item.product_id
                        ) !== Number(productId)
                )
            );

            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/${productId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to remove product"
                );
            }

            await refreshWishlist();
        } catch (error) {
            console.error(
                "Remove wishlist error:",
                error
            );

            throw error;
        }
    }

    // =====================================================
    // CHECK WISHLIST
    // =====================================================

    function isInWishlist(productId) {
        return wishlistItems.some(
            (item) =>
                Number(
                    item.id ??
                    item.product_id
                ) === Number(productId)
        );
    }

    // =====================================================
    // TOGGLE WISHLIST
    // =====================================================

    async function toggleWishlist(product) {
        if (!product?.id) {
            return;
        }

        if (isInWishlist(product.id)) {
            return removeFromWishlist(product.id);
        }

        return addToWishlist(product);
    }

    // =====================================================
    // CLEAR WISHLIST
    // =====================================================

    async function clearWishlist() {
        if (!isAuthenticated || !token) {
            setWishlistItems([]);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/clear`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to clear wishlist"
                );
            }

            setWishlistItems([]);
        } catch (error) {
            console.error(
                "Clear wishlist error:",
                error
            );

            throw error;
        }
    }

    // =====================================================
    // COUNT
    // =====================================================

    const wishlistCount =
        wishlistItems.length;

    // =====================================================
    // CONTEXT VALUE
    // =====================================================

    const value = {
        wishlistItems,
        wishlistCount,
        wishlistLoading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        refreshWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    return useContext(WishlistContext);
}