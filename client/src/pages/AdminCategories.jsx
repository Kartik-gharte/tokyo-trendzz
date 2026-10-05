import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    FolderOpen,
    X
} from "lucide-react";

import "./AdminCategories.css";

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

            const response = await fetch(
                "http://localhost:5000/api/admin/categories",
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

    function openAddForm() {
        setEditMode(false);
        setEditingCategoryId(null);

        setFormData({
            name: "",
            image_url: ""
        });

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
        if (submitting) return;

        setShowForm(false);
        setEditMode(false);
        setEditingCategoryId(null);

        setFormData({
            name: "",
            image_url: ""
        });
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

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Authentication token is missing."
                );
            }

            const url = editMode
                ? `http://localhost:5000/api/admin/categories/${editingCategoryId}`
                : "http://localhost:5000/api/admin/categories";

            const method = editMode ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
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

            closeForm();
            fetchCategories();
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
        if (
            !window.confirm(
                `Are you sure you want to delete "${category.name}"?`
            )
        ) {
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
                `http://localhost:5000/api/admin/categories/${category.id}`,
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

            fetchCategories();
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

    const filteredCategories = categories.filter(
        (category) =>
            category.name
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            category.slug
                ?.toLowerCase()
                .includes(search.toLowerCase())
    );

    return (
        <div className="admin-categories">
            <div className="admin-categories-header">
                <div>
                    <h1>Categories</h1>
                    <p>
                        Manage product categories for
                        Tokyo Trendz.
                    </p>
                </div>

                <button
                    className="add-category-button"
                    onClick={openAddForm}
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            <div className="categories-toolbar">
                <div className="categories-count">
                    <FolderOpen size={18} />

                    <span>
                        {filteredCategories.length}{" "}
                        categor
                        {filteredCategories.length === 1
                            ? "y"
                            : "ies"}
                    </span>
                </div>

                <div className="category-search">
                    <Search size={18} />

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

            {loading ? (
                <div className="categories-state">
                    <div className="categories-spinner"></div>
                    <p>Loading categories...</p>
                </div>
            ) : error ? (
                <div className="categories-state error">
                    <p>{error}</p>

                    <button onClick={fetchCategories}>
                        Try Again
                    </button>
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="categories-state">
                    <FolderOpen size={40} />
                    <p>
                        {search
                            ? "No categories found."
                            : "No categories available."}
                    </p>
                </div>
            ) : (
                <div className="categories-grid">
                    {filteredCategories.map(
                        (category) => (
                            <div
                                className="category-card"
                                key={category.id}
                            >
                                <div className="category-image">
                                    {category.image_url ? (
                                        <img
                                            src={
                                                category.image_url
                                            }
                                            alt={
                                                category.name
                                            }
                                        />
                                    ) : (
                                        <FolderOpen
                                            size={35}
                                        />
                                    )}
                                </div>

                                <div className="category-card-content">
                                    <div>
                                        <h3>
                                            {
                                                category.name
                                            }
                                        </h3>

                                        <span>
                                            /{category.slug}
                                        </span>
                                    </div>

                                    <div className="category-product-count">
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
                                            className="edit-category-button"
                                            onClick={() =>
                                                openEditForm(
                                                    category
                                                )
                                            }
                                        >
                                            <Pencil
                                                size={16}
                                            />
                                            Edit
                                        </button>

                                        <button
                                            className="delete-category-button"
                                            onClick={() =>
                                                handleDelete(
                                                    category
                                                )
                                            }
                                        >
                                            <Trash2
                                                size={16}
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

            {showForm && (
                <div className="category-modal-overlay">
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
                                className="category-modal-close"
                                onClick={closeForm}
                                disabled={submitting}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            className="category-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="category-form-group">
                                <label>
                                    Category Name
                                </label>

                                <input
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
                                />
                            </div>

                            <div className="category-form-group">
                                <label>
                                    Image URL
                                </label>

                                <input
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
                                        alt="Preview"
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
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="category-save-button"
                                    disabled={submitting}
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