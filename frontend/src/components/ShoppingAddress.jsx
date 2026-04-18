import { useState } from "react";

function ShoppingAddress({ addresses = [], onSelectAddress, onAddAddress, onDeleteAddress }) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: "home",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.fullName && formData.phone && formData.address && formData.pincode) {
            onAddAddress(formData);
            setFormData({
                type: "home",
                fullName: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
                isDefault: false,
            });
            setShowForm(false);
        } else {
            alert("Please fill all required fields");
        }
    };

    const getAddressIcon = (type) => {
        const icons = {
            home: "🏠",
            office: "🏢",
            other: "📍",
        };
        return icons[type] || "📍";
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>📦 Delivery Addresses</h2>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        style={styles.addBtn}
                    >
                        + Add New Address
                    </button>
                )}
            </div>

            {/* Add Address Form */}
            {showForm && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>Add New Address</h3>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="9876543210"
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Address Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                style={styles.select}
                            >
                                <option value="home">Home</option>
                                <option value="office">Office</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Address *</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Street address, building, floor, etc."
                                style={styles.textarea}
                                rows="3"
                            />
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="Mumbai"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    placeholder="Maharashtra"
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Pincode *</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                placeholder="400001"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleInputChange}
                                style={styles.checkbox}
                            />
                            <label style={styles.checkboxLabel}>Set as default address</label>
                        </div>

                        <div style={styles.formButtons}>
                            <button
                                type="submit"
                                style={styles.saveBtn}
                            >
                                Save Address
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                style={styles.cancelBtn}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Addresses List */}
            {addresses.length > 0 ? (
                <div style={styles.addressesList}>
                    {addresses.map((addr, idx) => (
                        <div
                            key={idx}
                            onClick={() => onSelectAddress(addr)}
                            style={{
                                ...styles.addressCard,
                                border: addr.isDefault ? "2px solid #2575fc" : "1px solid #e0e0e0",
                                background: addr.isDefault ? "#f0f7ff" : "white",
                                animation: `slideInLeft 0.3s ease ${idx * 0.05}s both`,
                            }}
                        >
                            <div style={styles.addressHeader}>
                                <span style={styles.addressType}>
                                    {getAddressIcon(addr.type)} {addr.type.toUpperCase()}
                                </span>
                                {addr.isDefault && <span style={styles.defaultBadge}>Default</span>}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteAddress(idx);
                                    }}
                                    style={styles.deleteBtn}
                                    title="Delete address"
                                >
                                    🗑️
                                </button>
                            </div>

                            <div style={styles.addressBody}>
                                <p style={styles.addressName}>{addr.fullName}</p>
                                <p style={styles.addressPhone}>{addr.phone}</p>
                                <p style={styles.addressText}>{addr.address}</p>
                                {(addr.city || addr.state) && (
                                    <p style={styles.addressText}>
                                        {addr.city} {addr.state && `- ${addr.state}`}
                                    </p>
                                )}
                                {addr.pincode && (
                                    <p style={styles.addressText}>
                                        📮 {addr.pincode}
                                    </p>
                                )}
                            </div>

                            <div style={styles.addressFooter}>
                                <button style={styles.selectBtn}>
                                    {addr.isDefault ? "✓ Default" : "Select"}
                                </button>
                                <button style={styles.editBtn}>
                                    Edit Address
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.emptyState}>
                    <p style={styles.emptyIcon}>📭</p>
                    <p style={styles.emptyText}>No addresses saved yet</p>
                    <p style={styles.emptySubtext}>Add your first address to start shopping</p>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: 20,
        background: "#f9f9f9",
        borderRadius: 10,
        marginBottom: 30,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottom: "2px solid #e0e0e0",
    },
    title: {
        fontSize: 20,
        fontWeight: 700,
        color: "#2c3e50",
        margin: 0,
    },
    addBtn: {
        padding: "10px 16px",
        background: "linear-gradient(135deg, #2575fc 0%, #1e5dcc 100%)",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    formCard: {
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        animation: "slideInDown 0.4s ease",
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 15,
        marginTop: 0,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 15,
    },
    formRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 15,
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 5,
    },
    label: {
        fontSize: 13,
        fontWeight: 600,
        color: "#2c3e50",
    },
    input: {
        padding: "10px 12px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 14,
        color: "#333",
        transition: "all 0.3s ease",
    },
    select: {
        padding: "10px 12px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 14,
        color: "#333",
        background: "white",
    },
    textarea: {
        padding: "10px 12px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 14,
        color: "#333",
        fontFamily: "inherit",
        resize: "vertical",
    },
    checkboxGroup: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    checkbox: {
        cursor: "pointer",
        width: 18,
        height: 18,
    },
    checkboxLabel: {
        fontSize: 13,
        color: "#555",
        cursor: "pointer",
    },
    formButtons: {
        display: "flex",
        gap: 10,
        marginTop: 10,
    },
    saveBtn: {
        flex: 1,
        padding: "12px 16px",
        background: "linear-gradient(135deg, #27ae60 0%, #229954 100%)",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    cancelBtn: {
        flex: 1,
        padding: "12px 16px",
        background: "#e0e0e0",
        color: "#555",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    addressesList: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 15,
    },
    addressCard: {
        background: "white",
        padding: 15,
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        cursor: "pointer",
    },
    addressHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 10,
        borderBottom: "1px solid #f0f0f0",
    },
    addressType: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2575fc",
    },
    defaultBadge: {
        fontSize: 10,
        background: "#2575fc",
        color: "white",
        padding: "4px 8px",
        borderRadius: 4,
        fontWeight: 600,
    },
    deleteBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 16,
        transition: "all 0.2s ease",
    },
    addressBody: {
        marginBottom: 12,
    },
    addressName: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 4px 0",
    },
    addressPhone: {
        fontSize: 12,
        color: "#666",
        margin: "0 0 8px 0",
    },
    addressText: {
        fontSize: 12,
        color: "#555",
        margin: "4px 0",
        lineHeight: "1.4",
    },
    addressFooter: {
        display: "flex",
        gap: 8,
    },
    selectBtn: {
        flex: 1,
        padding: "8px 12px",
        background: "#2575fc",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    editBtn: {
        flex: 1,
        padding: "8px 12px",
        background: "#f0f0f0",
        color: "#333",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    emptyState: {
        textAlign: "center",
        padding: 40,
        background: "white",
        borderRadius: 10,
        animation: "fadeIn 0.4s ease",
    },
    emptyIcon: {
        fontSize: 48,
        margin: "0 0 10px 0",
    },
    emptyText: {
        fontSize: 16,
        fontWeight: 600,
        color: "#2c3e50",
        margin: "10px 0",
    },
    emptySubtext: {
        fontSize: 13,
        color: "#999",
        margin: 0,
    },
};

export default ShoppingAddress;
