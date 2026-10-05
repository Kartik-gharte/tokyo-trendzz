import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { useAuth } from "./AuthContext";

const CartContext = createContext();

const API_URL = "http://localhost:5000/api/cart";

export function CartProvider({ children }) {
    const { user, token, isAuthenticated } = useAuth();

    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem(
                "tokyo_trendz_cart"
            );

            return savedCart
                ? JSON.parse(savedCart)
                : [];
        } catch (error) {
            console.error(
                "Cart loading error:",
                error
            );

            return [];
        }
    });

    const [loading, setLoading] = useState(false);


    // --------------------------------
    // Load cart from backend
    // --------------------------------

    async function loadCart() {
        if (!isAuthenticated || !token) {
            return;
        }

        setLoading(true);

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
                    "Failed to load cart"
                );
            }

            const formattedItems = data.items.map(
                (item) => ({
                    cartItemId: item.cart_item_id,
                    productId: item.product_id,
                    variantId: item.variant_id,

                    name: item.name,
                    brand: item.brand,

                    image: item.image_url || "",

                    price: Number(
                        item.discount_price ||
                        item.price
                    ),

                    originalPrice: Number(
                        item.price
                    ),

                    size: item.size,
                    color: item.color,

                    stock: item.stock,

                    quantity: item.quantity
                })
            );

            setCartItems(formattedItems);

        } catch (error) {
            console.error(
                "Backend cart loading error:",
                error
            );
        } finally {
            setLoading(false);
        }
    }


    // --------------------------------
    // Merge guest cart into database
    // --------------------------------

    async function mergeGuestCart() {
        if (!token) {
            return;
        }

        try {
            const savedCart =
                localStorage.getItem(
                    "tokyo_trendz_cart"
                );

            if (!savedCart) {
                return;
            }

            const guestItems =
                JSON.parse(savedCart);

            if (
                !Array.isArray(guestItems) ||
                guestItems.length === 0
            ) {
                return;
            }

            for (const item of guestItems) {
                if (
                    !item.productId ||
                    !item.variantId
                ) {
                    continue;
                }

                await fetch(API_URL, {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        productId:
                            item.productId,

                        variantId:
                            item.variantId,

                        quantity:
                            item.quantity
                    })
                });
            }

            localStorage.removeItem(
                "tokyo_trendz_cart"
            );

        } catch (error) {
            console.error(
                "Guest cart merge error:",
                error
            );
        }
    }


    // --------------------------------
    // Load database cart when logged in
    // --------------------------------

    useEffect(() => {
        if (isAuthenticated && token) {
            async function initializeCart() {
                await mergeGuestCart();
                await loadCart();
            }

            initializeCart();
        }
    }, [isAuthenticated, token]);


    // --------------------------------
    // Save guest cart to localStorage
    // --------------------------------

    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem(
                "tokyo_trendz_cart",
                JSON.stringify(cartItems)
            );
        }
    }, [cartItems, isAuthenticated]);


    // --------------------------------
    // Find product variant
    // --------------------------------

    function findVariant(
        product,
        size,
        color
    ) {
        if (!product?.variants) {
            return null;
        }

        return product.variants.find(
            (variant) =>
                variant.size === size &&
                variant.color === color
        );
    }


    // --------------------------------
    // Add to cart
    // --------------------------------

    async function addToCart(
        product,
        size,
        color,
        quantity = 1
    ) {
        // Logged-in user
        if (
            isAuthenticated &&
            token
        ) {
            const variant =
                findVariant(
                    product,
                    size,
                    color
                );

            if (!variant) {
                throw new Error(
                    "Selected size and color are unavailable"
                );
            }

            const response =
                await fetch(API_URL, {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        productId:
                            product.id,

                        variantId:
                            variant.id,

                        quantity
                    })
                });

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to add item to cart"
                );
            }

            await loadCart();

            return data;
        }


        // Guest user

        setCartItems(
            (currentItems) => {
                const existingItem =
                    currentItems.find(
                        (item) =>
                            item.productId ===
                                product.id &&
                            item.size === size &&
                            item.color === color
                    );

                if (existingItem) {
                    return currentItems.map(
                        (item) =>
                            item.productId ===
                                product.id &&
                            item.size === size &&
                            item.color === color
                                ? {
                                      ...item,
                                      quantity:
                                          item.quantity +
                                          quantity
                                  }
                                : item
                    );
                }

                const variant =
                    findVariant(
                        product,
                        size,
                        color
                    );

                const newItem = {
                    cartItemId:
                        `${product.id}-${size}-${color}-${Date.now()}`,

                    productId:
                        product.id,

                    variantId:
                        variant?.id ||
                        null,

                    name:
                        product.name,

                    brand:
                        product.brand,

                    image:
                        product.images?.[0]
                            ?.image_url ||
                        "",

                    price: Number(
                        product.discount_price ||
                        product.price
                    ),

                    originalPrice:
                        Number(
                            product.price
                        ),

                    size,
                    color,

                    quantity
                };

                return [
                    ...currentItems,
                    newItem
                ];
            }
        );
    }


    // --------------------------------
    // Add existing variant to cart
    // Used for Reorder
    // --------------------------------

    async function addExistingVariantToCart(
        product,
        variantId,
        quantity = 1
    ) {
        if (
            !product ||
            !variantId
        ) {
            throw new Error(
                "Product or variant information is missing"
            );
        }

        const variant =
            product.variants?.find(
                (item) =>
                    Number(item.id) ===
                    Number(variantId)
            );

        if (!variant) {
            throw new Error(
                "This product variant is no longer available"
            );
        }

        return await addToCart(
            product,
            variant.size,
            variant.color,
            quantity
        );
    }


    // --------------------------------
    // Remove item
    // --------------------------------

    async function removeFromCart(
        cartItemId
    ) {
        if (
            isAuthenticated &&
            token
        ) {
            const response =
                await fetch(
                    `${API_URL}/${cartItemId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to remove item"
                );
            }

            await loadCart();

            return;
        }


        // Guest

        setCartItems(
            (currentItems) =>
                currentItems.filter(
                    (item) =>
                        item.cartItemId !==
                        cartItemId
                )
        );
    }


    // --------------------------------
    // Update quantity
    // --------------------------------

    async function updateQuantity(
        cartItemId,
        quantity
    ) {
        if (quantity < 1) {
            await removeFromCart(
                cartItemId
            );

            return;
        }

        if (
            isAuthenticated &&
            token
        ) {
            const response =
                await fetch(
                    `${API_URL}/${cartItemId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            quantity
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to update cart"
                );
            }

            await loadCart();

            return;
        }


        // Guest

        setCartItems(
            (currentItems) =>
                currentItems.map(
                    (item) =>
                        item.cartItemId ===
                        cartItemId
                            ? {
                                  ...item,
                                  quantity
                              }
                            : item
                )
        );
    }


    // --------------------------------
    // Clear cart
    // --------------------------------

    async function clearCart() {
        if (
            isAuthenticated &&
            token
        ) {
            const response =
                await fetch(API_URL, {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                });

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to clear cart"
                );
            }

            setCartItems([]);

            return;
        }


        // Guest

        setCartItems([]);
    }


    // --------------------------------
    // Cart calculations
    // --------------------------------

    const cartCount =
        cartItems.reduce(
            (total, item) =>
                total +
                item.quantity,
            0
        );

    const cartTotal =
        cartItems.reduce(
            (total, item) =>
                total +
                item.price *
                    item.quantity,
            0
        );

    const cartOriginalTotal =
        cartItems.reduce(
            (total, item) =>
                total +
                item.originalPrice *
                    item.quantity,
            0
        );


    // --------------------------------
    // Context value
    // --------------------------------

    const value = {
        cartItems,

        cartCount,

        cartTotal,

        cartOriginalTotal,

        loading,

        addToCart,

        addExistingVariantToCart,

        removeFromCart,

        updateQuantity,

        clearCart
    };


    return (
        <CartContext.Provider
            value={value}
        >
            {children}
        </CartContext.Provider>
    );
}


export function useCart() {
    return useContext(
        CartContext
    );
}