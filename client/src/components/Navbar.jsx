
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

    const closeMobileMenu = () => {
        setMobileMenu(false);
    };

    return (
        <header className="navbar">
            <div className="navbar-container">

                {/* LOGO */}
                <Link
                    to="/"
                    className="navbar-logo"
                    onClick={closeMobileMenu}
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

                    <Link to="/products?category=cosmetics">
                        Cosmetics
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
                        aria-label={
                            mobileMenu ? "Close menu" : "Open menu"
                        }
                        aria-expanded={mobileMenu}
                        onClick={() => setMobileMenu(!mobileMenu)}
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

                    <Link to="/" onClick={closeMobileMenu}>
                        Home
                    </Link>

                    <Link
                        to="/products?gender=men"
                        onClick={closeMobileMenu}
                    >
                        Men
                    </Link>

                    <Link
                        to="/products?gender=women"
                        onClick={closeMobileMenu}
                    >
                        Women
                    </Link>

                    <Link
                        to="/products?category=cosmetics"
                        onClick={closeMobileMenu}
                    >
                        Cosmetics
                    </Link>

                    <Link
                        to="/products"
                        onClick={closeMobileMenu}
                    >
                        New Arrivals
                    </Link>

                    <Link
                        to="/cart"
                        onClick={closeMobileMenu}
                    >
                        Cart ({cartCount})
                    </Link>

                    {/* MOBILE ADMIN PANEL */}
                    {isAdmin && (
                        <Link
                            to="/admin/dashboard"
                            onClick={closeMobileMenu}
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
