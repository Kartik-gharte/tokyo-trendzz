import { useEffect, useState } from "react";
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

    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError("");

            const [inventoryResponse, statsResponse] =
                await Promise.all([
                    fetch(
                        "http://localhost:5000/api/admin/inventory",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    ),
                    fetch(
                        "http://localhost:5000/api/admin/inventory/stats",
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

            setInventory(inventoryData.inventory);
            setStats(statsData.stats);

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

    const filteredInventory = inventory.filter((item) => {
        const searchText = search.toLowerCase();

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
                `http://localhost:5000/api/admin/inventory/${variantId}/stock`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${token}`
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

            alert("Stock updated successfully.");

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

            <div className="inventory-header">
                <div>
                    <h1>Inventory Management</h1>
                    <p>
                        Monitor and manage product
                        variant stock.
                    </p>
                </div>

                <button
                    className="inventory-refresh-btn"
                    onClick={fetchInventory}
                >
                    Refresh
                </button>
            </div>


            <div className="inventory-stats">

                <div className="inventory-stat-card">
                    <span>Total Variants</span>
                    <strong>
                        {stats.total_variants}
                    </strong>
                </div>

                <div className="inventory-stat-card">
                    <span>Total Stock</span>
                    <strong>
                        {stats.total_stock}
                    </strong>
                </div>

                <div className="inventory-stat-card">
                    <span>Low Stock</span>
                    <strong>
                        {stats.low_stock}
                    </strong>
                </div>

                <div className="inventory-stat-card">
                    <span>Out of Stock</span>
                    <strong>
                        {stats.out_of_stock}
                    </strong>
                </div>

            </div>


            <div className="inventory-toolbar">

                <input
                    type="text"
                    placeholder="Search product, SKU, size or color..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />

                <span>
                    Showing {filteredInventory.length} of{" "}
                    {inventory.length} variants
                </span>

            </div>


            {loading && (
                <div className="inventory-message">
                    Loading inventory...
                </div>
            )}


            {!loading && error && (
                <div className="inventory-error">
                    {error}
                </div>
            )}


            {!loading &&
                !error &&
                filteredInventory.length === 0 && (
                    <div className="inventory-message">
                        No inventory found.
                    </div>
                )}


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
                                        <tr key={item.id}>

                                            <td>
                                                <strong>
                                                    {
                                                        item.product_name
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {item.sku}
                                            </td>

                                            <td>
                                                {item.size}
                                            </td>

                                            <td>
                                                {item.color}
                                            </td>

                                            <td>
                                                <strong>
                                                    {item.stock}
                                                </strong>
                                            </td>

                                            <td>
                                                <span
                                                    className={`inventory-status ${getStockClass(
                                                        item.stock
                                                    )}`}
                                                >
                                                    {getStockLabel(
                                                        item.stock
                                                    )}
                                                </span>
                                            </td>

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