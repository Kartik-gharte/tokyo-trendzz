import {
    Search,
    Heart,
    ShoppingBag,
    User,
    Menu,
    X
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";

function Navbar() {
    const [mobileMenu, setMobileMenu] = useState(false);

    const { cartCount } = useCart();

    const user = JSON.parse(
        localStorage.getItem("tokyo_trendz_user") || "null"
    );

    const isAdmin = user?.role === "admin";

    return (
        <header className="navbar">
            <div className="navbar-container">

                {/* LOGO */}
                <Link
                    to="/"
                    className="navbar-logo"
                >
                    TOKYO<span>TRENDZ</span>
                </Link>


                {/* DESKTOP NAVIGATION */}
                <nav className="navbar-links">

                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/products?gender=men">
                        Men
                    </Link>

                    <Link to="/products?gender=women">
                        Women
                    </Link>

                    <Link to="/products">
                        Collections
                    </Link>

                    <Link to="/products">
                        New Arrivals
                    </Link>


                    {/* ADMIN PANEL */}
                    {isAdmin && (
                        <Link
                            to="/admin/dashboard"
                            className="admin-nav-link"
                        >
                            Admin Panel
                        </Link>
                    )}

                </nav>


                {/* ACTIONS */}
                <div className="navbar-actions">

                    <button
                        className="nav-icon search-button"
                        type="button"
                        aria-label="Search"
                    >
                        <Search size={21} />
                    </button>


                    <Link
                        to="/wishlist"
                        className="nav-icon"
                        aria-label="Wishlist"
                    >
                        <Heart size={21} />
                    </Link>


                    {/* NOTIFICATIONS */}
                    <NotificationBell />


                    <Link
                        to="/account"
                        className="nav-icon account-icon"
                        aria-label="Account"
                    >
                        <User size={21} />
                    </Link>


                    <Link
                        to="/cart"
                        className="nav-icon cart-icon"
                        aria-label="Shopping cart"
                    >
                        <ShoppingBag size={21} />

                        {cartCount > 0 && (
                            <span className="cart-count">
                                {cartCount}
                            </span>
                        )}
                    </Link>


                    {/* MOBILE MENU BUTTON */}
                    <button
                        className="mobile-menu-button"
                        type="button"
                        aria-label="Menu"
                        onClick={() =>
                            setMobileMenu(!mobileMenu)
                        }
                    >
                        {mobileMenu ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>

                </div>

            </div>


            {/* MOBILE MENU */}
            {mobileMenu && (
                <div className="mobile-menu">

                    <Link
                        to="/"
                        onClick={() =>
                            setMobileMenu(false)
                        }
                    >
                        Home
                    </Link>


                    <Link
                        to="/products?gender=men"
                        onClick={() =>
                            setMobileMenu(false)
                        }
                    >
                        Men
                    </Link>


                    <Link
                        to="/products?gender=women"
                        onClick={() =>
                            setMobileMenu(false)
                        }
                    >
                        Women
                    </Link>


                    <Link
                        to="/products"
                        onClick={() =>
                            setMobileMenu(false)
                        }
                    >
                        Collections
                    </Link>


                    <Link
                        to="/products"
                        onClick={() =>
                            setMobileMenu(false)
                        }
                    >
                        New Arrivals
                    </Link>


                    <Link
                        to="/cart"
                        onClick={() =>
                            setMobileMenu(false)
                        }
                    >
                        Cart ({cartCount})
                    </Link>


                    {/* MOBILE ADMIN PANEL */}
                    {isAdmin && (
                        <Link
                            to="/admin/dashboard"
                            onClick={() =>
                                setMobileMenu(false)
                            }
                            className="mobile-admin-link"
                        >
                            Admin Panel
                        </Link>
                    )}

                </div>
            )}

        </header>
    );
}

export default Navbar;