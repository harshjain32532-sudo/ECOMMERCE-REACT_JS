import { useEffect, useState } from "react";
import { getProfile, updateProfile, getOrders } from "../api.js";

function Profile() {
    const [profile, setProfile] = useState({ name: "", email: "", shippingAddress: { line1: "", city: "", state: "", zip: "", country: "" } });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const [profileRes, ordersRes] = await Promise.all([getProfile(), getOrders()]);
                const profileData = profileRes.data || {};
                setProfile({
                    ...profileData,
                    shippingAddress: profileData.shippingAddress || { line1: "", city: "", state: "", zip: "", country: "" },
                });
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
            setStatus("Profile updated successfully.");
        } catch (err) {
            setStatus(err.response?.data?.error || "Unable to update profile.");
        }
    };

    if (loading) {
        return <div style={styles.container}><p>Loading profile...</p></div>;
    }

    return (
        <div style={styles.container}>
            <h1>Profile</h1>
            {status && <div style={styles.message}>{status}</div>}
            <div style={styles.section}>
                <h2>Account Details</h2>
                <div style={styles.fieldGroup}>
                    <label>Name</label>
                    <input
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        style={styles.input}
                    />
                </div>
                <div style={styles.fieldGroup}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        style={styles.input}
                    />
                </div>
                <h3>Shipping Address</h3>
                <div style={styles.fieldGroup}>
                    <label>Line 1</label>
                    <input
                        value={profile.shippingAddress?.line1 || ""}
                        onChange={e => setProfile({ ...profile, shippingAddress: { ...profile.shippingAddress, line1: e.target.value } })}
                        style={styles.input}
                    />
                </div>
                <div style={styles.fieldGroup}>
                    <label>City</label>
                    <input
                        value={profile.shippingAddress?.city || ""}
                        onChange={e => setProfile({ ...profile, shippingAddress: { ...profile.shippingAddress, city: e.target.value } })}
                        style={styles.input}
                    />
                </div>
                <div style={styles.twoColumn}>
                    <div style={styles.fieldGroup}>
                        <label>State</label>
                        <input
                            value={profile.shippingAddress?.state || ""}
                            onChange={e => setProfile({ ...profile, shippingAddress: { ...profile.shippingAddress, state: e.target.value } })}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.fieldGroup}>
                        <label>ZIP</label>
                        <input
                            value={profile.shippingAddress?.zip || ""}
                            onChange={e => setProfile({ ...profile, shippingAddress: { ...profile.shippingAddress, zip: e.target.value } })}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.fieldGroup}>
                        <label>Country</label>
                        <input
                            value={profile.shippingAddress?.country || ""}
                            onChange={e => setProfile({ ...profile, shippingAddress: { ...profile.shippingAddress, country: e.target.value } })}
                            style={styles.input}
                        />
                    </div>
                </div>
                <button onClick={handleProfileSave} style={styles.button}>Save Profile</button>
            </div>

            <div style={styles.section}>
                <h2>Order History</h2>
                {orders.length === 0 ? (
                    <p>You have not placed any orders yet.</p>
                ) : (
                    <div style={styles.ordersList}>
                        {orders.map(order => {
                            const items = Array.isArray(order.items) ? order.items : [];
                            return (
                                <div key={order._id} style={styles.orderCard}>
                                    <div style={styles.orderHeader}>
                                        <div>
                                            <h4>Order #{order._id.slice(-8).toUpperCase()}</h4>
                                            <p style={styles.orderDate}>Purchased on {new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div style={styles.orderMeta}>
                                            <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
                                            <span style={styles.orderAmount}>₹{Number(order.total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div style={styles.orderItems}>
                                        {items.map((item, index) => (
                                            <div key={index} style={styles.orderItem}>
                                                <span style={styles.orderItemName}>{item.name}</span>
                                                <span>× {item.quantity || 1}</span>
                                                <span>₹{item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={styles.orderFooter}>
                                        <span style={styles.orderFooterLabel}>Order Total</span>
                                        <span style={styles.orderFooterValue}>₹{Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <footer style={styles.footer}>
                <p style={styles.footerText}>All rights reserved in 2026</p>
            </footer>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 1000,
        margin: "0 auto",
        padding: 20,
    },
    section: {
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        marginBottom: 24,
    },
    fieldGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginBottom: 16,
    },
    twoColumn: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 16,
    },
    input: {
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 4,
        fontSize: 14,
    },
    button: {
        padding: 12,
        background: "#3498db",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 16,
        fontWeight: "bold",
    },
    message: {
        padding: 12,
        borderRadius: 4,
        background: "#e8f5e9",
        color: "#2e7d32",
        marginBottom: 16,
    },
    ordersList: {
        display: "grid",
        gap: 16,
    },
    orderCard: {
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
    },
    orderHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        marginBottom: 16,
    },
    orderDate: {
        margin: 0,
        color: "#555",
        fontSize: 14,
    },
    orderMeta: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
        textAlign: "right",
    },
    orderAmount: {
        fontSize: 18,
        fontWeight: 700,
        color: "#2a3f8f",
    },
    orderStatus: {
        padding: "8px 12px",
        background: "#f1f8ff",
        color: "#155799",
        borderRadius: 4,
        fontWeight: 700,
    },
    orderItems: {
        display: "grid",
        gap: 8,
        marginBottom: 16,
    },
    orderItem: {
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: 16,
        padding: 14,
        background: "#fdfdff",
        borderRadius: 6,
        alignItems: "center",
    },
    orderItemName: {
        fontWeight: 600,
        color: "#333",
    },
    orderFooter: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 16,
        fontWeight: "bold",
        borderTop: "1px solid #eee",
        paddingTop: 12,
    },
    orderFooterLabel: {
        color: "#555",
    },
    orderFooterValue: {
        color: "#1f4a8a",
    },
    footer: {
        textAlign: "center",
        padding: "20px 0",
        marginTop: 20,
        borderTop: "1px solid #e0e0e0",
        color: "#777",
    },
    footerText: {
        margin: 0,
        fontSize: 14,
    },
};

export default Profile;
