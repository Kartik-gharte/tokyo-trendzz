import { useEffect, useState } from "react";

import {
    Search,
    MapPin,
    User,
    Phone,
    Eye,
    Trash2,
    X,
    Home
} from "lucide-react";

import "./AdminAddresses.css";


function AdminAddresses() {

    const [addresses, setAddresses] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);


    // ==========================================
    // FETCH ALL ADDRESSES
    // ==========================================
    useEffect(() => {
        fetchAddresses();
    }, []);


    async function fetchAddresses() {

        try {

            setLoading(true);
            setError("");

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const response = await fetch(
                "/api/admin/addresses",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch addresses"
                );
            }

            setAddresses(data.addresses || []);

        } catch (error) {

            console.error(error);

            setError(error.message);

        } finally {

            setLoading(false);

        }
    }


    // ==========================================
    // FETCH ADDRESS DETAILS
    // ==========================================
    async function fetchAddressDetails(addressId) {

        try {

            setSelectedAddress({
                loading: true
            });

            setLoadingDetails(true);

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const response = await fetch(
                `/api/admin/addresses/${addressId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch address details"
                );
            }

            setSelectedAddress(data.address);

        } catch (error) {

            console.error(error);

            alert(error.message);

            setSelectedAddress(null);

        } finally {

            setLoadingDetails(false);

        }
    }


    // ==========================================
    // DELETE ADDRESS
    // ==========================================
    async function handleDelete(addressId) {

        const confirmed = window.confirm(
            "Are you sure you want to delete this address?"
        );

        if (!confirmed) {
            return;
        }

        try {

            const token = localStorage.getItem(
                "tokyo_trendz_token"
            );

            const response = await fetch(
                `/api/admin/addresses/${addressId}`,
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
                    data.message || "Failed to delete address"
                );
            }

            setAddresses(currentAddresses =>
                currentAddresses.filter(
                    address => address.id !== addressId
                )
            );

            if (
                selectedAddress &&
                selectedAddress.id === addressId
            ) {
                setSelectedAddress(null);
            }

            alert("Address deleted successfully.");

        } catch (error) {

            console.error(error);

            alert(error.message);

        }
    }


    // ==========================================
    // FORMAT ADDRESS
    // ==========================================
    function formatAddress(address) {

        return [
            address.address_line,
            address.city,
            address.state,
            address.postal_code,
            address.country
        ]
            .filter(Boolean)
            .join(", ");
    }


    // ==========================================
    // FILTER ADDRESSES
    // ==========================================
    const filteredAddresses = addresses.filter(address => {

        const searchText = search
            .trim()
            .toLowerCase();

        if (!searchText) {
            return true;
        }

        return (
            address.full_name
                ?.toLowerCase()
                .includes(searchText) ||

            address.phone
                ?.toLowerCase()
                .includes(searchText) ||

            address.city
                ?.toLowerCase()
                .includes(searchText) ||

            address.state
                ?.toLowerCase()
                .includes(searchText) ||

            address.postal_code
                ?.toLowerCase()
                .includes(searchText) ||

            address.user_name
                ?.toLowerCase()
                .includes(searchText) ||

            address.user_email
                ?.toLowerCase()
                .includes(searchText)
        );
    });


    const defaultAddresses = addresses.filter(
        address => Number(address.is_default) === 1
    ).length;


    return (
        <div className="admin-addresses-page">

            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="admin-page-header">

                <div>

                    <h1>Addresses</h1>

                    <p>
                        Manage customer delivery addresses
                    </p>

                </div>

            </div>


            {/* ==========================================
                STATS
            ========================================== */}

            <div className="admin-address-stats">

                <div className="admin-address-stat-card">

                    <div className="admin-address-stat-icon">
                        <MapPin size={22} />
                    </div>

                    <div>

                        <span>Total Addresses</span>

                        <strong>
                            {addresses.length}
                        </strong>

                    </div>

                </div>


                <div className="admin-address-stat-card">

                    <div className="admin-address-stat-icon">
                        <Home size={22} />
                    </div>

                    <div>

                        <span>Default Addresses</span>

                        <strong>
                            {defaultAddresses}
                        </strong>

                    </div>

                </div>


                <div className="admin-address-stat-card">

                    <div className="admin-address-stat-icon">
                        <User size={22} />
                    </div>

                    <div>

                        <span>Customers</span>

                        <strong>
                            {
                                new Set(
                                    addresses.map(
                                        address => address.user_id
                                    )
                                ).size
                            }
                        </strong>

                    </div>

                </div>

            </div>


            {/* ==========================================
                TOOLBAR
            ========================================== */}

            <div className="admin-addresses-toolbar">

                <div className="admin-address-count">

                    <strong>
                        {filteredAddresses.length}
                    </strong>

                    <span>
                        addresses found
                    </span>

                </div>


                <div className="admin-address-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search addresses..."
                        value={search}
                        onChange={event =>
                            setSearch(event.target.value)
                        }
                    />

                </div>

            </div>


            {/* ==========================================
                CONTENT
            ========================================== */}

            {loading ? (

                <div className="admin-address-state">
                    Loading addresses...
                </div>

            ) : error ? (

                <div className="admin-address-state error">
                    {error}
                </div>

            ) : filteredAddresses.length === 0 ? (

                <div className="admin-address-empty">

                    <div className="admin-address-empty-icon">
                        <MapPin size={34} />
                    </div>

                    <h2>
                        No addresses found
                    </h2>

                    <p>
                        Try searching with a different
                        customer name, city, or postal code.
                    </p>

                </div>

            ) : (

                <div className="admin-addresses-table-wrapper">

                    <table className="admin-addresses-table">

                        <thead>

                            <tr>

                                <th>Customer</th>

                                <th>Address</th>

                                <th>Phone</th>

                                <th>Type</th>

                                <th>Actions</th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredAddresses.map(address => (

                                <tr key={address.id}>

                                    {/* CUSTOMER */}

                                    <td>

                                        <div className="admin-address-customer">

                                            <div className="admin-address-avatar">

                                                {address.user_name
                                                    ?.charAt(0)
                                                    .toUpperCase() || "U"}

                                            </div>

                                            <div>

                                                <strong>
                                                    {address.user_name}
                                                </strong>

                                                <span>
                                                    {address.user_email}
                                                </span>

                                            </div>

                                        </div>

                                    </td>


                                    {/* ADDRESS */}

                                    <td>

                                        <div className="admin-address-info">

                                            <strong>
                                                {address.full_name}
                                            </strong>

                                            <span>
                                                {formatAddress(address)}
                                            </span>

                                        </div>

                                    </td>


                                    {/* PHONE */}

                                    <td>

                                        <div className="admin-address-phone">

                                            <Phone size={15} />

                                            <span>
                                                {address.phone}
                                            </span>

                                        </div>

                                    </td>


                                    {/* TYPE */}

                                    <td>

                                        {Number(address.is_default) === 1 ? (

                                            <span className="admin-address-default">

                                                <Home size={14} />

                                                Default

                                            </span>

                                        ) : (

                                            <span className="admin-address-normal">

                                                Address

                                            </span>

                                        )}

                                    </td>


                                    {/* ACTIONS */}

                                    <td>

                                        <div className="admin-address-actions">

                                            <button
                                                className="admin-address-view"
                                                onClick={() =>
                                                    fetchAddressDetails(
                                                        address.id
                                                    )
                                                }
                                                title="View address"
                                            >

                                                <Eye size={17} />

                                            </button>


                                            <button
                                                className="admin-address-delete"
                                                onClick={() =>
                                                    handleDelete(
                                                        address.id
                                                    )
                                                }
                                                title="Delete address"
                                            >

                                                <Trash2 size={17} />

                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}


            {/* ==========================================
                ADDRESS DETAILS MODAL
            ========================================== */}

            {selectedAddress && (

                <div
                    className="admin-address-modal-overlay"
                    onClick={() =>
                        setSelectedAddress(null)
                    }
                >

                    <div
                        className="admin-address-modal"
                        onClick={event =>
                            event.stopPropagation()
                        }
                    >

                        <div className="admin-address-modal-header">

                            <div>

                                <h2>
                                    Address Details
                                </h2>

                                <p>
                                    Customer delivery information
                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    setSelectedAddress(null)
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {loadingDetails ? (

                            <div className="admin-address-modal-loading">
                                Loading address details...
                            </div>

                        ) : (

                            <>

                                <div className="admin-address-detail-profile">

                                    <div className="admin-address-detail-avatar">

                                        {selectedAddress.user_name
                                            ?.charAt(0)
                                            .toUpperCase() || "U"}

                                    </div>

                                    <div>

                                        <h3>
                                            {selectedAddress.user_name}
                                        </h3>

                                        <p>
                                            {selectedAddress.user_email}
                                        </p>

                                    </div>

                                </div>


                                <div className="admin-address-detail-grid">

                                    <div>

                                        <span>
                                            Recipient
                                        </span>

                                        <strong>
                                            {selectedAddress.full_name}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Phone
                                        </span>

                                        <strong>
                                            {selectedAddress.phone}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            City
                                        </span>

                                        <strong>
                                            {selectedAddress.city}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            State
                                        </span>

                                        <strong>
                                            {selectedAddress.state}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Postal Code
                                        </span>

                                        <strong>
                                            {selectedAddress.postal_code}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Country
                                        </span>

                                        <strong>
                                            {selectedAddress.country}
                                        </strong>

                                    </div>

                                </div>


                                <div className="admin-address-full">

                                    <span>
                                        Complete Address
                                    </span>

                                    <p>
                                        {formatAddress(
                                            selectedAddress
                                        )}
                                    </p>

                                </div>


                                {Number(
                                    selectedAddress.is_default
                                ) === 1 && (

                                    <div className="admin-address-detail-default">

                                        <Home size={16} />

                                        This is the customer's
                                        default delivery address.

                                    </div>

                                )}

                            </>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}


export default AdminAddresses;