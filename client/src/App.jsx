import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import OrderDetails from "./pages/OrderDetails";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCustomers from "./pages/AdminCustomers";
import AdminCategories from "./pages/AdminCategories";
import AdminCoupons from "./pages/AdminCoupons";
import AdminReviews from "./pages/AdminReviews";
import AdminUsers from "./pages/AdminUsers";
import AdminAddresses from "./pages/AdminAddresses";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminInventory from "./pages/AdminInventory";
import AdminReports from "./pages/AdminReports";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>

                        <Routes>

                            {/* ==========================================
                                CUSTOMER ROUTES
                            ========================================== */}

                            <Route
                                path="*"
                                element={
                                    <>
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
                                                path="/checkout"
                                                element={<Checkout />}
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

                                            <Route
                                                path="/orders/:orderId"
                                                element={
                                                    <ProtectedRoute>
                                                        <OrderDetails />
                                                    </ProtectedRoute>
                                                }
                                            />

                                        </Routes>
                                    </>
                                }
                            />

                        </Routes>

                        {/* ==========================================
                            ADMIN ROUTES
                        ========================================== */}

                        <Routes>

                            <Route
                                path="/admin/dashboard"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminDashboard />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/analytics"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminAnalytics />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminDashboard />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/products"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminProducts />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/orders"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminOrders />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/customers"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminCustomers />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/categories"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminCategories />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/coupons"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminCoupons />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/reviews"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminReviews />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/users"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminUsers />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/addresses"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminAddresses />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/inventory"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminInventory />
                                        </AdminLayout>
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/reports"
                                element={
                                    <AdminRoute>
                                        <AdminLayout>
                                            <AdminReports />
                                        </AdminLayout>
                                    </AdminRoute>
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