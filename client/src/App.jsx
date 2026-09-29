import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>
                        <Navbar />

                        <Routes>
                            <Route
                                path="/"
                                element={<Home />}
                            />

                            <Route
                                path="/products"
                                element={<Products />}
                            />

                            <Route
                                path="/products/:id"
                                element={<ProductDetails />}
                            />

                            <Route
                                path="/cart"
                                element={<Cart />}
                            />

                            <Route
                                path="/wishlist"
                                element={<Wishlist />}
                            />

                            <Route
                                path="/login"
                                element={<Login />}
                            />

                            <Route
                                path="/register"
                                element={<Register />}
                            />

                            <Route
                                path="/account"
                                element={
                                    <ProtectedRoute>
                                        <Account />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </WishlistProvider>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;