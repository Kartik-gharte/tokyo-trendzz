import { useEffect, useState } from "react";
import {
    Search,
    Star,
    Trash2,
    MessageSquare,
    Package,
    Users,
    TrendingUp
} from "lucide-react";

import "./AdminReviews.css";

function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        total_reviews: 0,
        average_rating: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
    });

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, []);

    async function fetchReviews() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const response = await fetch(
                "http://localhost:5000/api/admin/reviews",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch reviews"
                );
            }

            setReviews(data.reviews || []);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function fetchStats() {
        try {
            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const response = await fetch(
                "http://localhost:5000/api/admin/reviews/stats",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to fetch review statistics"
                );
            }

            setStats(data.stats || {});
        } catch (error) {
            console.error("Stats error:", error);
        }
    }

    async function handleDelete(reviewId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this review?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const response = await fetch(
                `http://localhost:5000/api/admin/reviews/${reviewId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to delete review"
                );
            }

            setReviews((currentReviews) =>
                currentReviews.filter(
                    (review) => review.id !== reviewId
                )
            );

            fetchStats();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    function filteredReviews() {
        const searchText = search.trim().toLowerCase();

        if (!searchText) {
            return reviews;
        }

        return reviews.filter((review) => {
            return (
                review.customer_name
                    ?.toLowerCase()
                    .includes(searchText) ||
                review.customer_email
                    ?.toLowerCase()
                    .includes(searchText) ||
                review.product_name
                    ?.toLowerCase()
                    .includes(searchText) ||
                review.comment
                    ?.toLowerCase()
                    .includes(searchText) ||
                String(review.rating).includes(searchText)
            );
        });
    }

    function renderStars(rating) {
        return (
            <div className="admin-review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        fill={
                            star <= rating
                                ? "currentColor"
                                : "none"
                        }
                    />
                ))}
            </div>
        );
    }

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    const displayedReviews = filteredReviews();

    return (
        <div className="admin-reviews-page">

            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1>Reviews</h1>
                    <p>
                        Manage customer reviews and ratings
                    </p>
                </div>
            </div>


            {/* Statistics */}
            <div className="admin-review-stats">

                <div className="admin-review-stat-card">
                    <div className="admin-review-stat-icon">
                        <MessageSquare size={22} />
                    </div>

                    <div>
                        <span>Total Reviews</span>
                        <strong>
                            {stats.total_reviews || 0}
                        </strong>
                    </div>
                </div>


                <div className="admin-review-stat-card">
                    <div className="admin-review-stat-icon">
                        <Star size={22} />
                    </div>

                    <div>
                        <span>Average Rating</span>
                        <strong>
                            {stats.average_rating
                                ? stats.average_rating
                                : "0.0"}
                            <small> / 5</small>
                        </strong>
                    </div>
                </div>


                <div className="admin-review-stat-card">
                    <div className="admin-review-stat-icon">
                        <Package size={22} />
                    </div>

                    <div>
                        <span>5 Star Reviews</span>
                        <strong>
                            {stats.five_star || 0}
                        </strong>
                    </div>
                </div>


                <div className="admin-review-stat-card">
                    <div className="admin-review-stat-icon">
                        <TrendingUp size={22} />
                    </div>

                    <div>
                        <span>4+ Star Reviews</span>
                        <strong>
                            {(Number(stats.five_star) || 0) +
                                (Number(stats.four_star) || 0)}
                        </strong>
                    </div>
                </div>

            </div>


            {/* Rating Breakdown */}
            <div className="admin-rating-breakdown">

                <div className="admin-rating-breakdown-header">
                    <h2>Rating Breakdown</h2>
                    <span>
                        {stats.total_reviews || 0} reviews
                    </span>
                </div>

                {[5, 4, 3, 2, 1].map((rating) => {
                    const count =
                        Number(
                            stats[`${[
                                "",
                                "one",
                                "two",
                                "three",
                                "four",
                                "five"
                            ][rating]}_star`]
                        ) || 0;

                    const total =
                        Number(stats.total_reviews) || 0;

                    const percentage =
                        total > 0
                            ? (count / total) * 100
                            : 0;

                    return (
                        <div
                            className="admin-rating-row"
                            key={rating}
                        >
                            <div className="admin-rating-label">
                                <span>{rating}</span>
                                <Star
                                    size={15}
                                    fill="currentColor"
                                />
                            </div>

                            <div className="admin-rating-bar">
                                <div
                                    style={{
                                        width: `${percentage}%`
                                    }}
                                />
                            </div>

                            <span className="admin-rating-count">
                                {count}
                            </span>
                        </div>
                    );
                })}

            </div>


            {/* Toolbar */}
            <div className="admin-reviews-toolbar">

                <div className="admin-review-count">
                    <strong>{displayedReviews.length}</strong>
                    <span>reviews found</span>
                </div>

                <div className="admin-review-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search reviews..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>

            </div>


            {/* Content */}
            {loading ? (
                <div className="admin-review-state">
                    Loading reviews...
                </div>
            ) : error ? (
                <div className="admin-review-state error">
                    {error}
                </div>
            ) : displayedReviews.length === 0 ? (
                <div className="admin-review-empty">

                    <div className="admin-review-empty-icon">
                        <MessageSquare size={34} />
                    </div>

                    <h2>
                        {search
                            ? "No reviews found"
                            : "No reviews yet"}
                    </h2>

                    <p>
                        {search
                            ? "Try a different search term."
                            : "Customer reviews will appear here when they are submitted."}
                    </p>

                </div>
            ) : (

                <div className="admin-reviews-table-wrapper">

                    <table className="admin-reviews-table">

                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Rating</th>
                                <th>Review</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {displayedReviews.map((review) => (

                                <tr key={review.id}>

                                    <td>
                                        <div className="admin-review-customer">

                                            <div className="admin-review-avatar">
                                                {review.customer_name
                                                    ?.charAt(0)
                                                    .toUpperCase() ||
                                                    "U"}
                                            </div>

                                            <div>
                                                <strong>
                                                    {review.customer_name ||
                                                        "Unknown"}
                                                </strong>

                                                <span>
                                                    {review.customer_email ||
                                                        "-"}
                                                </span>
                                            </div>

                                        </div>
                                    </td>


                                    <td>
                                        <div className="admin-review-product">
                                            <Package size={17} />

                                            <span>
                                                {review.product_name ||
                                                    "Unknown Product"}
                                            </span>
                                        </div>
                                    </td>


                                    <td>
                                        <div className="admin-review-rating">

                                            {renderStars(
                                                Number(
                                                    review.rating
                                                )
                                            )}

                                            <span>
                                                {review.rating}/5
                                            </span>

                                        </div>
                                    </td>


                                    <td>
                                        <div className="admin-review-comment">
                                            {review.comment ||
                                                "No comment provided"}
                                        </div>
                                    </td>


                                    <td>
                                        {formatDate(
                                            review.created_at
                                        )}
                                    </td>


                                    <td>
                                        <button
                                            className="admin-review-delete"
                                            onClick={() =>
                                                handleDelete(
                                                    review.id
                                                )
                                            }
                                            title="Delete review"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}

export default AdminReviews;