
import { Link, useLocation } from "react-router-dom";

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    UserRound,
    MapPin,
    FolderOpen,
    TicketPercent,
    Star,
    Store,
    LogOut,
    BarChart3,
    Warehouse
} from "lucide-react";

import "./AdminLayout.css";

function AdminLayout({ children }) {

    const location = useLocation();

    const user = JSON.parse(
        localStorage.getItem("tokyo_trendz_user") || "null"
    );

    function isActive(path) {
        return (
            location.pathname === path ||
            location.pathname.startsWith(`${path}/`)
        );
    }

    function handleLogout() {
        localStorage.removeItem("tokyo_trendz_user");
        localStorage.removeItem("tokyo_trendz_token");

        window.location.href = "/login";
    }

    return (
        <div className="admin-layout">

            {/* SIDEBAR */}

            <aside className="admin-sidebar">

                <div className="admin-sidebar-logo">
                    TOKYO<span>TRENDZ</span>
                    <small>ADMIN PANEL</small>
                </div>


                {/* ADMIN USER */}

                <div className="admin-user">

                    <div className="admin-user-avatar">
                        {user?.name
                            ? user.name.charAt(0).toUpperCase()
                            : "A"}
                    </div>

                    <div className="admin-user-info">

                        <strong>
                            {user?.name || "Administrator"}
                        </strong>

                        <span>
                            Admin
                        </span>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="admin-sidebar-nav">

                    {/* Dashboard */}

                    <Link
                        to="/admin/dashboard"
                        className={
                            isActive("/admin/dashboard")
                                ? "active"
                                : ""
                        }
                    >
                        <LayoutDashboard size={19} />
                        <span>Dashboard</span>
                    </Link>


                    {/* Products */}

                    <Link
                        to="/admin/products"
                        className={
                            isActive("/admin/products")
                                ? "active"
                                : ""
                        }
                    >
                        <Package size={19} />
                        <span>Products</span>
                    </Link>


                    {/* Inventory */}

                    <Link
                        to="/admin/inventory"
                        className={
                            isActive("/admin/inventory")
                                ? "active"
                                : ""
                        }
                    >
                        <Warehouse size={19} />
                        <span>Inventory</span>
                    </Link>


                    {/* Analytics */}

                    <Link
                        to="/admin/analytics"
                        className={
                            isActive("/admin/analytics")
                                ? "active"
                                : ""
                        }
                    >
                        <BarChart3 size={18} />
                        <span>Analytics</span>
                    </Link>


                    {/* Orders */}

                    <Link
                        to="/admin/orders"
                        className={
                            isActive("/admin/orders")
                                ? "active"
                                : ""
                        }
                    >
                        <ShoppingCart size={19} />
                        <span>Orders</span>
                    </Link>


                    {/* Customers */}

                    <Link
                        to="/admin/customers"
                        className={
                            isActive("/admin/customers")
                                ? "active"
                                : ""
                        }
                    >
                        <Users size={19} />
                        <span>Customers</span>
                    </Link>


                    {/* Users */}

                    <Link
                        to="/admin/users"
                        className={
                            isActive("/admin/users")
                                ? "active"
                                : ""
                        }
                    >
                        <UserRound size={19} />
                        <span>Users</span>
                    </Link>


                    {/* Addresses */}

                    <Link
                        to="/admin/addresses"
                        className={
                            isActive("/admin/addresses")
                                ? "active"
                                : ""
                        }
                    >
                        <MapPin size={19} />
                        <span>Addresses</span>
                    </Link>


                    {/* Categories */}

                    <Link
                        to="/admin/categories"
                        className={
                            isActive("/admin/categories")
                                ? "active"
                                : ""
                        }
                    >
                        <FolderOpen size={19} />
                        <span>Categories</span>
                    </Link>


                    {/* Coupons */}

                    <Link
                        to="/admin/coupons"
                        className={
                            isActive("/admin/coupons")
                                ? "active"
                                : ""
                        }
                    >
                        <TicketPercent size={19} />
                        <span>Coupons</span>
                    </Link>


                    {/* Reviews */}

                    <Link
                        to="/admin/reviews"
                        className={
                            isActive("/admin/reviews")
                                ? "active"
                                : ""
                        }
                    >
                        <Star size={19} />
                        <span>Reviews</span>
                    </Link>

                </nav>


                {/* BOTTOM ACTIONS */}

                <div className="admin-sidebar-bottom">

                    <Link
                        to="/"
                        className="store-link"
                    >
                        <Store size={19} />
                        <span>Back to Store</span>
                    </Link>


                    <button
                        className="admin-logout-button"
                        onClick={handleLogout}
                    >
                        <LogOut size={19} />
                        <span>Logout</span>
                    </button>

                </div>

            </aside>


            {/* MAIN CONTENT */}

            <main className="admin-main">
                {children}
            </main>

        </div>
    );
}

export default AdminLayout;

