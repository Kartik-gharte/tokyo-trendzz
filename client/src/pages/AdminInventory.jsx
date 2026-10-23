import { useEffect, useState } from "react";
import {
    Search,
    Package,
    Boxes,
    AlertTriangle,
    XCircle,
    RefreshCw,
    Pencil,
    Warehouse
} from "lucide-react";

import "./AdminInventory.css";

function AdminInventory() {
    const [inventory, setInventory] = useState([]);

    const [stats, setStats] = useState({
        total_variants: 0,
        total_stock: 0,
        out_of_stock: 0,
        low_stock: 0
    });

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("tokyo_trendz_token");

    // ==========================================
    // FETCH INVENTORY
    // ==========================================
    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError("");

            const [inventoryResponse, statsResponse] =
                await Promise.all([
                    fetch(
                        "/api/admin/inventory",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    ),

                    fetch(
                        "/api/admin/inventory/stats",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )
                ]);

            const inventoryData =
                await inventoryResponse.json();

            const statsData =
                await statsResponse.json();

            if (!inventoryData.success) {
                throw new Error(
                    inventoryData.message ||
                    "Failed to fetch inventory"
                );
            }

            if (!statsData.success) {
                throw new Error(
                    statsData.message ||
                    "Failed to fetch inventory stats"
                );
            }

            setInventory(inventoryData.inventory || []);
            setStats(statsData.stats || {});

        } catch (error) {
            console.error(
                "Inventory fetch error:",
                error
            );

            setError(
                error.message ||
                "Failed to load inventory"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // ==========================================
    // FILTER INVENTORY
    // ==========================================
    const filteredInventory = inventory.filter((item) => {
        const searchText = search
            .trim()
            .toLowerCase();

        if (!searchText) {
            return true;
        }

        return (
            item.product_name
                ?.toLowerCase()
                .includes(searchText) ||

            item.sku
                ?.toLowerCase()
                .includes(searchText) ||

            item.size
                ?.toLowerCase()
                .includes(searchText) ||

            item.color
                ?.toLowerCase()
                .includes(searchText)
        );
    });

    // ==========================================
    // STOCK STATUS
    // ==========================================
    const getStockClass = (stock) => {
        if (Number(stock) === 0) {
            return "stock-out";
        }

        if (Number(stock) <= 5) {
            return "stock-low";
        }

        return "stock-good";
    };

    const getStockLabel = (stock) => {
        if (Number(stock) === 0) {
            return "Out of Stock";
        }

        if (Number(stock) <= 5) {
            return "Low Stock";
        }

        return "In Stock";
    };

    // ==========================================
    // UPDATE STOCK
    // ==========================================
    const handleStockUpdate = async (
        variantId,
        currentStock
    ) => {
        const newStock = window.prompt(
            "Enter new stock quantity:",
            currentStock
        );

        if (newStock === null) {
            return;
        }

        if (
            newStock.trim() === "" ||
            !/^\d+$/.test(newStock)
        ) {
            alert(
                "Please enter a valid non-negative integer."
            );
            return;
        }

        try {
            const response = await fetch(
                `/api/admin/inventory/${variantId}/stock`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        stock: Number(newStock)
                    })
                }
            );

            const data = await response.json();

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Failed to update stock"
                );
            }

            alert(
                "Stock updated successfully."
            );

            fetchInventory();

        } catch (error) {
            console.error(
                "Stock update error:",
                error
            );

            alert(
                error.message ||
                "Failed to update stock"
            );
        }
    };

    return (
        <div className="admin-inventory">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="inventory-header">

                <div className="inventory-header-content">

                    <div className="inventory-title-icon">
                        <Warehouse size={24} />
                    </div>

                    <div>
                        <div className="inventory-eyebrow">
                            TOKYO TRENDZ / STOCK CONTROL
                        </div>

                        <h1>
                            Inventory Management
                        </h1>

                        <p>
                            Monitor and manage product
                            variant stock.
                        </p>
                    </div>

                </div>

                <button
                    className="inventory-refresh-btn"
                    onClick={fetchInventory}
                    disabled={loading}
                >
                    <RefreshCw
                        size={16}
                        className={
                            loading
                                ? "inventory-refresh-spinning"
                                : ""
                        }
                    />

                    {loading
                        ? "Refreshing..."
                        : "Refresh Inventory"}
                </button>

            </div>


            {/* ==========================================
                STATISTICS
            ========================================== */}

            <div className="inventory-stats">

                <div className="inventory-stat-card">

                    <div className="inventory-stat-top">

                        <div className="inventory-stat-icon">
                            <Boxes size={21} />
                        </div>

                        <span className="inventory-stat-label">
                            VARIANTS
                        </span>

                    </div>

                    <strong>
                        {stats.total_variants || 0}
                    </strong>

                    <p>
                        Total product variants
                    </p>

                </div>


                <div className="inventory-stat-card">

                    <div className="inventory-stat-top">

                        <div className="inventory-stat-icon">
                            <Package size={21} />
                        </div>

                        <span className="inventory-stat-label">
                            AVAILABLE
                        </span>

                    </div>

                    <strong>
                        {stats.total_stock || 0}
                    </strong>

                    <p>
                        Units currently in stock
                    </p>

                </div>


                <div className="inventory-stat-card inventory-stat-warning">

                    <div className="inventory-stat-top">

                        <div className="inventory-stat-icon">
                            <AlertTriangle size={21} />
                        </div>

                        <span className="inventory-stat-label">
                            LOW STOCK
                        </span>

                    </div>

                    <strong>
                        {stats.low_stock || 0}
                    </strong>

                    <p>
                        Variants needing attention
                    </p>

                </div>


                <div className="inventory-stat-card inventory-stat-danger">

                    <div className="inventory-stat-top">

                        <div className="inventory-stat-icon">
                            <XCircle size={21} />
                        </div>

                        <span className="inventory-stat-label">
                            OUT OF STOCK
                        </span>

                    </div>

                    <strong>
                        {stats.out_of_stock || 0}
                    </strong>

                    <p>
                        Variants unavailable
                    </p>

                </div>

            </div>


            {/* ==========================================
                TOOLBAR
            ========================================== */}

            <div className="inventory-toolbar">

                <div className="inventory-toolbar-left">

                    <div className="inventory-section-icon">
                        <Package size={18} />
                    </div>

                    <div>
                        <h2>
                            Stock Overview
                        </h2>

                        <span>
                            {filteredInventory.length} of{" "}
                            {inventory.length} variants
                        </span>
                    </div>

                </div>


                <div className="inventory-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search product, SKU, size or color..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                    {search && (
                        <button
                            className="inventory-search-clear"
                            onClick={() =>
                                setSearch("")
                            }
                            type="button"
                            title="Clear search"
                        >
                            <X size={15} />
                        </button>
                    )}

                </div>

            </div>


            {/* ==========================================
                LOADING
            ========================================== */}

            {loading && (

                <div className="inventory-state">

                    <div className="inventory-state-icon">
                        <Package size={30} />
                    </div>

                    <h3>
                        Loading inventory
                    </h3>

                    <p>
                        Fetching the latest stock information...
                    </p>

                </div>

            )}


            {/* ==========================================
                ERROR
            ========================================== */}

            {!loading && error && (

                <div className="inventory-state inventory-state-error">

                    <div className="inventory-state-icon">
                        <XCircle size={30} />
                    </div>

                    <h3>
                        Unable to load inventory
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={fetchInventory}
                        className="inventory-state-btn"
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* ==========================================
                EMPTY
            ========================================== */}

            {!loading &&
                !error &&
                filteredInventory.length === 0 && (

                    <div className="inventory-state">

                        <div className="inventory-state-icon">
                            <Search size={30} />
                        </div>

                        <h3>
                            No inventory found
                        </h3>

                        <p>
                            {search
                                ? "Try a different product, SKU, size or color."
                                : "No product variants are available."}
                        </p>

                    </div>
                )}


            {/* ==========================================
                INVENTORY TABLE
            ========================================== */}

            {!loading &&
                !error &&
                filteredInventory.length > 0 && (

                    <div className="inventory-table-wrapper">

                        <table className="inventory-table">

                            <thead>

                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Size</th>
                                    <th>Color</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>

                            </thead>


                            <tbody>

                                {filteredInventory.map(
                                    (item) => (

                                        <tr
                                            key={item.id}
                                        >

                                            {/* PRODUCT */}

                                            <td>

                                                <div className="inventory-product">

                                                    <div className="inventory-product-icon">
                                                        <Package
                                                            size={17}
                                                        />
                                                    </div>

                                                    <strong>
                                                        {
                                                            item.product_name
                                                        }
                                                    </strong>

                                                </div>

                                            </td>


                                            {/* SKU */}

                                            <td>

                                                <span className="inventory-sku">
                                                    {item.sku}
                                                </span>

                                            </td>


                                            {/* SIZE */}

                                            <td>

                                                <span className="inventory-size">
                                                    {item.size}
                                                </span>

                                            </td>


                                            {/* COLOR */}

                                            <td>

                                                <span className="inventory-color">
                                                    {item.color}
                                                </span>

                                            </td>


                                            {/* STOCK */}

                                            <td>

                                                <div
                                                    className={`inventory-stock-number ${getStockClass(
                                                        item.stock
                                                    )}`}
                                                >
                                                    <strong>
                                                        {
                                                            item.stock
                                                        }
                                                    </strong>

                                                    <span>
                                                        units
                                                    </span>
                                                </div>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`inventory-status ${getStockClass(
                                                        item.stock
                                                    )}`}
                                                >
                                                    <span className="inventory-status-dot" />

                                                    {getStockLabel(
                                                        item.stock
                                                    )}
                                                </span>

                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                <button
                                                    className="inventory-edit-btn"
                                                    onClick={() =>
                                                        handleStockUpdate(
                                                            item.id,
                                                            item.stock
                                                        )
                                                    }
                                                >
                                                    <Pencil
                                                        size={15}
                                                    />

                                                    Edit Stock
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

        </div>
    );
}

export default AdminInventory;