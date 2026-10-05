import { useEffect, useState } from "react";
import "./AdminReports.css";

function AdminReports() {
    const [report, setReport] = useState(null);
    const [products, setProducts] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem(
        "tokyo_trendz_token"
    );


    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");

            let query = "";

            if (startDate || endDate) {
                const params = new URLSearchParams();

                if (startDate) {
                    params.append(
                        "startDate",
                        startDate
                    );
                }

                if (endDate) {
                    params.append(
                        "endDate",
                        endDate
                    );
                }

                query = `?${params.toString()}`;
            }


            const [
                salesResponse,
                productsResponse
            ] = await Promise.all([
                fetch(
                    `http://localhost:5000/api/admin/reports/sales${query}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                ),

                fetch(
                    `http://localhost:5000/api/admin/reports/products${query}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )
            ]);


            const salesData =
                await salesResponse.json();

            const productsData =
                await productsResponse.json();


            if (!salesData.success) {
                throw new Error(
                    salesData.message ||
                    "Failed to load sales report"
                );
            }


            if (!productsData.success) {
                throw new Error(
                    productsData.message ||
                    "Failed to load product report"
                );
            }


            setReport(
                salesData.report
            );

            setProducts(
                productsData.products
            );

        } catch (error) {

            console.error(
                "Reports fetch error:",
                error
            );

            setError(
                error.message ||
                "Failed to load reports"
            );

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchReports();
    }, []);


    const handleFilter = () => {
        if (
            startDate &&
            endDate &&
            startDate > endDate
        ) {
            alert(
                "Start date cannot be after end date."
            );

            return;
        }

        fetchReports();
    };


    const clearFilter = () => {
        setStartDate("");
        setEndDate("");

        setTimeout(() => {
            fetchReports();
        }, 0);
    };


    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;
    };


    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN"
        );
    };


    // ==========================================
    // CSV EXPORT
    // ==========================================

    const exportCSV = () => {
        if (!report) {
            return;
        }

        const rows = [];

        rows.push([
            "Tokyo Trendz Reports"
        ]);

        rows.push([]);

        rows.push([
            "Report Period",
            startDate || "All Time",
            endDate || "All Time"
        ]);

        rows.push([]);

        // Summary

        rows.push([
            "SUMMARY"
        ]);

        rows.push([
            "Total Orders",
            report.summary.totalOrders
        ]);

        rows.push([
            "Total Subtotal",
            report.summary.totalSubtotal
        ]);

        rows.push([
            "Total Discount",
            report.summary.totalDiscount
        ]);

        rows.push([
            "Total Shipping",
            report.summary.totalShipping
        ]);

        rows.push([
            "Total Revenue",
            report.summary.totalRevenue
        ]);

        rows.push([]);

        // Daily Sales

        rows.push([
            "DAILY SALES"
        ]);

        rows.push([
            "Date",
            "Orders",
            "Revenue"
        ]);

        report.dailySales.forEach((item) => {
            rows.push([
                item.date,
                item.orders,
                item.revenue
            ]);
        });

        rows.push([]);

        // Payment Methods

        rows.push([
            "PAYMENT METHODS"
        ]);

        rows.push([
            "Payment Method",
            "Orders",
            "Revenue"
        ]);

        report.paymentMethods.forEach((item) => {
            rows.push([
                item.payment_method,
                item.orders,
                item.revenue
            ]);
        });

        rows.push([]);

        // Order Status

        rows.push([
            "ORDER STATUS"
        ]);

        rows.push([
            "Status",
            "Orders"
        ]);

        report.orderStatuses.forEach((item) => {
            rows.push([
                item.order_status,
                item.orders
            ]);
        });

        rows.push([]);

        // Product Sales

        rows.push([
            "PRODUCT SALES"
        ]);

        rows.push([
            "Product",
            "Units Sold",
            "Revenue"
        ]);

        products.forEach((product) => {
            rows.push([
                product.product_name,
                product.units_sold,
                product.product_revenue
            ]);
        });


        // Convert rows to CSV

        const csvContent = rows
            .map((row) =>
                row
                    .map((value) => {
                        const text = String(
                            value ?? ""
                        );

                        return `"${text.replace(
                            /"/g,
                            '""'
                        )}"`;
                    })
                    .join(",")
            )
            .join("\n");


        // Create file

        const blob = new Blob(
            [csvContent],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = url;


        const datePart =
            startDate || endDate
                ? `${startDate || "start"}_to_${endDate || "end"}`
                : "all_time";


        link.download =
            `tokyo_trendz_report_${datePart}.csv`;


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };


    if (loading) {
        return (
            <div className="admin-reports">
                <div className="reports-message">
                    Loading reports...
                </div>
            </div>
        );
    }


    if (error) {
        return (
            <div className="admin-reports">
                <div className="reports-error">
                    {error}
                </div>
            </div>
        );
    }


    return (
        <div className="admin-reports">

            {/* Header */}

            <div className="reports-header">

                <div>
                    <h1>
                        Reports & Export
                    </h1>

                    <p>
                        Analyze sales, orders and
                        product performance.
                    </p>
                </div>


                <div className="reports-header-actions">

                    <button
                        className="reports-export-btn"
                        onClick={exportCSV}
                    >
                        Export CSV
                    </button>


                    <button
                        className="reports-refresh-btn"
                        onClick={fetchReports}
                    >
                        Refresh
                    </button>

                </div>

            </div>


            {/* Date Filter */}

            <div className="reports-filter">

                <div className="report-date-field">

                    <label>
                        Start Date
                    </label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(event) =>
                            setStartDate(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="report-date-field">

                    <label>
                        End Date
                    </label>

                    <input
                        type="date"
                        value={endDate}
                        onChange={(event) =>
                            setEndDate(
                                event.target.value
                            )
                        }
                    />

                </div>


                <button
                    className="reports-filter-btn"
                    onClick={handleFilter}
                >
                    Apply Filter
                </button>


                <button
                    className="reports-clear-btn"
                    onClick={clearFilter}
                >
                    Clear
                </button>

            </div>


            {report && (
                <>

                    {/* Summary Cards */}

                    <div className="reports-stats">

                        <div className="report-stat-card">

                            <span>
                                Total Orders
                            </span>

                            <strong>
                                {
                                    report.summary
                                        .totalOrders
                                }
                            </strong>

                        </div>


                        <div className="report-stat-card">

                            <span>
                                Total Revenue
                            </span>

                            <strong>
                                {formatCurrency(
                                    report.summary
                                        .totalRevenue
                                )}
                            </strong>

                        </div>


                        <div className="report-stat-card">

                            <span>
                                Total Discount
                            </span>

                            <strong>
                                {formatCurrency(
                                    report.summary
                                        .totalDiscount
                                )}
                            </strong>

                        </div>


                        <div className="report-stat-card">

                            <span>
                                Shipping Revenue
                            </span>

                            <strong>
                                {formatCurrency(
                                    report.summary
                                        .totalShipping
                                )}
                            </strong>

                        </div>

                    </div>


                    {/* Daily Sales */}

                    <div className="report-section">

                        <div className="report-section-header">

                            <h2>
                                Daily Sales
                            </h2>

                        </div>


                        {report.dailySales.length === 0 ? (

                            <div className="reports-empty">
                                No sales found.
                            </div>

                        ) : (

                            <div className="reports-table-wrapper">

                                <table className="reports-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Orders
                                            </th>

                                            <th>
                                                Revenue
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {report.dailySales.map(
                                            (item) => (

                                                <tr
                                                    key={
                                                        item.date
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            formatDate(
                                                                item.date
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.orders
                                                        }
                                                    </td>

                                                    <td>

                                                        <strong>
                                                            {
                                                                formatCurrency(
                                                                    item.revenue
                                                                )
                                                            }
                                                        </strong>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>


                    {/* Payment Methods */}

                    <div className="report-section">

                        <div className="report-section-header">

                            <h2>
                                Payment Methods
                            </h2>

                        </div>


                        <div className="reports-table-wrapper">

                            <table className="reports-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Payment Method
                                        </th>

                                        <th>
                                            Orders
                                        </th>

                                        <th>
                                            Revenue
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {report.paymentMethods.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.payment_method
                                                }
                                            >

                                                <td>
                                                    {
                                                        item.payment_method
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.orders
                                                    }
                                                </td>

                                                <td>

                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                item.revenue
                                                            )
                                                        }
                                                    </strong>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>


                    {/* Order Status */}

                    <div className="report-section">

                        <div className="report-section-header">

                            <h2>
                                Order Status
                            </h2>

                        </div>


                        <div className="reports-table-wrapper">

                            <table className="reports-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Orders
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {report.orderStatuses.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.order_status
                                                }
                                            >

                                                <td>
                                                    {
                                                        item.order_status
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.orders
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>


                    {/* Product Sales */}

                    <div className="report-section">

                        <div className="report-section-header">

                            <h2>
                                Product Sales
                            </h2>

                        </div>


                        {products.length === 0 ? (

                            <div className="reports-empty">
                                No product sales found.
                            </div>

                        ) : (

                            <div className="reports-table-wrapper">

                                <table className="reports-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Product
                                            </th>

                                            <th>
                                                Units Sold
                                            </th>

                                            <th>
                                                Revenue
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {products.map(
                                            (product) => (

                                                <tr
                                                    key={
                                                        product.product_id
                                                    }
                                                >

                                                    <td>

                                                        <strong>
                                                            {
                                                                product.product_name
                                                            }
                                                        </strong>

                                                    </td>

                                                    <td>
                                                        {
                                                            product.units_sold
                                                        }
                                                    </td>

                                                    <td>

                                                        <strong>
                                                            {
                                                                formatCurrency(
                                                                    product.product_revenue
                                                                )
                                                            }
                                                        </strong>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </>
            )}

        </div>
    );
}

export default AdminReports;