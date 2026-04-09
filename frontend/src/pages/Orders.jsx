import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../api.js";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await getOrders();
            setOrders(res.data);
        } catch (err) {
            setError("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "#f39c12";
            case "shipped":
                return "#3498db";
            case "delivered":
                return "#27ae60";
            case "cancelled":
                return "#e74c3c";
            default:
                return "#666";
        }
    };

    return (
        <div style={styles.container}>
            <h1>📦 My Orders</h1>
            {error && <div style={styles.error}>{error}</div>}

            {loading ? (
                <p>Loading your orders...</p>
            ) : orders.length === 0 ? (
                <div style={styles.empty}>
                    <p>You haven't placed any orders yet.</p>
                    <a href="/" style={styles.link}>Continue Shopping</a>
                </div>
            ) : (
                <div style={styles.ordersList}>
                    {orders.map(order => (
                        <div key={order._id} style={styles.orderCard}>
                            <div style={styles.orderHeader}>
                                <div>
                                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                                    <p style={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ ...styles.status, background: getStatusColor(order.status) }}>
                                        {order.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.orderItems}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} style={styles.item}>
                                        {item.image && <img src={item.image} alt={item.name} style={styles.itemImage} />}
                                        <div style={styles.itemInfo}>
                                            <h4>{item.name}</h4>
                                            <p>₹{item.price} × {item.quantity || 1}</p>
                                        </div>
                                        <p style={styles.itemTotal}>₹{item.price * (item.quantity || 1)}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.orderFooter}>
                                <div style={styles.totalSection}>
                                    <span>Total Amount:</span>
                                    <span style={styles.totalAmount}>₹{order.total}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 1000,
        margin: "0 auto",
        padding: 20,
    },
    error: {
        padding: 12,
        marginBottom: 16,
        borderRadius: 4,
        background: "#fadbd8",
        color: "#c0392b",
    },
    empty: {
        textAlign: "center",
        padding: 40,
        background: "#f5f5f5",
        borderRadius: 8,
    },
    link: {
        display: "inline-block",
        marginTop: 16,
        padding: "10px 24px",
        background: "#3498db",
        color: "#fff",
        textDecoration: "none",
        borderRadius: 4,
    },
    ordersList: {
        display: "grid",
        gap: 16,
    },
    orderCard: {
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        background: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    orderHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 12,
        borderBottom: "1px solid #eee",
        marginBottom: 12,
    },
    date: {
        fontSize: 12,
        color: "#999",
        margin: "4px 0 0 0",
    },
    status: {
        padding: "4px 12px",
        color: "#fff",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: "bold",
    },
    orderItems: {
        marginBottom: 12,
    },
    item: {
        display: "flex",
        gap: 12,
        padding: 8,
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
    },
    itemImage: {
        width: 60,
        height: 60,
        objectFit: "cover",
        borderRadius: 4,
    },
    itemInfo: {
        flex: 1,
    },
    itemTotal: {
        fontWeight: "bold",
        minWidth: 80,
        textAlign: "right",
    },
    orderFooter: {
        display: "flex",
        justifyContent: "flex-end",
        paddingTop: 12,
        borderTop: "1px solid #eee",
    },
    totalSection: {
        display: "flex",
        gap: 12,
        fontSize: 16,
        fontWeight: "bold",
    },
    totalAmount: {
        color: "#27ae60",
    },
};

export default Orders;
