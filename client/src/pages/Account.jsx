import { Link, useNavigate } from "react-router-dom";
import { User, Package, Heart, ShoppingBag, LogOut } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

import "./Account.css";

function Account() {
    const navigate = useNavigate();

    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="account-page">
            <div className="account-container">

                <div className="account-header">
                    <div className="account-avatar">
                        <User size={32} />
                    </div>

                    <div>
                        <h1>My Account</h1>

                        <p>
                            Welcome back, {user?.name || "User"} 👋
                        </p>
                    </div>
                </div>

                <div className="account-info">
                    <h2>Account Information</h2>

                    <div className="account-detail">
                        <span>Name</span>
                        <strong>
                            {user?.name || "Not available"}
                        </strong>
                    </div>

                    <div className="account-detail">
                        <span>Email</span>
                        <strong>
                            {user?.email || "Not available"}
                        </strong>
                    </div>
                </div>

                <div className="account-options">

                    <Link
                        to="/products"
                        className="account-option"
                    >
                        <Package size={24} />

                        <div>
                            <h3>My Orders</h3>
                            <p>View your orders</p>
                        </div>
                    </Link>

                    <Link
                        to="/wishlist"
                        className="account-option"
                    >
                        <Heart size={24} />

                        <div>
                            <h3>Wishlist</h3>
                            <p>
                                {wishlistCount} saved item
                                {wishlistCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/cart"
                        className="account-option"
                    >
                        <ShoppingBag size={24} />

                        <div>
                            <h3>Shopping Bag</h3>
                            <p>
                                {cartCount} item
                                {cartCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </Link>

                </div>

                <button
                    type="button"
                    className="account-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                    Logout
                </button>

            </div>
        </div>
    );
}

export default Account;