import { useEffect, useState } from "react";
import { getProfile, updateProfile, getOrders } from "../api.js";
import "../styles/Profile.css";

function Profile() {
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState({ name: "", email: "", shippingAddress: { line1: "", city: "", state: "", zip: "", country: "" } });
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [newAddress, setNewAddress] = useState({ line1: "", city: "", state: "", zip: "", country: "", isDefault: false });
    const [showAddressForm, setShowAddressForm] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const [profileRes, ordersRes] = await Promise.all([getProfile(), getOrders()]);
                const profileData = profileRes.data || {};
                setProfile({
                    ...profileData,
                    shippingAddress: profileData.shippingAddress || { line1: "", city: "", state: "", zip: "", country: "" },
                });

                // Initialize addresses from profile
                if (profileData.shippingAddress) {
                    setAddresses([{
                        _id: "default",
                        ...profileData.shippingAddress,
                        isDefault: true
                    }]);
                }

                setOrders(ordersRes.data || []);
            } catch (err) {
                setStatus("Failed to load profile or orders.");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleProfileSave = async () => {
        setStatus("");
        try {
            const res = await updateProfile(profile);
            setProfile(res.data);
            setStatus("✓ Profile updated successfully!");
            setTimeout(() => setStatus(""), 3000);
        } catch (err) {
            setStatus("✗ " + (err.response?.data?.error || "Unable to update profile."));
        }
    };

    const handleAddAddress = async () => {
        if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.zip) {
            setStatus("✗ Please fill all address fields");
            return;
        }

        setStatus("");
        try {
            const updatedProfile = {
                ...profile,
                addresses: [...(addresses.filter(a => a._id !== "default")), newAddress]
            };
            await updateProfile(updatedProfile);
            setAddresses([...addresses, { ...newAddress, _id: Date.now() }]);
            setNewAddress({ line1: "", city: "", state: "", zip: "", country: "", isDefault: false });
            setShowAddressForm(false);
            setStatus("✓ Address added successfully!");
            setTimeout(() => setStatus(""), 3000);
        } catch (err) {
            setStatus("✗ Failed to add address");
        }
    };

    const handleUpdateAddress = async (id) => {
        setStatus("");
        try {
            const updatedAddress = addresses.find(a => a._id === id);
            const otherAddresses = addresses.filter(a => a._id !== id);
            const updatedProfile = {
                ...profile,
                addresses: [updatedAddress, ...otherAddresses]
            };
            await updateProfile(updatedProfile);
            setStatus("✓ Address updated successfully!");
            setEditingAddressId(null);
            setTimeout(() => setStatus(""), 3000);
        } catch (err) {
            setStatus("✗ Failed to update address");
        }
    };

    const handleDeleteAddress = async (id) => {
        if (id === "default") return;
        setStatus("");
        try {
            const updatedAddresses = addresses.filter(a => a._id !== id);
            const updatedProfile = {
                ...profile,
                addresses: updatedAddresses.filter(a => a._id !== "default")
            };
            await updateProfile(updatedProfile);
            setAddresses(updatedAddresses);
            setStatus("✓ Address deleted successfully!");
            setTimeout(() => setStatus(""), 3000);
        } catch (err) {
            setStatus("✗ Failed to delete address");
        }
    };

    if (loading) {
        return <div style={styles.container}><p style={styles.loadingText}>Loading profile...</p></div>;
    }

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>My Account</h1>
                    <p style={styles.subtitle}>Manage your profile, addresses and orders</p>
                </div>
            </div>

            {status && (
                <div style={{
                    ...styles.message,
                    background: status.includes("✓") ? "#e8f5e9" : "#ffebee",
                    color: status.includes("✓") ? "#2e7d32" : "#c62828"
                }}>
                    {status}
                </div>
            )}

            <div style={styles.container}>
                {/* Tabs Navigation */}
                <div style={styles.tabsNav}>
                    <button
                        onClick={() => setActiveTab("profile")}
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === "profile" ? styles.tabButtonActive : {})
                        }}
                    >
                        👤 Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("addresses")}
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === "addresses" ? styles.tabButtonActive : {})
                        }}
                    >
                        📍 Addresses
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === "orders" ? styles.tabButtonActive : {})
                        }}
                    >
                        📦 Orders ({orders.length})
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Account Details</h2>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                value={profile.name}
                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                style={styles.input}
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                style={styles.input}
                                placeholder="Enter your email"
                            />
                        </div>

                        <h2 style={styles.sectionTitle}>Default Shipping Address</h2>
                        <div style={styles.twoColumn}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Address Line</label>
                                <input
                                    value={profile.shippingAddress?.line1 || ""}
                                    onChange={e => setProfile({ ...profile, shippingAddress: { ...profile.shippingAddress, line1: e.target.value } })}
                                    style={styles.input}
                                    placeholder="Street address"
                                />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>City</label>
                                <input
                                    value={profile.shippingAddress?.city || ""}
                                    onChange={e => setProfile({ ...profile, shippingAddress: { ...profile.shippingAddress, city: e.target.value } })}
                                    style={styles.input}
                                    placeholder="City"
                                />
                            </div>
                        </div>

                        <div style={styles.twoColumn}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>State</label>
                                <input
                                    value={profile.shippingAddress?.state || ""}
                                    onChange={e => setProfile({ ...profile, shippingAddress: { ...profile.shippingAddress, state: e.target.value } })}
                                    style={styles.input}
                                    placeholder="State"
                                />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>ZIP Code</label>
                                <input
                                    value={profile.shippingAddress?.zip || ""}
                                    onChange={e => setProfile({ ...profile, shippingAddress: { ...profile.shippingAddress, zip: e.target.value } })}
                                    style={styles.input}
                                    placeholder="ZIP code"
                                />
                            </div>
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Country</label>
                            <input
                                value={profile.shippingAddress?.country || ""}
                                onChange={e => setProfile({ ...profile, shippingAddress: { ...profile.shippingAddress, country: e.target.value } })}
                                style={styles.input}
                                placeholder="Country"
                            />
                        </div>

                        <button onClick={handleProfileSave} style={styles.saveButton}>
                            💾 Save Changes
                        </button>
                    </div>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                    <div style={styles.section}>
                        <div style={styles.addressesHeader}>
                            <h2 style={styles.sectionTitle}>Saved Addresses</h2>
                            <button
                                onClick={() => setShowAddressForm(!showAddressForm)}
                                style={styles.addButton}
                            >
                                ➕ Add New Address
                            </button>
                        </div>

                        {showAddressForm && (
                            <div style={styles.addressForm}>
                                <h3>Add New Address</h3>
                                <div style={styles.twoColumn}>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>Address Line</label>
                                        <input
                                            value={newAddress.line1}
                                            onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })}
                                            style={styles.input}
                                            placeholder="Street address"
                                        />
                                    </div>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>City</label>
                                        <input
                                            value={newAddress.city}
                                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                            style={styles.input}
                                            placeholder="City"
                                        />
                                    </div>
                                </div>

                                <div style={styles.twoColumn}>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>State</label>
                                        <input
                                            value={newAddress.state}
                                            onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                                            style={styles.input}
                                            placeholder="State"
                                        />
                                    </div>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>ZIP Code</label>
                                        <input
                                            value={newAddress.zip}
                                            onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })}
                                            style={styles.input}
                                            placeholder="ZIP code"
                                        />
                                    </div>
                                </div>

                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Country</label>
                                    <input
                                        value={newAddress.country}
                                        onChange={e => setNewAddress({ ...newAddress, country: e.target.value })}
                                        style={styles.input}
                                        placeholder="Country"
                                    />
                                </div>

                                <div style={styles.formActions}>
                                    <button onClick={handleAddAddress} style={styles.saveButton}>
                                        ✓ Add Address
                                    </button>
                                    <button
                                        onClick={() => setShowAddressForm(false)}
                                        style={styles.cancelButton}
                                    >
                                        ✕ Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={styles.addressesList}>
                            {addresses.map(addr => (
                                <div key={addr._id} style={styles.addressCard}>
                                    <div style={styles.addressCardHeader}>
                                        <h3 style={styles.addressTitle}>
                                            {addr.isDefault ? "🌟 Default Address" : "📍 Address"}
                                        </h3>
                                        {addr._id !== "default" && (
                                            <div style={styles.addressActions}>
                                                <button
                                                    onClick={() => handleDeleteAddress(addr._id)}
                                                    style={styles.deleteButton}
                                                    title="Delete address"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div style={styles.addressContent}>
                                        <p>{addr.line1}</p>
                                        <p>{addr.city}, {addr.state} {addr.zip}</p>
                                        <p>{addr.country}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Order History</h2>

                        {orders.length === 0 ? (
                            <div style={styles.emptyState}>
                                <p style={styles.emptyIcon}>📦</p>
                                <p style={styles.emptyText}>You haven't placed any orders yet</p>
                                <p style={styles.emptySubtext}>Start shopping to see your orders here!</p>
                            </div>
                        ) : (
                            <div style={styles.ordersList}>
                                {orders.map(order => {
                                    const items = Array.isArray(order.items) ? order.items : [];
                                    const orderDate = new Date(order.createdAt);
                                    const formattedDate = orderDate.toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    });

                                    return (
                                        <div key={order._id} style={styles.orderCard}>
                                            <div style={styles.orderCardTop}>
                                                <div style={styles.orderInfo}>
                                                    <h3 style={styles.orderNumber}>Order #{order._id.slice(-8).toUpperCase()}</h3>
                                                    <p style={styles.orderDate}>{formattedDate}</p>
                                                </div>
                                                <div style={styles.orderStatus}>
                                                    <span style={styles.statusBadge}>
                                                        {order.status || "Processing"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={styles.orderItemsContainer}>
                                                <h4 style={styles.itemsTitle}>Items ({items.length})</h4>
                                                {items.map((item, index) => (
                                                    <div key={index} style={styles.orderItemDetail}>
                                                        <div style={styles.itemLeft}>
                                                            <span style={styles.itemName}>{item.name}</span>
                                                            <span style={styles.itemQty}>Qty: {item.quantity || 1}</span>
                                                        </div>
                                                        <div style={styles.itemRight}>
                                                            <span style={styles.itemPrice}>₹{Number(item.price).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={styles.orderCardBottom}>
                                                <div style={styles.totalSection}>
                                                    <span style={styles.totalLabel}>Order Total:</span>
                                                    <span style={styles.totalAmount}>₹{Number(order.total).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <footer style={styles.footer}>
                <p style={styles.footerText}>© 2026 EmberCart. All rights reserved.</p>
            </footer>
        </div>
    );
}

const styles = {
    pageWrapper: {
        minHeight: "100vh",
        background: "#f8f9fa",
    },
    header: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "40px 20px",
        textAlign: "center",
    },
    headerContent: {
        maxWidth: 1200,
        margin: "0 auto",
    },
    title: {
        fontSize: 36,
        fontWeight: 700,
        margin: "0 0 8px 0",
    },
    subtitle: {
        fontSize: 16,
        margin: 0,
        opacity: 0.9,
    },
    container: {
        maxWidth: 1000,
        margin: "0 auto",
        padding: "30px 20px",
    },
    message: {
        maxWidth: 1000,
        margin: "-10px auto 20px",
        padding: "12px 16px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
    },
    tabsNav: {
        display: "flex",
        gap: 12,
        marginBottom: 30,
        borderBottom: "2px solid #e0e0e0",
        flexWrap: "wrap",
    },
    tabButton: {
        padding: "12px 24px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: 15,
        fontWeight: 600,
        color: "#666",
        borderBottom: "3px solid transparent",
        transition: "all 0.3s ease",
        marginBottom: "-2px",
    },
    tabButtonActive: {
        color: "#667eea",
        borderBottomColor: "#667eea",
    },
    section: {
        background: "white",
        borderRadius: 12,
        padding: 30,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 700,
        margin: "0 0 20px 0",
        color: "#333",
    },
    fieldGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: 600,
        color: "#555",
    },
    input: {
        padding: "12px 14px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 14,
        fontFamily: "inherit",
        transition: "border-color 0.3s",
        boxSizing: "border-box",
    },
    twoColumn: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 20,
    },
    saveButton: {
        padding: "12px 24px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 15,
        fontWeight: 600,
        marginTop: 10,
        transition: "transform 0.2s",
    },
    addButton: {
        padding: "10px 16px",
        background: "#667eea",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
        transition: "all 0.3s",
    },
    cancelButton: {
        padding: "12px 24px",
        background: "#e0e0e0",
        color: "#333",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 15,
        fontWeight: 600,
        transition: "all 0.3s",
    },
    deleteButton: {
        padding: "6px 10px",
        background: "#ffebee",
        border: "1px solid #ffcdd2",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 14,
        transition: "all 0.3s",
    },
    addressesHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        gap: 16,
    },
    addressForm: {
        background: "#f8f9fa",
        padding: 20,
        borderRadius: 8,
        marginBottom: 25,
        border: "1px solid #e0e0e0",
    },
    formActions: {
        display: "flex",
        gap: 12,
        marginTop: 20,
    },
    addressesList: {
        display: "grid",
        gap: 16,
    },
    addressCard: {
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        padding: 18,
        background: "#fafafa",
        transition: "all 0.3s",
    },
    addressCardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    addressTitle: {
        fontSize: 15,
        fontWeight: 700,
        margin: 0,
        color: "#333",
    },
    addressActions: {
        display: "flex",
        gap: 8,
    },
    addressContent: {
        fontSize: 14,
        color: "#666",
        lineHeight: 1.6,
    },
    emptyState: {
        textAlign: "center",
        padding: "40px 20px",
    },
    emptyIcon: {
        fontSize: 48,
        margin: "0 0 16px 0",
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 600,
        color: "#333",
        margin: "0 0 8px 0",
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
        margin: 0,
    },
    ordersList: {
        display: "grid",
        gap: 18,
    },
    orderCard: {
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        padding: 20,
        background: "#fff",
        transition: "all 0.3s",
    },
    orderCardTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
        paddingBottom: 16,
        borderBottom: "1px solid #f0f0f0",
    },
    orderInfo: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 700,
        margin: "0 0 4px 0",
        color: "#333",
    },
    orderDate: {
        fontSize: 13,
        color: "#999",
        margin: 0,
    },
    orderStatus: {
        display: "flex",
        gap: 8,
    },
    statusBadge: {
        padding: "6px 12px",
        background: "#e3f2fd",
        color: "#1976d2",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
    },
    orderItemsContainer: {
        marginBottom: 16,
    },
    itemsTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#666",
        margin: "0 0 12px 0",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    orderItemDetail: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #f5f5f5",
    },
    itemLeft: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: 600,
        color: "#333",
    },
    itemQty: {
        fontSize: 12,
        color: "#999",
    },
    itemRight: {
        textAlign: "right",
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 700,
        color: "#667eea",
    },
    orderCardBottom: {
        paddingTop: 16,
        borderTop: "1px solid #f0f0f0",
    },
    totalSection: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: 600,
        color: "#666",
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 700,
        color: "#667eea",
    },
    footer: {
        textAlign: "center",
        padding: "30px 20px",
        marginTop: 40,
        borderTop: "1px solid #e0e0e0",
        background: "#f8f9fa",
    },
    footerText: {
        margin: 0,
        fontSize: 13,
        color: "#999",
    },
    loadingText: {
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        padding: "40px 20px",
    },
};

export default Profile;
