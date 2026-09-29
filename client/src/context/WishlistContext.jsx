import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlistItems, setWishlistItems] = useState(() => {
        try {
            const savedWishlist = localStorage.getItem(
                "tokyo_trendz_wishlist"
            );

            return savedWishlist
                ? JSON.parse(savedWishlist)
                : [];
        } catch (error) {
            console.error("Wishlist loading error:", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(
            "tokyo_trendz_wishlist",
            JSON.stringify(wishlistItems)
        );
    }, [wishlistItems]);

    function addToWishlist(product) {
        setWishlistItems((currentItems) => {
            const alreadyExists = currentItems.some(
                (item) => item.id === product.id
            );

            if (alreadyExists) {
                return currentItems;
            }

            return [...currentItems, product];
        });
    }

    function removeFromWishlist(productId) {
        setWishlistItems((currentItems) =>
            currentItems.filter(
                (item) => item.id !== productId
            )
        );
    }

    function toggleWishlist(product) {
        setWishlistItems((currentItems) => {
            const alreadyExists = currentItems.some(
                (item) => item.id === product.id
            );

            if (alreadyExists) {
                return currentItems.filter(
                    (item) => item.id !== product.id
                );
            }

            return [...currentItems, product];
        });
    }

    function isInWishlist(productId) {
        return wishlistItems.some(
            (item) => item.id === productId
        );
    }

    function clearWishlist() {
        setWishlistItems([]);
    }

    const wishlistCount = wishlistItems.length;

    const value = {
        wishlistItems,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist
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