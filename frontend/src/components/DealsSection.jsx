import { useState, useEffect } from "react";

function DealsSection({ deals = [], onAddToCart }) {
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeLeft = {};
            deals.forEach(deal => {
                if (deal.endTime) {
                    const now = new Date();
                    const end = new Date(deal.endTime);
                    const diff = end - now;
                    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                    const minutes = Math.floor((diff / (1000 * 60)) % 60);
                    const seconds = Math.floor((diff / 1000) % 60);
                    newTimeLeft[deal.id] = { hours, minutes, seconds };
                }
            });
            setTimeLeft(newTimeLeft);
        }, 1000);
        return () => clearInterval(interval);
    }, [deals]);

    if (!deals || deals.length === 0) return null;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>🔥 Flash Deals</h2>
                <div style={styles.timer}>
                    ⏰ Hurry Up!
                </div>
            </div>

            <div style={styles.dealsGrid}>
                {deals.map((deal, idx) => (
                    <div
                        key={deal.id}
                        style={{
                            ...styles.dealCard,
                            animation: `slideInUp 0.5s ease ${idx * 0.1}s both`,
                        }}
                    >
                        {/* Discount Badge */}
                        <div style={styles.discountBanner}>
                            {deal.discountPercent}% OFF
                        </div>

                        {/* Time Left */}
                        {deal.endTime && timeLeft[deal.id] && (
                            <div style={styles.timeLeft}>
                                ⏱️ {timeLeft[deal.id].hours}h {timeLeft[deal.id].minutes}m
                            </div>
                        )}

                        {/* Product Image */}
                        {deal.image && (
                            <img src={deal.image} alt={deal.name} style={styles.dealImage} />
                        )}

                        {/* Product Info */}
                        <div style={styles.dealInfo}>
                            <h3 style={styles.dealName}>{deal.name}</h3>

                            <div style={styles.priceSection}>
                                <span style={styles.salePrice}>₹{deal.salePrice}</span>
                                <span style={styles.originalPrice}>₹{deal.originalPrice}</span>
                            </div>

                            {deal.soldCount !== undefined && (
                                <div style={styles.soldInfo}>
                                    {deal.soldCount} sold
                                </div>
                            )}

                            {/* Progress Bar */}
                            <div style={styles.progressContainer}>
                                <div
                                    style={{
                                        ...styles.progressBar,
                                        width: `${Math.min(deal.soldCount / deal.totalLimit * 100, 100)}%`,
                                    }}
                                />
                            </div>

                            <button
                                onClick={() => onAddToCart(deal)}
                                style={styles.addButton}
                            >
                                🛒 Buy Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 30,
        overflow: "hidden",
        animation: "fadeIn 0.6s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 700,
        color: "#d9534f",
        margin: 0,
    },
    timer: {
        background: "#d9534f",
        color: "white",
        padding: "8px 16px",
        borderRadius: 20,
        fontWeight: 600,
        fontSize: 14,
        animation: "pulse 2s ease-in-out infinite",
    },
    dealsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
    },
    dealCard: {
        background: "white",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        position: "relative",
    },
    discountBanner: {
        position: "absolute",
        top: 10,
        left: 10,
        background: "linear-gradient(135deg, #d9534f 0%, #c0392b 100%)",
        color: "white",
        padding: "8px 12px",
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 12,
        zIndex: 10,
    },
    timeLeft: {
        position: "absolute",
        top: 10,
        right: 10,
        background: "#2575fc",
        color: "white",
        padding: "6px 10px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        zIndex: 10,
    },
    dealImage: {
        width: "100%",
        height: 180,
        objectFit: "contain",
        background: "#f5f5f5",
        padding: 20,
    },
    dealInfo: {
        padding: 16,
    },
    dealName: {
        fontSize: 14,
        fontWeight: 600,
        color: "#2c3e50",
        margin: "0 0 10px 0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    priceSection: {
        display: "flex",
        gap: 10,
        marginBottom: 8,
        alignItems: "center",
    },
    salePrice: {
        fontSize: 18,
        fontWeight: 700,
        color: "#27ae60",
    },
    originalPrice: {
        fontSize: 14,
        color: "#999",
        textDecoration: "line-through",
    },
    soldInfo: {
        fontSize: 12,
        color: "#999",
        marginBottom: 8,
    },
    progressContainer: {
        width: "100%",
        height: 6,
        background: "#e0e0e0",
        borderRadius: 3,
        overflow: "hidden",
        marginBottom: 12,
    },
    progressBar: {
        height: "100%",
        background: "linear-gradient(90deg, #27ae60 0%, #229954 100%)",
        transition: "width 0.5s ease",
    },
    addButton: {
        width: "100%",
        padding: 12,
        background: "linear-gradient(135deg, #d9534f 0%, #c0392b 100%)",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
};

export default DealsSection;
