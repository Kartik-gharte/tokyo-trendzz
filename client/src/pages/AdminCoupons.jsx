import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    X,
    TicketPercent,
    RefreshCw,
    CalendarDays,
    Hash
} from "lucide-react";

import "./AdminCoupons.css";

const API_URL = "/api/admin/coupons";

function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingCouponId, setEditingCouponId] = useState(null);

    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        minimum_order_amount: "",
        maximum_discount: "",
        expiry_date: "",
        usage_limit: "1",
        is_active: 1
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    async function fetchCoupons() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Authentication token is missing."
                );
            }

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to fetch coupons."
                );
            }

            setCoupons(data.coupons || []);
        } catch (error) {
            console.error(
                "Fetch coupons error:",
                error
            );

            setError(
                error.message ||
                    "Failed to load coupons."
            );
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setFormData({
            code: "",
            discount_type: "percentage",
            discount_value: "",
            minimum_order_amount: "",
            maximum_discount: "",
            expiry_date: "",
            usage_limit: "1",
            is_active: 1
        });

        setEditMode(false);
        setEditingCouponId(null);
    }

    function openAddForm() {
        setError("");
        resetForm();
        setShowForm(true);
    }

    function openEditForm(coupon) {
        setError("");
        setEditMode(true);
        setEditingCouponId(coupon.id);

        const expiryDate = coupon.expiry_date
            ? new Date(coupon.expiry_date)
                  .toISOString()
                  .slice(0, 16)
            : "";

        setFormData({
            code: coupon.code || "",
            discount_type:
                coupon.discount_type || "percentage",
            discount_value:
                coupon.discount_value ?? "",
            minimum_order_amount:
                coupon.minimum_order_amount ?? "",
            maximum_discount:
                coupon.maximum_discount ?? "",
            expiry_date: expiryDate,
            usage_limit:
                coupon.usage_limit ?? "1",
            is_active: coupon.is_active ? 1 : 0
        });

        setShowForm(true);
    }

    function closeForm() {
        if (submitting) {
            return;
        }

        setShowForm(false);
        resetForm();
    }

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]:
                name === "code"
                    ? value.toUpperCase()
                    : value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedCode =
            formData.code.trim();

        if (!trimmedCode) {
            setError("Please enter a coupon code.");
            return;
        }

        if (
            !formData.discount_value ||
            Number(formData.discount_value) <= 0
        ) {
            setError(
                "Discount value must be greater than 0."
            );
            return;
        }

        if (
            formData.discount_type === "percentage" &&
            Number(formData.discount_value) > 100
        ) {
            setError(
                "Percentage discount cannot exceed 100%."
            );
            return;
        }

        if (!formData.expiry_date) {
            setError("Please select an expiry date.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Authentication token is missing."
                );
            }

            const url = editMode
                ? `${API_URL}/${editingCouponId}`
                : API_URL;

            const response = await fetch(url, {
                method: editMode ? "PUT" : "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: trimmedCode,
                    discount_type:
                        formData.discount_type,
                    discount_value: Number(
                        formData.discount_value
                    ),
                    minimum_order_amount:
                        Number(
                            formData.minimum_order_amount
                        ) || 0,
                    maximum_discount:
                        formData.maximum_discount
                            ? Number(
                                  formData.maximum_discount
                              )
                            : null,
                    expiry_date:
                        formData.expiry_date,
                    usage_limit:
                        Number(
                            formData.usage_limit
                        ) || 1,
                    is_active:
                        Number(formData.is_active)
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to save coupon."
                );
            }

            alert(
                editMode
                    ? "Coupon updated successfully!"
                    : "Coupon created successfully!"
            );

            setShowForm(false);
            resetForm();

            await fetchCoupons();
        } catch (error) {
            console.error(
                "Save coupon error:",
                error
            );

            setError(
                error.message ||
                    "Failed to save coupon."
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(coupon) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${coupon.code}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Authentication token is missing."
                );
            }

            const response = await fetch(
                `${API_URL}/${coupon.id}`,
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
                    data.message ||
                        "Failed to delete coupon."
                );
            }

            alert(
                "Coupon deleted successfully!"
            );

            await fetchCoupons();
        } catch (error) {
            console.error(
                "Delete coupon error:",
                error
            );

            setError(
                error.message ||
                    "Failed to delete coupon."
            );
        }
    }

    async function toggleStatus(couponId) {
        try {
            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Authentication token is missing."
                );
            }

            const response = await fetch(
                `${API_URL}/${couponId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to update coupon status."
                );
            }

            await fetchCoupons();
        } catch (error) {
            console.error(
                "Toggle coupon status error:",
                error
            );

            setError(
                error.message ||
                    "Failed to update coupon status."
            );
        }
    }

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    function formatDiscount(coupon) {
        if (
            coupon.discount_type ===
            "percentage"
        ) {
            return `${coupon.discount_value}%`;
        }

        return `₹${Number(
            coupon.discount_value
        ).toFixed(0)}`;
    }

    function isExpired(date) {
        if (!date) {
            return false;
        }

        return new Date(date) < new Date();
    }

    const filteredCoupons = useMemo(() => {
        const searchValue = search
            .trim()
            .toLowerCase();

        if (!searchValue) {
            return coupons;
        }

        return coupons.filter((coupon) =>
            coupon.code
                ?.toLowerCase()
                .includes(searchValue)
        );
    }, [coupons, search]);

    const activeCount = coupons.filter(
        (coupon) => coupon.is_active
    ).length;

    const expiredCount = coupons.filter(
        (coupon) => isExpired(coupon.expiry_date)
    ).length;

    const totalUsage = coupons.reduce(
        (total, coupon) =>
            total + Number(coupon.used_count || 0),
        0
    );

    return (
        <div className="admin-coupons">
            <div className="admin-coupons-header">
                <div>
                    <span className="coupons-eyebrow">
                        TOKYO TRENDZ / ADMIN
                    </span>

                    <h1>Coupons</h1>

                    <p>
                        Manage discount codes and
                        promotional offers.
                    </p>
                </div>

                <button
                    type="button"
                    className="coupon-add-button"
                    onClick={openAddForm}
                >
                    <Plus size={17} />
                    Add Coupon
                </button>
            </div>

            <div className="coupon-summary">
                <div className="coupon-summary-card">
                    <div className="coupon-summary-icon">
                        <TicketPercent size={19} />
                    </div>

                    <div>
                        <span>Total Coupons</span>
                        <strong>
                            {coupons.length}
                        </strong>
                    </div>
                </div>

                <div className="coupon-summary-card">
                    <div className="coupon-summary-icon">
                        <ToggleRight size={20} />
                    </div>

                    <div>
                        <span>Active Coupons</span>
                        <strong>
                            {activeCount}
                        </strong>
                    </div>
                </div>

                <div className="coupon-summary-card">
                    <div className="coupon-summary-icon">
                        <Hash size={19} />
                    </div>

                    <div>
                        <span>Total Usage</span>
                        <strong>
                            {totalUsage}
                        </strong>
                    </div>
                </div>

                <div className="coupon-summary-card">
                    <div className="coupon-summary-icon">
                        <CalendarDays size={19} />
                    </div>

                    <div>
                        <span>Expired</span>
                        <strong>
                            {expiredCount}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="coupons-panel">
                <div className="coupons-panel-header">
                    <div>
                        <span className="coupons-panel-eyebrow">
                            PROMOTIONS
                        </span>

                        <h2>Discount Coupons</h2>

                        <p>
                            Showing{" "}
                            <strong>
                                {
                                    filteredCoupons.length
                                }
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {coupons.length}
                            </strong>{" "}
                            coupons
                        </p>
                    </div>

                    <div className="coupon-search">
                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search coupon code..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="coupon-state">
                        <div className="coupon-spinner" />

                        <h3>
                            Loading Coupons
                        </h3>

                        <p>
                            Fetching promotional
                            offers...
                        </p>
                    </div>
                ) : error ? (
                    <div className="coupon-state error">
                        <X size={40} />

                        <h3>
                            Unable to Load Coupons
                        </h3>

                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={fetchCoupons}
                        >
                            <RefreshCw size={15} />
                            Try Again
                        </button>
                    </div>
                ) : filteredCoupons.length ===
                  0 ? (
                    <div className="coupon-state">
                        <div className="coupon-empty-icon">
                            <TicketPercent
                                size={27}
                            />
                        </div>

                        <h3>
                            {search
                                ? "No Coupons Found"
                                : "No Coupons Available"}
                        </h3>

                        <p>
                            {search
                                ? "Try a different coupon code."
                                : "Create your first promotional coupon."}
                        </p>

                        {search ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                Clear Search
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={
                                    openAddForm
                                }
                            >
                                <Plus size={15} />
                                Add Coupon
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="coupon-table-wrapper">
                        <table className="coupon-table">
                            <thead>
                                <tr>
                                    <th>Coupon</th>
                                    <th>Discount</th>
                                    <th>Min. Order</th>
                                    <th>Expiry</th>
                                    <th>Usage</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCoupons.map(
                                    (coupon) => (
                                        <tr
                                            key={
                                                coupon.id
                                            }
                                        >
                                            <td>
                                                <div className="coupon-code-cell">
                                                    <div className="coupon-code-icon">
                                                        <TicketPercent
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                coupon.code
                                                            }
                                                        </strong>

                                                        <span>
                                                            #
                                                            {
                                                                coupon.id
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="coupon-discount-cell">
                                                    <strong>
                                                        {formatDiscount(
                                                            coupon
                                                        )}
                                                    </strong>

                                                    {coupon.discount_type ===
                                                        "percentage" &&
                                                        coupon.maximum_discount && (
                                                            <span>
                                                                Max ₹
                                                                {Number(
                                                                    coupon.maximum_discount
                                                                ).toFixed(
                                                                    0
                                                                )}
                                                            </span>
                                                        )}
                                                </div>
                                            </td>

                                            <td>
                                                <span className="coupon-money">
                                                    ₹
                                                    {Number(
                                                        coupon.minimum_order_amount ||
                                                            0
                                                    ).toFixed(
                                                        0
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <div
                                                    className={`coupon-expiry ${
                                                        isExpired(
                                                            coupon.expiry_date
                                                        )
                                                            ? "expired"
                                                            : ""
                                                    }`}
                                                >
                                                    <CalendarDays
                                                        size={
                                                            13
                                                        }
                                                    />

                                                    <span>
                                                        {formatDate(
                                                            coupon.expiry_date
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="coupon-usage">
                                                    <strong>
                                                        {coupon.used_count ||
                                                            0}
                                                    </strong>

                                                    <span>
                                                        /
                                                        {coupon.usage_limit ||
                                                            "∞"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className={`coupon-status ${
                                                        coupon.is_active
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                    onClick={() =>
                                                        toggleStatus(
                                                            coupon.id
                                                        )
                                                    }
                                                >
                                                    {coupon.is_active ? (
                                                        <>
                                                            <ToggleRight
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleLeft
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                            Inactive
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            <td>
                                                <div className="coupon-actions">
                                                    <button
                                                        type="button"
                                                        className="coupon-edit-button"
                                                        onClick={() =>
                                                            openEditForm(
                                                                coupon
                                                            )
                                                        }
                                                        title="Edit coupon"
                                                    >
                                                        <Pencil
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="coupon-delete-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                coupon
                                                            )
                                                        }
                                                        title="Delete coupon"
                                                    >
                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showForm && (
                <div
                    className="coupon-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                                event.currentTarget &&
                            !submitting
                        ) {
                            closeForm();
                        }
                    }}
                >
                    <div className="coupon-modal">
                        <div className="coupon-modal-header">
                            <div>
                                <span>
                                    {editMode
                                        ? "UPDATE PROMOTION"
                                        : "NEW PROMOTION"}
                                </span>

                                <h2>
                                    {editMode
                                        ? "Edit Coupon"
                                        : "Create Coupon"}
                                </h2>

                                <p>
                                    Configure discount
                                    rules and usage
                                    limits.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="coupon-close-button"
                                onClick={closeForm}
                                disabled={submitting}
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form
                            className="coupon-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="coupon-form-group">
                                <label>
                                    Coupon Code *
                                </label>

                                <input
                                    type="text"
                                    name="code"
                                    value={
                                        formData.code
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="TOKYO20"
                                    required
                                />

                                <small>
                                    Example:
                                    TOKYO20
                                </small>
                            </div>

                            <div className="coupon-form-row">
                                <div className="coupon-form-group">
                                    <label>
                                        Discount Type *
                                    </label>

                                    <select
                                        name="discount_type"
                                        value={
                                            formData.discount_type
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                    >
                                        <option value="percentage">
                                            Percentage
                                        </option>

                                        <option value="fixed">
                                            Fixed Amount
                                        </option>
                                    </select>
                                </div>

                                <div className="coupon-form-group">
                                    <label>
                                        Discount Value *
                                    </label>

                                    <div className="coupon-input-with-prefix">
                                        <span>
                                            {formData.discount_type ===
                                            "percentage"
                                                ? "%"
                                                : "₹"}
                                        </span>

                                        <input
                                            type="number"
                                            name="discount_value"
                                            value={
                                                formData.discount_value
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            min="0.01"
                                            max={
                                                formData.discount_type ===
                                                "percentage"
                                                    ? "100"
                                                    : undefined
                                            }
                                            step="0.01"
                                            placeholder={
                                                formData.discount_type ===
                                                "percentage"
                                                    ? "20"
                                                    : "500"
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="coupon-form-row">
                                <div className="coupon-form-group">
                                    <label>
                                        Minimum Order
                                    </label>

                                    <div className="coupon-input-with-prefix">
                                        <span>₹</span>

                                        <input
                                            type="number"
                                            name="minimum_order_amount"
                                            value={
                                                formData.minimum_order_amount
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            min="0"
                                            step="0.01"
                                            placeholder="1000"
                                        />
                                    </div>
                                </div>

                                <div className="coupon-form-group">
                                    <label>
                                        Maximum Discount
                                    </label>

                                    <div className="coupon-input-with-prefix">
                                        <span>₹</span>

                                        <input
                                            type="number"
                                            name="maximum_discount"
                                            value={
                                                formData.maximum_discount
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            min="0"
                                            step="0.01"
                                            placeholder="500"
                                            disabled={
                                                formData.discount_type ===
                                                "fixed"
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="coupon-form-row">
                                <div className="coupon-form-group">
                                    <label>
                                        Expiry Date *
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="expiry_date"
                                        value={
                                            formData.expiry_date
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />
                                </div>

                                <div className="coupon-form-group">
                                    <label>
                                        Usage Limit
                                    </label>

                                    <input
                                        type="number"
                                        name="usage_limit"
                                        value={
                                            formData.usage_limit
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        min="1"
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            <div className="coupon-form-group">
                                <label>
                                    Coupon Status
                                </label>

                                <select
                                    name="is_active"
                                    value={
                                        formData.is_active
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                >
                                    <option value="1">
                                        Active
                                    </option>

                                    <option value="0">
                                        Inactive
                                    </option>
                                </select>
                            </div>

                            <div className="coupon-form-actions">
                                <button
                                    type="button"
                                    className="coupon-cancel-button"
                                    onClick={closeForm}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="coupon-save-button"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editMode
                                        ? "Update Coupon"
                                        : "Create Coupon"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCoupons;