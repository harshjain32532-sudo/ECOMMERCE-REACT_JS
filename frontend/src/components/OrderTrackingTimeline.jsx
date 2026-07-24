import React from "react";

const statusSteps = [
    { status: "pending", label: "Order Received", icon: "✓", color: "#f39c12" },
    { status: "confirmed", label: "Confirmed", icon: "✓", color: "#3498db" },
    { status: "processing", label: "Processing", icon: "📦", color: "#9b59b6" },
    { status: "shipped", label: "Shipped", icon: "🚚", color: "#2980b9" },
    { status: "delivered", label: "Delivered", icon: "✓", color: "#27ae60" },
];

export function OrderTrackingTimeline({ order }) {
    if (!order) return null;

    const currentStatusIndex = statusSteps.findIndex(
        (s) => s.status === order.status
    );

    return (
        <div style={styles.timelineContainer}>
            <div style={styles.timeline}>
                {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isActive = index === currentStatusIndex;

                    return (
                        <div key={step.status} style={styles.timelineItem}>
                            <div
                                style={{
                                    ...styles.timelinePoint,
                                    ...(isCompleted && styles.timelinePointCompleted),
                                    ...(isActive && styles.timelinePointActive),
                                }}
                            >
                                <span style={{ color: isCompleted ? "white" : "#999" }}>
                                    {isCompleted ? step.icon : index + 1}
                                </span>
                            </div>
                            <div
                                style={{
                                    ...styles.timelineLabel,
                                    ...(isActive && styles.timelineLabelActive),
                                }}
                            >
                                <p style={styles.stepLabel}>{step.label}</p>
                                <p style={styles.stepStatus}>{step.status}</p>
                            </div>
                            {index < statusSteps.length - 1 && (
                                <div
                                    style={{
                                        ...styles.timelineConnector,
                                        ...(isCompleted && styles.timelineConnectorCompleted),
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {order.status === "shipped" && (
                <div style={styles.trackingBox}>
                    <h3 style={styles.trackingTitle}>Tracking Information</h3>
                    <p style={styles.trackingNumber}>
                        <strong>Tracking #:</strong> {order.trackingNumber || "Coming soon"}
                    </p>
                    {order.estimatedDelivery && (
                        <p style={styles.estimatedDelivery}>
                            <strong>Expected Delivery:</strong>{" "}
                            {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    )}
                </div>
            )}

            {order.statusHistory && order.statusHistory.length > 0 && (
                <div style={styles.historyBox}>
                    <h3 style={styles.historyTitle}>Status History</h3>
                    <div style={styles.historyList}>
                        {order.statusHistory.map((entry, idx) => (
                            <div key={idx} style={styles.historyItem}>
                                <div style={styles.historyTime}>
                                    {new Date(entry.timestamp).toLocaleString("en-IN", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                                <div style={styles.historyContent}>
                                    <p style={styles.historyStatus}>{entry.status}</p>
                                    {entry.message && (
                                        <p style={styles.historyMessage}>{entry.message}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    timelineContainer: {
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        marginBottom: "20px",
    },
    timeline: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "30px",
    },
    timelineItem: {
        flex: 1,
        textAlign: "center",
        position: "relative",
    },
    timelinePoint: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: "#ddd",
        color: "#999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 10px",
        fontWeight: "bold",
        fontSize: "16px",
        transition: "all 0.3s ease",
        border: "2px solid #ddd",
    },
    timelinePointCompleted: {
        backgroundColor: "#27ae60",
        borderColor: "#27ae60",
        color: "white",
    },
    timelinePointActive: {
        backgroundColor: "#3498db",
        borderColor: "#3498db",
        color: "white",
        transform: "scale(1.2)",
        boxShadow: "0 0 10px rgba(52, 152, 219, 0.5)",
    },
    timelineLabel: {
        flex: 1,
        color: "#999",
    },
    timelineLabelActive: {
        color: "#333",
        fontWeight: "bold",
    },
    stepLabel: {
        margin: "5px 0",
        fontSize: "14px",
        fontWeight: "500",
    },
    stepStatus: {
        margin: "0",
        fontSize: "12px",
        color: "#999",
    },
    timelineConnector: {
        position: "absolute",
        top: "20px",
        left: "50%",
        width: "100%",
        height: "2px",
        backgroundColor: "#ddd",
        transform: "translateX(50%)",
        zIndex: -1,
    },
    timelineConnectorCompleted: {
        backgroundColor: "#27ae60",
    },
    trackingBox: {
        backgroundColor: "white",
        padding: "15px",
        borderRadius: "6px",
        marginBottom: "15px",
        borderLeft: "4px solid #3498db",
    },
    trackingTitle: {
        margin: "0 0 10px 0",
        color: "#333",
        fontSize: "16px",
        fontWeight: "bold",
    },
    trackingNumber: {
        margin: "5px 0",
        color: "#666",
        fontSize: "14px",
    },
    estimatedDelivery: {
        margin: "5px 0 0 0",
        color: "#27ae60",
        fontSize: "14px",
        fontWeight: "500",
    },
    historyBox: {
        backgroundColor: "white",
        padding: "15px",
        borderRadius: "6px",
        borderLeft: "4px solid #9b59b6",
    },
    historyTitle: {
        margin: "0 0 15px 0",
        color: "#333",
        fontSize: "16px",
        fontWeight: "bold",
    },
    historyList: {
        display: "flex",
        flexDirection: "column",
    },
    historyItem: {
        display: "flex",
        marginBottom: "15px",
        paddingBottom: "15px",
        borderBottom: "1px solid #eee",
    },
    historyTime: {
        marginRight: "20px",
        minWidth: "100px",
        color: "#999",
        fontSize: "12px",
        fontWeight: "500",
    },
    historyContent: {
        flex: 1,
    },
    historyStatus: {
        margin: "0 0 3px 0",
        color: "#333",
        fontWeight: "bold",
        textTransform: "capitalize",
        fontSize: "14px",
    },
    historyMessage: {
        margin: "0",
        color: "#666",
        fontSize: "13px",
    },
};
