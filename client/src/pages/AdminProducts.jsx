import { useEffect, useState } from "react";
import "./AdminProducts.css";

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Product form
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);

    // Discount percentage for UI
    const [discountPercent, setDiscountPercent] = useState("");

    // Image manager
    const [showImageManager, setShowImageManager] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productImages, setProductImages] = useState([]);

    // Variant manager
    const [showVariantManager, setShowVariantManager] = useState(false);
    const [productVariants, setProductVariants] = useState([]);
    const [variantProduct, setVariantProduct] = useState(null);
    const [loadingVariants, setLoadingVariants] = useState(false);

    const [variantForm, setVariantForm] = useState({
        size: "",
        color: "",
        sku: "",
        stock: ""
    });

    const [editingVariantId, setEditingVariantId] = useState(null);
    const [variantSubmitting, setVariantSubmitting] = useState(false);

    // Image form
    const [imageLoading, setImageLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [imagePrimary, setImagePrimary] = useState(false);
    const [imageOrder, setImageOrder] = useState(0);

    // Product form data
    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        brand: "",
        material: "",
        price: "",
        discount_price: "",
        gender: "",
        description: "",
        is_featured: false,
        is_active: true
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // =========================
    // FETCH PRODUCTS
    // =========================

    async function fetchProducts() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("tokyo_trendz_token");

            if (!token) {
                throw new Error("Please log in as an admin.");
            }

            const response = await fetch(
                "/api/admin/products",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch products"
                );
            }

            setProducts(data.products || []);
        } catch (error) {
            console.error("Fetch products error:", error);
            setError(error.message || "Failed to fetch products");
        } finally {
            setLoading(false);
        }
    }

    // =========================
    // FETCH CATEGORIES
    // =========================

    async function fetchCategories() {
        try {
            const token = localStorage.getItem("tokyo_trendz_token");

            if (!token) {
                throw new Error("Please log in as an admin.");
            }

            const response = await fetch(
                "/api/admin/categories",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch categories"
                );
            }

            setCategories(data.categories || []);
        } catch (error) {
            console.error("Fetch categories error:", error);

            setCategories([]);

            setError(
                error.message || "Failed to fetch categories"
            );
        }
    }

    // =========================
    // GET CATEGORY NAME
    // =========================

    function getCategoryName(categoryId) {
        const category = categories.find(
            (item) =>
                Number(item.id) === Number(categoryId)
        );

        return category?.name || "Uncategorized";
    }

    // =========================
    // FORMAT PRICE
    // =========================

    function formatPrice(price) {
        return `₹${Number(price || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;
    }

    // =========================
    // CALCULATE DISCOUNT PRICE
    // =========================

    function calculateDiscountPrice(price, discount) {
        const numericPrice = Number(price);
        const numericDiscount = Number(discount);

        if (
            !numericPrice ||
            numericPrice <= 0 ||
            !Number.isFinite(numericDiscount) ||
            numericDiscount <= 0
        ) {
            return "";
        }

        const finalPrice =
            numericPrice -
            (numericPrice * numericDiscount) / 100;

        return Math.max(finalPrice, 0).toFixed(2);
    }

    // =========================
    // PRODUCT INPUT
    // =========================

    function handleInputChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => {
            const updatedForm = {
                ...previous,
                [name]:
                    type === "checkbox"
                        ? checked
                        : value
            };

            // If price changes, recalculate discounted price
            if (name === "price") {
                updatedForm.discount_price =
                    calculateDiscountPrice(
                        value,
                        discountPercent
                    );
            }

            return updatedForm;
        });
    }

    // =========================
    // DISCOUNT INPUT
    // =========================

    function handleDiscountChange(event) {
        let value = event.target.value;

        if (value === "") {
            setDiscountPercent("");
            setFormData((previous) => ({
                ...previous,
                discount_price: ""
            }));
            return;
        }

        let numericValue = Number(value);

        if (!Number.isFinite(numericValue)) {
            return;
        }

        // Keep discount between 0 and 100
        if (numericValue < 0) {
            numericValue = 0;
        }

        if (numericValue > 100) {
            numericValue = 100;
        }

        setDiscountPercent(String(numericValue));

        setFormData((previous) => ({
            ...previous,
            discount_price:
                numericValue === 0
                    ? ""
                    : calculateDiscountPrice(
                          previous.price,
                          numericValue
                      )
        }));
    }

    // =========================
    // ADD PRODUCT BUTTON
    // =========================

    function handleAddProduct() {
        setEditMode(false);
        setEditingProductId(null);

        setDiscountPercent("");

        setFormData({
            name: "",
            category_id: "",
            brand: "",
            material: "",
            price: "",
            discount_price: "",
            gender: "",
            description: "",
            is_featured: false,
            is_active: true
        });

        setShowForm(true);
    }

    // =========================
    // EDIT PRODUCT
    // =========================

    function openEditProduct(product) {
        setEditMode(true);
        setEditingProductId(product.id);

        const price = Number(product.price || 0);
        const discountPrice = Number(
            product.discount_price || 0
        );

        let calculatedDiscount = "";

        if (
            price > 0 &&
            discountPrice > 0 &&
            discountPrice < price
        ) {
            calculatedDiscount = (
                ((price - discountPrice) / price) *
                100
            ).toFixed(2);
        }

        setDiscountPercent(calculatedDiscount);

        setFormData({
            name: product.name || "",
            category_id: product.category_id || "",
            brand: product.brand || "",
            material: product.material || "",
            price: product.price || "",
            discount_price:
                product.discount_price || "",
            gender: product.gender || "",
            description: product.description || "",
            is_featured: Boolean(product.is_featured),
            is_active: Boolean(product.is_active)
        });

        setShowForm(true);
    }

    // =========================
    // CANCEL PRODUCT FORM
    // =========================

    function handleCancelForm() {
        setShowForm(false);
        setEditMode(false);
        setEditingProductId(null);
        setDiscountPercent("");

        setFormData({
            name: "",
            category_id: "",
            brand: "",
            material: "",
            price: "",
            discount_price: "",
            gender: "",
            description: "",
            is_featured: false,
            is_active: true
        });
    }

    // =========================
    // SUBMIT PRODUCT
    // =========================

    async function handleSubmit(event) {
        event.preventDefault();

        const isEditing = Boolean(
            editMode && editingProductId
        );

        if (!formData.category_id) {
            alert("Please select a category.");
            return;
        }

        if (
            !formData.price ||
            Number(formData.price) <= 0
        ) {
            alert("Please enter a valid product price.");
            return;
        }

        if (
            discountPercent !== "" &&
            (Number(discountPercent) < 0 ||
                Number(discountPercent) > 100)
        ) {
            alert(
                "Discount percentage must be between 0% and 100%."
            );
            return;
        }

        try {
            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Please log in as an admin."
                );
            }

            const url = isEditing
                ? `/api/admin/products/${editingProductId}`
                : "/api/admin/products";

            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,

                    // Send actual category ID to backend
                    category_id: Number(
                        formData.category_id
                    ),

                    brand: formData.brand,
                    material: formData.material,
                    price: Number(formData.price),

                    // Backend still receives discounted final price
                    discount_price:
                        formData.discount_price === ""
                            ? null
                            : Number(
                                  formData.discount_price
                              ),

                    gender: formData.gender,
                    description: formData.description,
                    is_featured:
                        formData.is_featured,
                    is_active: formData.is_active
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        (isEditing
                            ? "Failed to update product"
                            : "Failed to create product")
                );
            }

            alert(
                isEditing
                    ? "Product updated successfully"
                    : "Product created successfully"
            );

            handleCancelForm();
            await fetchProducts();
        } catch (error) {
            console.error(
                "Submit product error:",
                error
            );

            alert(
                error.message ||
                    (isEditing
                        ? "Failed to update product"
                        : "Failed to create product")
            );
        }
    }

    // =========================
    // DELETE PRODUCT
    // =========================

    async function handleDeleteProduct(productId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
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
                    "Please log in as an admin."
                );
            }

            const response = await fetch(
                `/api/admin/products/${productId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to delete product"
                );
            }

            alert(
                "Product deleted successfully"
            );

            await fetchProducts();
        } catch (error) {
            console.error(
                "Delete product error:",
                error
            );

            alert(
                error.message ||
                    "Failed to delete product"
            );
        }
    }

    // =========================================================
    // IMAGE MANAGER
    // =========================================================

    async function fetchProductImages(productId) {
        try {
            setImageLoading(true);

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Please log in as an admin."
                );
            }

            const response = await fetch(
                `/api/admin/product-images/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to fetch product images"
                );
            }

            setProductImages(data.images || []);
        } catch (error) {
            console.error(
                "Fetch product images error:",
                error
            );

            alert(
                error.message ||
                    "Failed to fetch product images"
            );
        } finally {
            setImageLoading(false);
        }
    }

    async function openImageManager(product) {
        setSelectedProduct(product);
        setShowImageManager(true);
        setProductImages([]);

        setImageUrl("");
        setImagePrimary(false);
        setImageOrder(0);

        await fetchProductImages(product.id);
    }

    async function handleAddImage(event) {
        event.preventDefault();

        try {
            if (!selectedProduct) {
                return;
            }

            if (!imageUrl.trim()) {
                alert(
                    "Please enter an image URL."
                );
                return;
            }

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Please log in as an admin."
                );
            }

            const response = await fetch(
                "/api/admin/product-images",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        product_id:
                            selectedProduct.id,
                        image_url:
                            imageUrl.trim(),
                        is_primary:
                            imagePrimary,
                        display_order:
                            Number(imageOrder) || 0
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to add product image"
                );
            }

            alert(
                "Product image added successfully"
            );

            setImageUrl("");
            setImagePrimary(false);
            setImageOrder(0);

            await fetchProductImages(
                selectedProduct.id
            );

            await fetchProducts();
        } catch (error) {
            console.error(
                "Add product image error:",
                error
            );

            alert(
                error.message ||
                    "Failed to add product image"
            );
        }
    }

    async function handleDeleteImage(imageId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this image?"
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
                    "Please log in as an admin."
                );
            }

            const response = await fetch(
                `/api/admin/product-images/${imageId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to delete image"
                );
            }

            alert(
                "Product image deleted successfully"
            );

            if (selectedProduct) {
                await fetchProductImages(
                    selectedProduct.id
                );

                await fetchProducts();
            }
        } catch (error) {
            console.error(
                "Delete product image error:",
                error
            );

            alert(
                error.message ||
                    "Failed to delete product image"
            );
        }
    }

    async function handleSetPrimaryImage(
        imageId
    ) {
        try {
            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Please log in as an admin."
                );
            }

            const response = await fetch(
                `/api/admin/product-images/${imageId}/primary`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to set primary image"
                );
            }

            alert(
                "Primary image updated successfully"
            );

            if (selectedProduct) {
                await fetchProductImages(
                    selectedProduct.id
                );

                await fetchProducts();
            }
        } catch (error) {
            console.error(
                "Set primary image error:",
                error
            );

            alert(
                error.message ||
                    "Failed to set primary image"
            );
        }
    }

    async function handleUpdateImageOrder(
        image
    ) {
        try {
            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Please log in as an admin."
                );
            }

            const response = await fetch(
                `/api/admin/product-images/${image.id}/order`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        display_order:
                            Number(
                                image.display_order
                            ) || 0
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update image order"
                );
            }

            await fetchProductImages(
                selectedProduct.id
            );
        } catch (error) {
            console.error(
                "Update image order error:",
                error
            );

            alert(
                error.message ||
                    "Failed to update image order"
            );
        }
    }

    function closeImageManager() {
        setShowImageManager(false);
        setSelectedProduct(null);
        setProductImages([]);

        setImageUrl("");
        setImagePrimary(false);
        setImageOrder(0);
    }

    // =========================================================
    // VARIANT MANAGER
    // =========================================================

    async function fetchProductVariants(
        productId
    ) {
        try {
            setLoadingVariants(true);

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Please log in as an admin."
                );
            }

            const response = await fetch(
                `/api/admin/variants/product/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to fetch product variants"
                );
            }

            setProductVariants(
                data.variants || []
            );
        } catch (error) {
            console.error(
                "Fetch product variants error:",
                error
            );

            alert(
                error.message ||
                    "Failed to fetch product variants"
            );
        } finally {
            setLoadingVariants(false);
        }
    }

    async function openVariantManager(
        product
    ) {
        setVariantProduct(product);
        setShowVariantManager(true);
        setProductVariants([]);

        resetVariantForm();

        await fetchProductVariants(product.id);
    }

    function resetVariantForm() {
        setVariantForm({
            size: "",
            color: "",
            sku: "",
            stock: ""
        });

        setEditingVariantId(null);
    }

    function handleVariantInputChange(event) {
        const { name, value } = event.target;

        setVariantForm((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    function handleEditVariant(variant) {
        setEditingVariantId(variant.id);

        setVariantForm({
            size: variant.size || "",
            color: variant.color || "",
            sku: variant.sku || "",
            stock:
                variant.stock === null ||
                variant.stock === undefined
                    ? ""
                    : String(variant.stock)
        });
    }

    async function handleSubmitVariant(
        event
    ) {
        event.preventDefault();

        if (!variantProduct) {
            return;
        }

        if (
            !variantForm.size.trim() ||
            !variantForm.color.trim() ||
            !variantForm.sku.trim()
        ) {
            alert(
                "Size, color and SKU are required."
            );
            return;
        }

        if (
            variantForm.stock === "" ||
            Number.isNaN(
                Number(variantForm.stock)
            ) ||
            Number(variantForm.stock) < 0
        ) {
            alert(
                "Stock must be a valid non-negative number."
            );
            return;
        }

        try {
            setVariantSubmitting(true);

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            if (!token) {
                throw new Error(
                    "Please log in as an admin."
                );
            }

            const isEditing = Boolean(
                editingVariantId
            );

            const url = isEditing
                ? `/api/admin/variants/${editingVariantId}`
                : "/api/admin/variants";

            const method = isEditing
                ? "PUT"
                : "POST";

            const body = isEditing
                ? {
                      size: variantForm.size.trim(),
                      color: variantForm.color.trim(),
                      sku: variantForm.sku.trim(),
                      stock: Number(
                          variantForm.stock
                      )
                  }
                : {
                      product_id:
                          variantProduct.id,
                      size: variantForm.size.trim(),
                      color: variantForm.color.trim(),
                      sku: variantForm.sku.trim(),
                      stock: Number(
                          variantForm.stock
                      )
                  };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        (isEditing
                            ? "Failed to update variant"
                            : "Failed to add variant")
                );
            }

            alert(
                isEditing
                    ? "Product variant updated successfully"
                    : "Product variant added successfully"
            );

            resetVariantForm();

            await fetchProductVariants(
                variantProduct.id
            );

            await fetchProducts();
        } catch (error) {
            console.error(
                "Submit product variant error:",
                error
            );

            alert(
                error.message ||
                    "Failed to save product variant"
            );
        } finally {
            setVariantSubmitting(false);
        }
    }

    async function handleDeleteVariant(
        variantId
    ) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this variant?"
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
                    "Please log in as an admin."
                );
            }

            const response = await fetch(
                `/api/admin/variants/${variantId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to delete variant"
                );
            }

            alert(
                "Product variant deleted successfully"
            );

            if (
                editingVariantId === variantId
            ) {
                resetVariantForm();
            }

            if (variantProduct) {
                await fetchProductVariants(
                    variantProduct.id
                );

                await fetchProducts();
            }
        } catch (error) {
            console.error(
                "Delete product variant error:",
                error
            );

            alert(
                error.message ||
                    "Failed to delete variant"
            );
        }
    }

    function closeVariantManager() {
        setShowVariantManager(false);
        setVariantProduct(null);
        setProductVariants([]);

        resetVariantForm();
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="admin-products-page">
            <div className="admin-products-header">
                <div>
                    <h1>Products</h1>
                    <p>
                        Manage your Tokyo Trendz
                        products
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-add-product-btn"
                    onClick={handleAddProduct}
                >
                    + Add Product
                </button>
            </div>

            {/* PRODUCT FORM */}

            {showForm && (
                <div className="admin-product-form-container">
                    <div className="admin-product-form-header">
                        <h2>
                            {editMode
                                ? "Edit Product"
                                : "Add Product"}
                        </h2>

                        <button
                            type="button"
                            onClick={
                                handleCancelForm
                            }
                        >
                            ✕
                        </button>
                    </div>

                    <form
                        className="admin-product-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="admin-product-form-grid">
                            {/* PRODUCT NAME */}

                            <div className="admin-product-form-group">
                                <label>
                                    Product Name *
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
                                    placeholder="Tokyo Essential Oversized Tee"
                                    required
                                />
                            </div>

                            {/* CATEGORY */}

                            <div className="admin-product-form-group">
                                <label>
                                    Category *
                                </label>

                                <select
                                    name="category_id"
                                    value={
                                        formData.category_id
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                >
                                    <option value="">
                                        Select Category
                                    </option>

                                    {categories.map(
                                        (category) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                {categories.length ===
                                    0 && (
                                    <small
                                        style={{
                                            color:
                                                "#999",
                                            marginTop:
                                                "6px",
                                            display:
                                                "block"
                                        }}
                                    >
                                        No categories
                                        available.
                                        Create a
                                        category first.
                                    </small>
                                )}
                            </div>

                            {/* BRAND */}

                            <div className="admin-product-form-group">
                                <label>
                                    Brand
                                </label>

                                <input
                                    type="text"
                                    name="brand"
                                    value={
                                        formData.brand
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Tokyo Trendz"
                                />
                            </div>

                            {/* MATERIAL */}

                            <div className="admin-product-form-group">
                                <label>
                                    Material
                                </label>

                                <input
                                    type="text"
                                    name="material"
                                    value={
                                        formData.material
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Cotton"
                                />
                            </div>

                            {/* PRICE */}

                            <div className="admin-product-form-group">
                                <label>
                                    Price *
                                </label>

                                <input
                                    type="number"
                                    name="price"
                                    value={
                                        formData.price
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    min="0"
                                    step="0.01"
                                    placeholder="1999"
                                    required
                                />
                            </div>

                            {/* DISCOUNT PERCENTAGE */}

                            <div className="admin-product-form-group">
                                <label>
                                    Discount (%)
                                </label>

                                <input
                                    type="number"
                                    value={
                                        discountPercent
                                    }
                                    onChange={
                                        handleDiscountChange
                                    }
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="20"
                                />

                                <small
                                    style={{
                                        color:
                                            "#999",
                                        marginTop:
                                            "6px",
                                        display:
                                            "block"
                                    }}
                                >
                                    Enter discount
                                    percentage,
                                    e.g. 20%
                                </small>
                            </div>

                            {/* FINAL PRICE */}

                            <div className="admin-product-form-group">
                                <label>
                                    Final Price
                                </label>

                                <input
                                    type="text"
                                    value={
                                        formData.discount_price
                                            ? formatPrice(
                                                  formData.discount_price
                                              )
                                            : formData.price
                                            ? formatPrice(
                                                  formData.price
                                              )
                                            : "₹0.00"
                                    }
                                    readOnly
                                    style={{
                                        opacity: 0.8,
                                        cursor: "not-allowed"
                                    }}
                                />

                                {discountPercent !==
                                    "" &&
                                    formData.discount_price !==
                                        "" && (
                                        <small
                                            style={{
                                                color:
                                                    "#aaa",
                                                marginTop:
                                                    "6px",
                                                display:
                                                    "block"
                                            }}
                                        >
                                            Customer pays{" "}
                                            <strong
                                                style={{
                                                    color:
                                                        "#ff3b3b"
                                                }}
                                            >
                                                {formatPrice(
                                                    formData.discount_price
                                                )}
                                            </strong>
                                        </small>
                                    )}
                            </div>

                            {/* GENDER */}

                            <div className="admin-product-form-group">
                                <label>
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    value={
                                        formData.gender
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                >
                                    <option value="">
                                        Select Gender
                                    </option>

                                    <option value="Men">
                                        Men
                                    </option>

                                    <option value="Women">
                                        Women
                                    </option>

                                    <option value="Unisex">
                                        Unisex
                                    </option>
                                </select>
                            </div>

                            {/* FEATURED */}

                            <div className="admin-product-form-group">
                                <label>
                                    Featured
                                </label>

                                <label className="admin-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="is_featured"
                                        checked={
                                            formData.is_featured
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                    />

                                    Featured Product
                                </label>
                            </div>

                            {/* ACTIVE */}

                            <div className="admin-product-form-group">
                                <label>
                                    Active
                                </label>

                                <label className="admin-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={
                                            formData.is_active
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                    />

                                    Active Product
                                </label>
                            </div>
                        </div>

                        {/* DESCRIPTION */}

                        <div className="admin-product-form-group">
                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    formData.description
                                }
                                onChange={
                                    handleInputChange
                                }
                                rows="5"
                                placeholder="Describe the product..."
                            />
                        </div>

                        {/* ACTIONS */}

                        <div className="admin-product-form-actions">
                            <button
                                type="submit"
                                className="admin-save-product-btn"
                            >
                                {editMode
                                    ? "Update Product"
                                    : "Create Product"}
                            </button>

                            <button
                                type="button"
                                className="admin-cancel-product-btn"
                                onClick={
                                    handleCancelForm
                                }
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ERROR */}

            {error && (
                <div className="admin-products-error">
                    {error}
                </div>
            )}

            {/* LOADING */}

            {loading ? (
                <div className="admin-products-loading">
                    Loading products...
                </div>
            ) : (
                <div className="admin-products-table-wrapper">
                    <table className="admin-products-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.length ===
                            0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        style={{
                                            textAlign:
                                                "center"
                                        }}
                                    >
                                        No products
                                        found.
                                    </td>
                                </tr>
                            ) : (
                                products.map(
                                    (product) => (
                                        <tr
                                            key={
                                                product.id
                                            }
                                        >
                                            <td>
                                                #
                                                {
                                                    product.id
                                                }
                                            </td>

                                            <td>
                                                {product.image_url ? (
                                                    <img
                                                        src={
                                                            product.image_url
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                        className="admin-product-table-image"
                                                    />
                                                ) : (
                                                    <div>
                                                        No
                                                        Image
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        product.name
                                                    }
                                                </strong>

                                                {product.brand && (
                                                    <small>
                                                        {
                                                            product.brand
                                                        }
                                                    </small>
                                                )}
                                            </td>

                                            <td>
                                                {product.category_name ||
                                                    getCategoryName(
                                                        product.category_id
                                                    ) ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {formatPrice(
                                                    product.price
                                                )}

                                                {product.discount_price &&
                                                    Number(
                                                        product.discount_price
                                                    ) <
                                                        Number(
                                                            product.price
                                                        ) && (
                                                        <small
                                                            style={{
                                                                display:
                                                                    "block",
                                                                marginTop:
                                                                    "4px",
                                                                color:
                                                                    "#ff3b3b"
                                                            }}
                                                        >
                                                            Sale{" "}
                                                            {formatPrice(
                                                                product.discount_price
                                                            )}
                                                        </small>
                                                    )}
                                            </td>

                                            <td>
                                                {product.total_stock ??
                                                    0}
                                            </td>

                                            <td>
                                                {product.is_active ? (
                                                    <span className="admin-status-active">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="admin-status-inactive">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                <div className="admin-product-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditProduct(
                                                                product
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                        Product
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openImageManager(
                                                                product
                                                            )
                                                        }
                                                    >
                                                        Manage
                                                        Images
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteProduct(
                                                                product.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                        Product
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openVariantManager(
                                                                product
                                                            )
                                                        }
                                                    >
                                                        Manage
                                                        Variants
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* =====================================================
                IMAGE MANAGER MODAL
            ===================================================== */}

            {showImageManager &&
                selectedProduct && (
                    <div
                        className="admin-image-modal-overlay"
                        onClick={
                            closeImageManager
                        }
                    >
                        <div
                            className="admin-image-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="admin-image-modal-header">
                                <div>
                                    <h2>
                                        Manage Images
                                    </h2>

                                    <p>
                                        {
                                            selectedProduct.name
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeImageManager
                                    }
                                >
                                    ✕
                                </button>
                            </div>

                            {/* ADD IMAGE */}

                            <form
                                className="admin-image-form"
                                onSubmit={
                                    handleAddImage
                                }
                            >
                                <div>
                                    <label>
                                        Image URL
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            imageUrl
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setImageUrl(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="https://..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label>
                                        Display Order
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            imageOrder
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setImageOrder(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </div>

                                <label>
                                    <input
                                        type="checkbox"
                                        checked={
                                            imagePrimary
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setImagePrimary(
                                                event
                                                    .target
                                                    .checked
                                            )
                                        }
                                    />

                                    Set as primary
                                </label>

                                <button type="submit">
                                    Add Image
                                </button>
                            </form>

                            {/* IMAGE LIST */}

                            <div className="admin-image-list">
                                {imageLoading ? (
                                    <p>
                                        Loading
                                        images...
                                    </p>
                                ) : productImages.length ===
                                  0 ? (
                                    <p>
                                        No images
                                        found.
                                    </p>
                                ) : (
                                    <div className="admin-image-grid">
                                        {productImages.map(
                                            (
                                                image
                                            ) => (
                                                <div
                                                    className="admin-image-card"
                                                    key={
                                                        image.id
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            image.image_url
                                                        }
                                                        alt={`${selectedProduct.name} ${image.id}`}
                                                    />

                                                    <div>
                                                        <strong>
                                                            Image
                                                            #
                                                            {
                                                                image.id
                                                            }
                                                        </strong>

                                                        {image.is_primary ? (
                                                            <span>
                                                                Primary
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleSetPrimaryImage(
                                                                        image.id
                                                                    )
                                                                }
                                                            >
                                                                Set
                                                                Primary
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label>
                                                            Order
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                image.display_order ??
                                                                0
                                                            }
                                                            onChange={(
                                                                event
                                                            ) => {
                                                                const value =
                                                                    event
                                                                        .target
                                                                        .value;

                                                                setProductImages(
                                                                    (
                                                                        previous
                                                                    ) =>
                                                                        previous.map(
                                                                            (
                                                                                item
                                                                            ) =>
                                                                                item.id ===
                                                                                image.id
                                                                                    ? {
                                                                                          ...item,
                                                                                          display_order:
                                                                                              value
                                                                                      }
                                                                                    : item
                                                                        )
                                                                );
                                                            }}
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleUpdateImageOrder(
                                                                    image
                                                                )
                                                            }
                                                        >
                                                            Save
                                                            Order
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteImage(
                                                                image.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                        Image
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="admin-image-modal-footer">
                                <button
                                    type="button"
                                    onClick={
                                        closeImageManager
                                    }
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* =====================================================
                VARIANT MANAGER MODAL
            ===================================================== */}

            {showVariantManager &&
                variantProduct && (
                    <div
                        className="admin-image-modal-overlay"
                        onClick={
                            closeVariantManager
                        }
                    >
                        <div
                            className="admin-image-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                            style={{
                                maxWidth:
                                    "1000px",
                                width: "95%"
                            }}
                        >
                            {/* HEADER */}

                            <div className="admin-image-modal-header">
                                <div>
                                    <h2>
                                        Manage
                                        Variants
                                    </h2>

                                    <p>
                                        {
                                            variantProduct.name
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeVariantManager
                                    }
                                >
                                    ✕
                                </button>
                            </div>

                            {/* VARIANT FORM */}

                            <form
                                className="admin-image-form"
                                onSubmit={
                                    handleSubmitVariant
                                }
                            >
                                <div>
                                    <label>
                                        Size
                                    </label>

                                    <input
                                        type="text"
                                        name="size"
                                        value={
                                            variantForm.size
                                        }
                                        onChange={
                                            handleVariantInputChange
                                        }
                                        placeholder="S / M / L / XL"
                                        required
                                    />
                                </div>

                                <div>
                                    <label>
                                        Color
                                    </label>

                                    <input
                                        type="text"
                                        name="color"
                                        value={
                                            variantForm.color
                                        }
                                        onChange={
                                            handleVariantInputChange
                                        }
                                        placeholder="Black"
                                        required
                                    />
                                </div>

                                <div>
                                    <label>
                                        SKU
                                    </label>

                                    <input
                                        type="text"
                                        name="sku"
                                        value={
                                            variantForm.sku
                                        }
                                        onChange={
                                            handleVariantInputChange
                                        }
                                        placeholder="TT-TEE-001-BLK-S"
                                        required
                                    />
                                </div>

                                <div>
                                    <label>
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        name="stock"
                                        value={
                                            variantForm.stock
                                        }
                                        onChange={
                                            handleVariantInputChange
                                        }
                                        min="0"
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        variantSubmitting
                                    }
                                >
                                    {variantSubmitting
                                        ? "Saving..."
                                        : editingVariantId
                                        ? "Update Variant"
                                        : "Add Variant"}
                                </button>

                                {editingVariantId && (
                                    <button
                                        type="button"
                                        onClick={
                                            resetVariantForm
                                        }
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </form>

                            {/* VARIANT LIST */}

                            <div className="admin-image-list">
                                <h3>
                                    Product
                                    Variants (
                                    {
                                        productVariants.length
                                    }
                                    )
                                </h3>

                                {loadingVariants ? (
                                    <p>
                                        Loading
                                        variants...
                                    </p>
                                ) : productVariants.length ===
                                  0 ? (
                                    <p>
                                        No variants
                                        found.
                                    </p>
                                ) : (
                                    <div
                                        style={{
                                            overflowX:
                                                "auto"
                                        }}
                                    >
                                        <table
                                            style={{
                                                width:
                                                    "100%",
                                                borderCollapse:
                                                    "collapse",
                                                marginTop:
                                                    "15px"
                                            }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th
                                                        style={{
                                                            padding:
                                                                "12px",
                                                            textAlign:
                                                                "left"
                                                        }}
                                                    >
                                                        ID
                                                    </th>

                                                    <th
                                                        style={{
                                                            padding:
                                                                "12px",
                                                            textAlign:
                                                                "left"
                                                        }}
                                                    >
                                                        Size
                                                    </th>

                                                    <th
                                                        style={{
                                                            padding:
                                                                "12px",
                                                            textAlign:
                                                                "left"
                                                        }}
                                                    >
                                                        Color
                                                    </th>

                                                    <th
                                                        style={{
                                                            padding:
                                                                "12px",
                                                            textAlign:
                                                                "left"
                                                        }}
                                                    >
                                                        SKU
                                                    </th>

                                                    <th
                                                        style={{
                                                            padding:
                                                                "12px",
                                                            textAlign:
                                                                "left"
                                                        }}
                                                    >
                                                        Stock
                                                    </th>

                                                    <th
                                                        style={{
                                                            padding:
                                                                "12px",
                                                            textAlign:
                                                                "left"
                                                        }}
                                                    >
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {productVariants.map(
                                                    (
                                                        variant
                                                    ) => (
                                                        <tr
                                                            key={
                                                                variant.id
                                                            }
                                                        >
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                #
                                                                {
                                                                    variant.id
                                                                }
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                {
                                                                    variant.size
                                                                }
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                {
                                                                    variant.color
                                                                }
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                {
                                                                    variant.sku
                                                                }
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                {
                                                                    variant.stock
                                                                }
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "12px"
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        gap: "8px",
                                                                        flexWrap:
                                                                            "wrap"
                                                                    }}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleEditVariant(
                                                                                variant
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeleteVariant(
                                                                                variant.id
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
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

                            {/* FOOTER */}

                            <div className="admin-image-modal-footer">
                                <button
                                    type="button"
                                    onClick={
                                        closeVariantManager
                                    }
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default AdminProducts;