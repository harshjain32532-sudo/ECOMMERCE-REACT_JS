import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../api.js";
import { useOrderTracking } from "../hooks/useOrderTracking.js";
import { OrderTrackingTimeline } from "../components/OrderTrackingTimeline.jsx";
import AdvancedDeliveryTracking from "../components/AdvancedDeliveryTracking.jsx";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const navigate = useNavigate();

    // Use real-time tracking
    const { isConnected, loading: socketLoading, orders: realtimeOrders } = useOrderTracking();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        loadOrders();
    }, []);

    // Update orders when real-time data comes in
    useEffect(() => {
        if (!initialLoadDone && realtimeOrders.length > 0) {
            setOrders(realtimeOrders);
            setInitialLoadDone(true);
            setLoading(false);
        } else if (initialLoadDone && realtimeOrders.length > 0) {
            setOrders(realtimeOrders);
        }
    }, [realtimeOrders, initialLoadDone]);

    const loadOrders = async () => {
        try {
            const res = await getOrders();
            setOrders(res.data);
            setInitialLoadDone(true);
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
            case "confirmed":
                return "#3498db";
            case "processing":
                return "#9b59b6";
            case "shipped":
                return "#2980b9";
            case "delivered":
                return "#27ae60";
            case "cancelled":
                return "#e74c3c";
            default:
                return "#666";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return "⏳";
            case "confirmed":
                return "✓";
            case "processing":
                return "📦";
            case "shipped":
                return "🚚";
            case "delivered":
                return "✓";
            case "cancelled":
                return "✗";
            default:
                return "→";
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>📦 My Orders</h1>
                {isConnected && (
                    <div style={styles.connectionStatus}>
                        <span style={styles.connectionDot}></span>
                        Real-time tracking active
                    </div>
                )}
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {loading || socketLoading ? (
                <p style={styles.loading}>Loading your orders...</p>
            ) : orders.length === 0 ? (
                <div style={styles.empty}>
                    <p>You haven't placed any orders yet.</p>
                    <a href="/" style={styles.link}>Continue Shopping</a>
                </div>
            ) : (
                <div style={styles.ordersList}>
                    {orders.map(order => (
                        <div key={order._id || order.id} style={styles.orderCard}>
                            <div
                                style={styles.orderHeader}
                                onClick={() => setExpandedOrderId(
                                    expandedOrderId === (order._id || order.id) ? null : (order._id || order.id)
                                )}
                                role="button"
                                tabIndex={0}
                            >
                                <div>
                                    <h3>Order #{(order._id || order.id).slice(-8).toUpperCase()}</h3>
                                    <p style={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div style={styles.rightSection}>
                                    <div style={{ ...styles.status, background: getStatusColor(order.status) }}>
                                        <span>{getStatusIcon(order.status)} {order.status.toUpperCase()}</span>
                                    </div>
                                    <span style={styles.expandIcon}>
                                        {expandedOrderId === (order._id || order.id) ? "▼" : "▶"}
                                    </span>
                                </div>
                            </div>

                            {expandedOrderId === (order._id || order.id) && (
                                <>
                                    <div style={styles.trackingSection}>
                                        <OrderTrackingTimeline order={order} />
                                    </div>

                                    <div style={styles.orderItems}>
                                        {order.items && order.items.map((item, idx) => (
                                            <div key={idx} style={styles.item}>
                                                {item.image && <img src={item.image} alt={item.name} style={styles.itemImage} />}
                                                <div style={styles.itemInfo}>
                                                    <h4>{item.name}</h4>
                                                    <p>₹{item.price} × {item.quantity || 1}</p>
                                                </div>
                                                <p style={styles.itemTotal}>₹{(item.price * (item.quantity || 1)).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={styles.orderDetails}>
                                        <div style={styles.detailsGrid}>
                                            <div style={styles.detailItem}>
                                                <p style={styles.detailLabel}>Payment Status</p>
                                                <p style={{ ...styles.detailValue, color: order.paymentStatus === 'completed' ? '#27ae60' : '#f39c12' }}>
                                                    {order.paymentStatus?.toUpperCase()}
                                                </p>
                                            </div>
                                            {order.trackingNumber && (
                                                <div style={styles.detailItem}>
                                                    <p style={styles.detailLabel}>Tracking Number</p>
                                                    <p style={styles.detailValue}>{order.trackingNumber}</p>
                                                </div>
                                            )}
                                            {order.estimatedDelivery && (
                                                <div style={styles.detailItem}>
                                                    <p style={styles.detailLabel}>Est. Delivery</p>
                                                    <p style={styles.detailValue}>
                                                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {order.trackingNumber && (
                                        <div style={styles.mapPanel}>
                                            <AdvancedDeliveryTracking orderId={order._id || order.id} trackingNumber={order.trackingNumber} />
                                        </div>
                                    )}
                                </>
                            )}

                            <div style={styles.orderFooter}>
                                <div style={styles.totalSection}>
                                    <span>Total Amount:</span>
                                    <span style={styles.totalAmount}>₹{(order.total || 0).toFixed(2)}</span>
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
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    connectionStatus: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        backgroundColor: "#d4edda",
        color: "#155724",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
    },
    connectionDot: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "#27ae60",
        display: "inline-block",
        animation: "pulse 2s infinite",
    },
    error: {
        padding: 12,
        marginBottom: 16,
        borderRadius: 4,
        background: "#fadbd8",
        color: "#c0392b",
    },
    loading: {
        textAlign: "center",
        padding: 20,
        color: "#666",
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
        cursor: "pointer",
        transition: "background 0.3s",
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
        transition: "all 0.3s ease",
    },
    orderHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 12,
        borderBottom: "1px solid #eee",
        marginBottom: 12,
        cursor: "pointer",
        userSelect: "none",
    },
    rightSection: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    expandIcon: {
        color: "#999",
        fontSize: 12,
        transition: "transform 0.3s",
    },
    date: {
        fontSize: 12,
        color: "#999",
        margin: "4px 0 0 0",
    },
    status: {
        padding: "6px 12px",
        color: "#fff",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: "bold",
        whiteSpace: "nowrap",
    },
    trackingSection: {
        marginBottom: 20,
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
    orderDetails: {
        padding: 12,
        backgroundColor: "#f9f9f9",
        borderRadius: 6,
        marginBottom: 12,
    },
    mapPanel: {
        marginBottom: 20,
    },
    detailsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
    },
    detailItem: {
        padding: 8,
    },
    detailLabel: {
        margin: 0,
        fontSize: 12,
        color: "#999",
        fontWeight: 500,
        marginBottom: 4,
    },
    detailValue: {
        margin: 0,
        fontSize: 13,
        fontWeight: 600,
        color: "#333",
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
