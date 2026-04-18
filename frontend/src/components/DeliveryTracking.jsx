import { useState, useEffect } from "react";

function DeliveryTracking({ order = {}, isOpen = false }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState("");

    // Mock tracking steps
    const trackingSteps = [
        {
            id: 1,
            title: "Order Placed",
            description: "Your order has been placed",
            icon: "✓",
            date: order.createdAt || new Date().toLocaleDateString(),
            time: "2:30 PM",
            status: "completed",
        },
        {
            id: 2,
            title: "Confirmed",
            description: "Seller has confirmed your order",
            icon: "📦",
            date: order.confirmedAt || new Date().toLocaleDateString(),
            time: "2:45 PM",
            status: "completed",
        },
        {
            id: 3,
            title: "Shipped",
            description: "Your package has been shipped",
            icon: "🚚",
            date: order.shippedAt || new Date().toLocaleDateString(),
            time: "10:00 AM",
            status: order.status === "shipped" ? "current" : "pending",
        },
        {
            id: 4,
            title: "Out for Delivery",
            description: "Package is on the way to you",
            icon: "🚛",
            date: order.outForDeliveryAt || "",
            time: "",
            status: order.status === "outForDelivery" ? "current" : "pending",
        },
        {
            id: 5,
            title: "Delivered",
            description: "Your order has been delivered",
            icon: "🎉",
            date: "",
            time: "",
            status: order.status === "delivered" ? "current" : "pending",
        },
    ];

    // Calculate time remaining until delivery
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const deliveryDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

            const diff = deliveryDate - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!isOpen) return null;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h2 style={styles.title}>📍 Order Tracking</h2>
                <div style={styles.orderInfo}>
                    <span style={styles.orderId}>Order ID: {order._id || "#123456"}</span>
                    <span style={styles.estimatedDelivery}>Est. Delivery: {timeRemaining}</span>
                </div>
            </div>

            {/* Timeline */}
            <div style={styles.timeline}>
                {trackingSteps.map((step, idx) => (
                    <div key={step.id} style={styles.timelineItem}>
                        {/* Line connector */}
                        {idx < trackingSteps.length - 1 && (
                            <div
                                style={{
                                    ...styles.connector,
                                    background:
                                        step.status === "completed" ? "#27ae60" : "#ddd",
                                }}
                            />
                        )}

                        {/* Step circle */}
                        <div
                            style={{
                                ...styles.stepCircle,
                                background:
                                    step.status === "completed"
                                        ? "#27ae60"
                                        : step.status === "current"
                                            ? "#2575fc"
                                            : "#f0f0f0",
                                boxShadow:
                                    step.status === "current"
                                        ? "0 0 0 4px rgba(37, 117, 252, 0.2)"
                                        : "none",
                                animation:
                                    step.status === "current"
                                        ? "pulse 2s infinite"
                                        : "none",
                            }}
                        >
                            <span
                                style={{
                                    ...styles.stepIcon,
                                    color:
                                        step.status === "pending"
                                            ? "#999"
                                            : "white",
                                }}
                            >
                                {step.icon}
                            </span>
                        </div>

                        {/* Step content */}
                        <div
                            style={{
                                ...styles.stepContent,
                                opacity:
                                    step.status === "pending" && idx > 2
                                        ? 0.6
                                        : 1,
                            }}
                        >
                            <h3
                                style={{
                                    ...styles.stepTitle,
                                    color:
                                        step.status === "pending"
                                            ? "#999"
                                            : "#2c3e50",
                                }}
                            >
                                {step.title}
                                {step.status === "completed" && (
                                    <span style={styles.completedBadge}>✓</span>
                                )}
                                {step.status === "current" && (
                                    <span style={styles.currentBadge}>IN PROGRESS</span>
                                )}
                            </h3>
                            <p style={styles.stepDescription}>
                                {step.description}
                            </p>
                            {step.date && (
                                <p style={styles.stepDate}>
                                    📅 {step.date} {step.time && `• ${step.time}`}
                                </p>
                            )}

                            {step.status === "current" && (
                                <div style={styles.progressBar}>
                                    <div
                                        style={{
                                            ...styles.progressFill,
                                            animation: "gradientShift 3s ease infinite",
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Delivery Details */}
            <div style={styles.detailsContainer}>
                <div style={styles.detailsCard}>
                    <h3 style={styles.detailsTitle}>📦 Shipment Details</h3>
                    <div style={styles.detailsGrid}>
                        <div style={styles.detail}>
                            <span style={styles.detailLabel}>Carrier:</span>
                            <span style={styles.detailValue}>Flipkart Logistics</span>
                        </div>
                        <div style={styles.detail}>
                            <span style={styles.detailLabel}>Tracking Number:</span>
                            <span style={styles.detailValue}>FL123XYZ456</span>
                        </div>
                        <div style={styles.detail}>
                            <span style={styles.detailLabel}>Weight:</span>
                            <span style={styles.detailValue}>500g</span>
                        </div>
                        <div style={styles.detail}>
                            <span style={styles.detailLabel}>Shipping Type:</span>
                            <span style={styles.detailValue}>Standard (Free)</span>
                        </div>
                    </div>
                </div>

                <div style={styles.detailsCard}>
                    <h3 style={styles.detailsTitle}>📍 Delivery Address</h3>
                    <div style={styles.addressBox}>
                        <p style={styles.addressName}>{order.shippingAddress?.fullName}</p>
                        <p style={styles.addressText}>{order.shippingAddress?.address}</p>
                        <p style={styles.addressText}>
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                        </p>
                        <p style={styles.addressPhone}>📞 {order.shippingAddress?.phone}</p>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div style={styles.notificationsBox}>
                <h3 style={styles.notificationsTitle}>🔔 Notifications</h3>
                <div style={styles.notificationsList}>
                    <div style={styles.notification}>
                        <span style={styles.notificationTime}>Today at 2:30 PM</span>
                        <span style={styles.notificationText}>Order has been confirmed by seller</span>
                    </div>
                    <div style={styles.notification}>
                        <span style={styles.notificationTime}>Today at 10:00 AM</span>
                        <span style={styles.notificationText}>Your order is now shipped</span>
                    </div>
                    <div style={styles.notification}>
                        <span style={styles.notificationTime}>Yesterday at 5:00 PM</span>
                        <span style={styles.notificationText}>Order placed successfully</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actionsBox}>
                <button style={styles.actionBtn}>
                    📞 Contact Customer Support
                </button>
                <button style={styles.actionBtn}>
                    🔗 Copy Tracking Link
                </button>
                <button style={styles.actionBtn}>
                    return-Policy: Return/Cancel Order
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        borderRadius: 12,
        padding: 30,
        maxWidth: 800,
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        animation: "slideInUp 0.5s ease",
    },
    header: {
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: "2px solid #f0f0f0",
    },
    title: {
        fontSize: 22,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 10px 0",
    },
    orderInfo: {
        display: "flex",
        gap: 20,
        fontSize: 13,
        color: "#666",
    },
    orderId: {
        fontWeight: 600,
    },
    estimatedDelivery: {
        background: "#fffbea",
        padding: "4px 8px",
        borderRadius: 4,
        color: "#8b7500",
    },
    timeline: {
        marginBottom: 30,
    },
    timelineItem: {
        display: "grid",
        gridTemplateColumns: "50px 1fr",
        gap: 20,
        marginBottom: 30,
        position: "relative",
    },
    connector: {
        position: "absolute",
        left: 24,
        top: 60,
        width: 2,
        height: 70,
        zIndex: 0,
    },
    stepCircle: {
        width: 50,
        height: 50,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        transition: "all 0.3s ease",
    },
    stepIcon: {
        fontSize: 24,
    },
    stepContent: {
        transition: "all 0.3s ease",
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: 700,
        margin: "0 0 5px 0",
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    completedBadge: {
        fontSize: 12,
        color: "#27ae60",
        fontWeight: 600,
    },
    currentBadge: {
        fontSize: 10,
        background: "#2575fc",
        color: "white",
        padding: "2px 6px",
        borderRadius: 3,
        fontWeight: 600,
    },
    stepDescription: {
        fontSize: 13,
        color: "#666",
        margin: "5px 0",
    },
    stepDate: {
        fontSize: 12,
        color: "#999",
        margin: 0,
    },
    progressBar: {
        height: 4,
        background: "#f0f0f0",
        borderRadius: 2,
        marginTop: 10,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        background: "linear-gradient(90deg, #2575fc, #1e5dcc)",
        borderRadius: 2,
        animation: "shimmer 2s infinite",
    },
    detailsContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        marginBottom: 30,
    },
    detailsCard: {
        background: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        border: "1px solid #f0f0f0",
    },
    detailsTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 12px 0",
    },
    detailsGrid: {
        display: "grid",
        gap: 8,
    },
    detail: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        padding: "6px 0",
    },
    detailLabel: {
        color: "#666",
        fontWeight: 600,
    },
    detailValue: {
        color: "#2c3e50",
        fontWeight: 700,
    },
    addressBox: {
        background: "white",
        padding: 12,
        borderRadius: 6,
        border: "1px solid #e0e0e0",
    },
    addressName: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 4px 0",
    },
    addressText: {
        fontSize: 12,
        color: "#555",
        margin: "2px 0",
        lineHeight: 1.4,
    },
    addressPhone: {
        fontSize: 12,
        color: "#2575fc",
        fontWeight: 600,
        margin: "6px 0 0 0",
    },
    notificationsBox: {
        background: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        border: "1px solid #f0f0f0",
    },
    notificationsTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 12px 0",
    },
    notificationsList: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
    },
    notification: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #f0f0f0",
    },
    notificationTime: {
        fontSize: 11,
        color: "#999",
        fontWeight: 600,
        minWidth: 100,
    },
    notificationText: {
        fontSize: 12,
        color: "#555",
        flex: 1,
    },
    actionsBox: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
    },
    actionBtn: {
        padding: "12px 16px",
        background: "#f0f0f0",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        color: "#2c3e50",
        transition: "all 0.3s ease",
    },
};

export default DeliveryTracking;
