import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    FolderOpen,
    X,
    RefreshCw,
    Package
} from "lucide-react";

import "./AdminCategories.css";

const API_URL = "/api/admin/categories";

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingCategoryId, setEditingCategoryId] =
        useState(null);

    const [formData, setFormData] = useState({
        name: "",
        image_url: ""
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
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
                        "Failed to fetch categories."
                );
            }

            setCategories(data.categories || []);
        } catch (error) {
            console.error(
                "Fetch categories error:",
                error
            );

            setError(
                error.message ||
                    "Failed to load categories."
            );
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setFormData({
            name: "",
            image_url: ""
        });

        setEditMode(false);
        setEditingCategoryId(null);
    }

    function openAddForm() {
        resetForm();
        setShowForm(true);
    }

    function openEditForm(category) {
        setEditMode(true);
        setEditingCategoryId(category.id);

        setFormData({
            name: category.name || "",
            image_url: category.image_url || ""
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
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedName = formData.name.trim();

        if (!trimmedName) {
            alert("Please enter a category name.");
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Authentication token is missing."
                );
            }

            const url = editMode
                ? `${API_URL}/${editingCategoryId}`
                : API_URL;

            const method = editMode ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: trimmedName,
                    image_url: formData.image_url.trim()
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to save category."
                );
            }

            alert(
                editMode
                    ? "Category updated successfully."
                    : "Category created successfully."
            );

            setShowForm(false);
            resetForm();

            await fetchCategories();
        } catch (error) {
            console.error(
                "Save category error:",
                error
            );

            alert(
                error.message ||
                    "Failed to save category."
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(category) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.name}"?`
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
                `${API_URL}/${category.id}`,
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
                        "Failed to delete category."
                );
            }

            alert("Category deleted successfully.");

            await fetchCategories();
        } catch (error) {
            console.error(
                "Delete category error:",
                error
            );

            alert(
                error.message ||
                    "Failed to delete category."
            );
        }
    }

    const filteredCategories = useMemo(() => {
        const searchValue = search
            .trim()
            .toLowerCase();

        if (!searchValue) {
            return categories;
        }

        return categories.filter((category) => {
            const name =
                category.name?.toLowerCase() || "";

            const slug =
                category.slug?.toLowerCase() || "";

            return (
                name.includes(searchValue) ||
                slug.includes(searchValue)
            );
        });
    }, [categories, search]);

    return (
        <div className="admin-categories">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-categories-header">
                <div>
                    <span className="categories-eyebrow">
                        TOKYO TRENDZ / ADMIN
                    </span>

                    <h1>Categories</h1>

                    <p>
                        Organize products into clean
                        storefront collections.
                    </p>
                </div>

                <button
                    type="button"
                    className="add-category-button"
                    onClick={openAddForm}
                >
                    <Plus size={17} />
                    Add Category
                </button>
            </div>

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="categories-toolbar">
                <div className="categories-count">
                    <FolderOpen size={17} />

                    <span>
                        {filteredCategories.length}{" "}
                        {filteredCategories.length === 1
                            ? "Category"
                            : "Categories"}
                    </span>
                </div>

                <div className="category-search">
                    <Search size={17} />

                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>
            </div>

            {/* =================================================
                CONTENT STATES
            ================================================= */}

            {loading ? (
                <div className="categories-state">
                    <div className="categories-spinner" />

                    <h3>Loading Categories</h3>

                    <p>
                        Fetching category information...
                    </p>
                </div>
            ) : error ? (
                <div className="categories-state error">
                    <X size={40} />

                    <h3>
                        Unable to Load Categories
                    </h3>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={fetchCategories}
                    >
                        <RefreshCw size={15} />
                        Try Again
                    </button>
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="categories-state">
                    <FolderOpen size={42} />

                    <h3>
                        {search
                            ? "No Categories Found"
                            : "No Categories Available"}
                    </h3>

                    <p>
                        {search
                            ? "Try changing your search."
                            : "Create your first product category."}
                    </p>

                    {search ? (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                        >
                            Clear Search
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={openAddForm}
                        >
                            <Plus size={15} />
                            Add Category
                        </button>
                    )}
                </div>
            ) : (
                <div className="categories-grid">
                    {filteredCategories.map(
                        (category) => (
                            <div
                                className="category-card"
                                key={category.id}
                            >
                                {/* IMAGE */}

                                <div className="category-image">
                                    {category.image_url ? (
                                        <img
                                            src={
                                                category.image_url
                                            }
                                            alt={
                                                category.name
                                            }
                                            onError={(
                                                event
                                            ) => {
                                                event.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />
                                    ) : (
                                        <FolderOpen
                                            size={40}
                                        />
                                    )}
                                </div>

                                {/* CONTENT */}

                                <div className="category-card-content">
                                    <div className="category-card-top">
                                        <div>
                                            <h3>
                                                {
                                                    category.name
                                                }
                                            </h3>

                                            <span>
                                                /
                                                {
                                                    category.slug
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    <div className="category-product-count">
                                        <Package
                                            size={12}
                                        />

                                        &nbsp;

                                        {
                                            category.product_count
                                        }{" "}
                                        product
                                        {Number(
                                            category.product_count
                                        ) === 1
                                            ? ""
                                            : "s"}
                                    </div>

                                    <div className="category-actions">
                                        <button
                                            type="button"
                                            className="edit-category-button"
                                            onClick={() =>
                                                openEditForm(
                                                    category
                                                )
                                            }
                                        >
                                            <Pencil
                                                size={15}
                                            />
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="delete-category-button"
                                            onClick={() =>
                                                handleDelete(
                                                    category
                                                )
                                            }
                                        >
                                            <Trash2
                                                size={15}
                                            />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {showForm && (
                <div
                    className="category-modal-overlay"
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
                    <div className="category-modal">
                        <div className="category-modal-header">
                            <div>
                                <h2>
                                    {editMode
                                        ? "Edit Category"
                                        : "Add Category"}
                                </h2>

                                <p>
                                    {editMode
                                        ? "Update category information."
                                        : "Create a new product category."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="category-modal-close"
                                onClick={closeForm}
                                disabled={submitting}
                                aria-label="Close modal"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form
                            className="category-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="category-form-group">
                                <label htmlFor="category-name">
                                    Category Name
                                </label>

                                <input
                                    id="category-name"
                                    type="text"
                                    name="name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="e.g. Sweatshirts"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="category-form-group">
                                <label htmlFor="category-image">
                                    Image URL
                                </label>

                                <input
                                    id="category-image"
                                    type="url"
                                    name="image_url"
                                    value={
                                        formData.image_url
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="https://..."
                                />
                            </div>

                            {formData.image_url && (
                                <div className="category-image-preview">
                                    <img
                                        src={
                                            formData.image_url
                                        }
                                        alt="Category preview"
                                        onError={(
                                            event
                                        ) => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                </div>
                            )}

                            <div className="category-form-actions">
                                <button
                                    type="button"
                                    className="category-cancel-button"
                                    onClick={closeForm}
                                    disabled={
                                        submitting
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="category-save-button"
                                    disabled={
                                        submitting
                                    }
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editMode
                                        ? "Update Category"
                                        : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCategories;