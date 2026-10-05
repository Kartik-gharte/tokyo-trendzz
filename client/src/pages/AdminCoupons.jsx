import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    X
} from "lucide-react";

import "./AdminCoupons.css";

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

            const response = await fetch(
                "http://localhost:5000/api/admin/coupons",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch coupons"
                );
            }

            setCoupons(data.coupons || []);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }


    function openAddForm() {
        setEditMode(false);
        setEditingCouponId(null);

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

        setShowForm(true);
    }


    function openEditForm(coupon) {
        setEditMode(true);
        setEditingCouponId(coupon.id);

        const expiryDate = coupon.expiry_date
            ? new Date(coupon.expiry_date)
                .toISOString()
                .slice(0, 16)
            : "";

        setFormData({
            code: coupon.code || "",
            discount_type: coupon.discount_type || "percentage",
            discount_value: coupon.discount_value || "",
            minimum_order_amount:
                coupon.minimum_order_amount || "",
            maximum_discount:
                coupon.maximum_discount || "",
            expiry_date: expiryDate,
            usage_limit: coupon.usage_limit || "1",
            is_active: coupon.is_active ? 1 : 0
        });

        setShowForm(true);
    }


    function closeForm() {
        if (submitting) {
            return;
        }

        setShowForm(false);
        setEditMode(false);
        setEditingCouponId(null);
    }


    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    }


    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError("");

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const url = editMode
                ? `http://localhost:5000/api/admin/coupons/${editingCouponId}`
                : "http://localhost:5000/api/admin/coupons";

            const response = await fetch(url, {
                method: editMode ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: formData.code,
                    discount_type: formData.discount_type,
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
                    expiry_date: formData.expiry_date,
                    usage_limit:
                        Number(formData.usage_limit) || 1,
                    is_active:
                        Number(formData.is_active)
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to save coupon"
                );
            }

            alert(
                editMode
                    ? "Coupon updated successfully!"
                    : "Coupon created successfully!"
            );

            closeForm();

            await fetchCoupons();
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    }


    async function handleDelete(couponId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this coupon?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const response = await fetch(
                `http://localhost:5000/api/admin/coupons/${couponId}`,
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
                    "Failed to delete coupon"
                );
            }

            alert("Coupon deleted successfully!");

            await fetchCoupons();
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    }


    async function toggleStatus(couponId) {
        try {
            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const response = await fetch(
                `http://localhost:5000/api/admin/coupons/${couponId}/status`,
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
                    "Failed to update coupon status"
                );
            }

            await fetchCoupons();
        } catch (error) {
            console.error(error);
            setError(error.message);
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
        if (coupon.discount_type === "percentage") {
            return `${coupon.discount_value}%`;
        }

        return `₹${Number(
            coupon.discount_value
        ).toFixed(2)}`;
    }


    const filteredCoupons = coupons.filter(
        (coupon) =>
            coupon.code
                .toLowerCase()
                .includes(search.toLowerCase())
    );


    return (
        <div className="admin-coupons">

            <div className="admin-coupons-header">
                <div>
                    <h1>Coupons</h1>
                    <p>
                        Manage discount coupons and
                        promotional offers.
                    </p>
                </div>

                <button
                    className="coupon-add-button"
                    onClick={openAddForm}
                >
                    <Plus size={18} />
                    Add Coupon
                </button>
            </div>


            <div className="coupon-toolbar">

                <div className="coupon-count">
                    {coupons.length} Coupon
                    {coupons.length !== 1 ? "s" : ""}
                </div>

                <div className="coupon-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search coupon code..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>

            </div>


            {loading && (
                <div className="coupon-loading">
                    Loading coupons...
                </div>
            )}


            {!loading && error && (
                <div className="coupon-error">
                    {error}
                </div>
            )}


            {!loading &&
                !error &&
                filteredCoupons.length === 0 && (
                    <div className="coupon-empty">
                        <div className="coupon-empty-icon">
                            %
                        </div>

                        <h3>No coupons found</h3>

                        <p>
                            Create your first coupon to
                            start offering discounts.
                        </p>

                        <button
                            onClick={openAddForm}
                            className="coupon-add-button"
                        >
                            <Plus size={18} />
                            Add Coupon
                        </button>
                    </div>
                )}


            {!loading &&
                !error &&
                filteredCoupons.length > 0 && (

                    <div className="coupon-table-wrapper">

                        <table className="coupon-table">

                            <thead>
                                <tr>
                                    <th>Coupon</th>
                                    <th>Discount</th>
                                    <th>Minimum Order</th>
                                    <th>Expiry</th>
                                    <th>Usage</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredCoupons.map(
                                    (coupon) => (
                                        <tr key={coupon.id}>

                                            <td>
                                                <strong>
                                                    {coupon.code}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="coupon-discount">
                                                    {formatDiscount(
                                                        coupon
                                                    )}
                                                </span>

                                                {coupon.maximum_discount &&
                                                    coupon.discount_type ===
                                                    "percentage" && (
                                                        <small>
                                                            Max ₹
                                                            {Number(
                                                                coupon.maximum_discount
                                                            ).toFixed(0)}
                                                        </small>
                                                    )}
                                            </td>

                                            <td>
                                                ₹
                                                {Number(
                                                    coupon.minimum_order_amount ||
                                                    0
                                                ).toFixed(0)}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    coupon.expiry_date
                                                )}
                                            </td>

                                            <td>
                                                {coupon.used_count || 0}
                                                {" / "}
                                                {coupon.usage_limit || "∞"}
                                            </td>

                                            <td>

                                                <button
                                                    className={
                                                        coupon.is_active
                                                            ? "coupon-status active"
                                                            : "coupon-status inactive"
                                                    }
                                                    onClick={() =>
                                                        toggleStatus(
                                                            coupon.id
                                                        )
                                                    }
                                                >
                                                    {coupon.is_active ? (
                                                        <>
                                                            <ToggleRight
                                                                size={19}
                                                            />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleLeft
                                                                size={19}
                                                            />
                                                            Inactive
                                                        </>
                                                    )}
                                                </button>

                                            </td>

                                            <td>

                                                <div className="coupon-actions">

                                                    <button
                                                        className="coupon-edit-button"
                                                        onClick={() =>
                                                            openEditForm(
                                                                coupon
                                                            )
                                                        }
                                                        title="Edit coupon"
                                                    >
                                                        <Pencil
                                                            size={17}
                                                        />
                                                    </button>

                                                    <button
                                                        className="coupon-delete-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                coupon.id
                                                            )
                                                        }
                                                        title="Delete coupon"
                                                    >
                                                        <Trash2
                                                            size={17}
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


            {showForm && (

                <div
                    className="coupon-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeForm();
                        }
                    }}
                >

                    <div className="coupon-modal">

                        <div className="coupon-modal-header">

                            <div>
                                <h2>
                                    {editMode
                                        ? "Edit Coupon"
                                        : "Add Coupon"}
                                </h2>

                                <p>
                                    Set the discount rules
                                    for this coupon.
                                </p>
                            </div>

                            <button
                                className="coupon-close-button"
                                onClick={closeForm}
                            >
                                <X size={20} />
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
                                    value={formData.code}
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="e.g. TOKYO20"
                                    required
                                />

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


                            <div className="coupon-form-row">

                                <div className="coupon-form-group">

                                    <label>
                                        Minimum Order Amount
                                    </label>

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


                                <div className="coupon-form-group">

                                    <label>
                                        Maximum Discount
                                    </label>

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
                                    />

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
                                    Status
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