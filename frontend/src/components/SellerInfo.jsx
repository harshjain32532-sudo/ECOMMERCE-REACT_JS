import { useState } from "react";

function SellerInfo({ seller = {}, onFollowSeller, onContactSeller }) {
    const [showDetails, setShowDetails] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    const defaultSeller = {
        id: 1,
        name: "Official Store",
        logo: "🏪",
        rating: 4.8,
        reviews: 25480,
        followers: 156000,
        positiveRating: 98,
        responseTime: "2 hours",
        yearsActive: 8,
        products: 3420,
        city: "Mumbai, India",
        verified: true,
        badge: "Top Seller",
    };

    const currentSeller = { ...defaultSeller, ...seller };

    const handleFollowSeller = () => {
        setIsFollowing(!isFollowing);
        onFollowSeller(currentSeller);
    };

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <div style={styles.header}>
                <div style={styles.logoSection}>
                    <div style={styles.logo}>{currentSeller.logo}</div>
                    <div style={styles.nameSection}>
                        <div style={styles.nameRow}>
                            <h3 style={styles.sellerName}>{currentSeller.name}</h3>
                            {currentSeller.verified && (
                                <span style={styles.verifiedBadge}>✓ Verified</span>
                            )}
                            {currentSeller.badge && (
                                <span style={styles.topSellerBadge}>{currentSeller.badge}</span>
                            )}
                        </div>
                        <p style={styles.location}>📍 {currentSeller.city}</p>
                    </div>
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                    <button
                        onClick={handleFollowSeller}
                        style={{
                            ...styles.followBtn,
                            background: isFollowing ? "#ddd" : "#2575fc",
                            color: isFollowing ? "#666" : "white",
                        }}
                    >
                        {isFollowing ? "❤️ Following" : "+ Follow"}
                    </button>
                    <button
                        onClick={() => onContactSeller(currentSeller)}
                        style={styles.contactBtn}
                    >
                        💬 Contact Seller
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <p style={styles.statValue}>{currentSeller.rating}</p>
                    <p style={styles.statLabel}>Rating</p>
                    <div style={styles.stars}>
                        {"★".repeat(Math.floor(currentSeller.rating))}
                    </div>
                </div>

                <div style={styles.statCard}>
                    <p style={styles.statValue}>{(currentSeller.reviews / 1000).toFixed(1)}K</p>
                    <p style={styles.statLabel}>Reviews</p>
                </div>

                <div style={styles.statCard}>
                    <p style={styles.statValue}>{(currentSeller.followers / 1000).toFixed(0)}K</p>
                    <p style={styles.statLabel}>Followers</p>
                </div>

                <div style={styles.statCard}>
                    <p style={styles.statValue}>{currentSeller.positiveRating}%</p>
                    <p style={styles.statLabel}>Positive Rating</p>
                </div>

                <div style={styles.statCard}>
                    <p style={styles.statValue}>{currentSeller.responseTime}</p>
                    <p style={styles.statLabel}>Response Time</p>
                </div>

                <div style={styles.statCard}>
                    <p style={styles.statValue}>{currentSeller.yearsActive}</p>
                    <p style={styles.statLabel}>Years Active</p>
                </div>
            </div>

            {/* Metrics Section */}
            <div style={styles.metricsSection}>
                <h4 style={styles.metricsTitle}>📊 Seller Performance</h4>

                <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>
                        <span>Order Cancellation Rate</span>
                        <span style={styles.metricValue}>0.2%</span>
                    </div>
                    <div style={styles.metricBar}>
                        <div style={{ ...styles.metricFill, width: "99%" }} />
                    </div>
                </div>

                <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>
                        <span>Order Return Rate</span>
                        <span style={styles.metricValue}>1.5%</span>
                    </div>
                    <div style={styles.metricBar}>
                        <div style={{ ...styles.metricFill, width: "98.5%" }} />
                    </div>
                </div>

                <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>
                        <span>On-time Delivery Rate</span>
                        <span style={styles.metricValue}>99.8%</span>
                    </div>
                    <div style={styles.metricBar}>
                        <div style={{ ...styles.metricFill, width: "99.8%" }} />
                    </div>
                </div>

                <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>
                        <span>Communication Rating</span>
                        <span style={styles.metricValue}>4.9/5</span>
                    </div>
                    <div style={styles.metricBar}>
                        <div style={{ ...styles.metricFill, width: "98%" }} />
                    </div>
                </div>
            </div>

            {/* Policy Section */}
            <div style={styles.policySection}>
                <h4 style={styles.policyTitle}>📋 Seller Policies</h4>
                <div style={styles.policiesGrid}>
                    <div style={styles.policyItem}>
                        <span style={styles.policyIcon}>📦</span>
                        <p style={styles.policyName}>Returns Accepted</p>
                        <p style={styles.policyDesc}>7 days easy returns</p>
                    </div>
                    <div style={styles.policyItem}>
                        <span style={styles.policyIcon}>🚚</span>
                        <p style={styles.policyName}>Free Shipping</p>
                        <p style={styles.policyDesc}>On orders above ₹500</p>
                    </div>
                    <div style={styles.policyItem}>
                        <span style={styles.policyIcon}>✅</span>
                        <p style={styles.policyName}>Genuine Products</p>
                        <p style={styles.policyDesc}>100% authentic</p>
                    </div>
                    <div style={styles.policyItem}>
                        <span style={styles.policyIcon}>🛡️</span>
                        <p style={styles.policyName}>Buyer Protection</p>
                        <p style={styles.policyDesc}>Money-back guarantee</p>
                    </div>
                </div>
            </div>

            {/* Details Toggle */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                style={styles.detailsToggle}
            >
                {showDetails ? "Hide Details ▲" : "Show More Details ▼"}
            </button>

            {/* Expanded Details */}
            {showDetails && (
                <div style={styles.detailsSection}>
                    <h4 style={styles.detailsTitle}>📝 About This Seller</h4>

                    <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Total Products:</span>
                        <span style={styles.detailValue}>{currentSeller.products.toLocaleString()}</span>
                    </div>

                    <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Seller Since:</span>
                        <span style={styles.detailValue}>
                            {new Date().getFullYear() - currentSeller.yearsActive}
                        </span>
                    </div>

                    <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Warehouse Location:</span>
                        <span style={styles.detailValue}>{currentSeller.city}</span>
                    </div>

                    <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Support Availability:</span>
                        <span style={styles.detailValue}>24/7 Chat Support</span>
                    </div>

                    <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Average Response Time:</span>
                        <span style={styles.detailValue}>{currentSeller.responseTime}</span>
                    </div>

                    {/* Recent Reviews */}
                    <div style={styles.reviewsSection}>
                        <h5 style={styles.reviewsTitle}>Recent Customer Reviews</h5>
                        {[
                            { name: "Priya M", rating: 5, text: "Excellent product quality and fast delivery!" },
                            { name: "Rahul K", rating: 5, text: "Great seller, highly recommended!" },
                            { name: "Anjali S", rating: 4, text: "Good product, packaging could be better" },
                        ].map((review, idx) => (
                            <div key={idx} style={styles.reviewItem}>
                                <div style={styles.reviewHeader}>
                                    <span style={styles.reviewName}>{review.name}</span>
                                    <span style={styles.reviewRating}>
                                        {"★".repeat(review.rating)}
                                    </span>
                                </div>
                                <p style={styles.reviewText}>{review.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Seller Note */}
            <div style={styles.noteBox}>
                <p style={styles.note}>
                    ℹ️ This seller has been verified and meets all our quality standards. Shop with confidence!
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        padding: 25,
        borderRadius: 10,
        marginBottom: 25,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0",
        animation: "slideInLeft 0.4s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 25,
        paddingBottom: 20,
        borderBottom: "2px solid #f0f0f0",
    },
    logoSection: {
        display: "flex",
        gap: 15,
        flex: 1,
    },
    logo: {
        fontSize: 40,
        width: 60,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f7ff",
        borderRadius: 10,
    },
    nameSection: {
        flex: 1,
    },
    nameRow: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 4,
    },
    sellerName: {
        fontSize: 18,
        fontWeight: 700,
        color: "#2c3e50",
        margin: 0,
    },
    verifiedBadge: {
        background: "#27ae60",
        color: "white",
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
    },
    topSellerBadge: {
        background: "#ffc107",
        color: "#8b7500",
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
    },
    location: {
        fontSize: 12,
        color: "#666",
        margin: 0,
    },
    actions: {
        display: "flex",
        gap: 10,
    },
    followBtn: {
        padding: "12px 20px",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        transition: "all 0.3s ease",
    },
    contactBtn: {
        padding: "12px 20px",
        background: "#f0f0f0",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        transition: "all 0.3s ease",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
        marginBottom: 25,
    },
    statCard: {
        background: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        textAlign: "center",
        border: "1px solid #f0f0f0",
    },
    statValue: {
        fontSize: 18,
        fontWeight: 700,
        color: "#2575fc",
        margin: "0 0 4px 0",
    },
    statLabel: {
        fontSize: 11,
        color: "#999",
        margin: "4px 0",
    },
    stars: {
        fontSize: 12,
        color: "#FFB700",
    },
    metricsSection: {
        background: "#f9f9f9",
        padding: 18,
        borderRadius: 10,
        marginBottom: 20,
    },
    metricsTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 15px 0",
    },
    metricItem: {
        marginBottom: 12,
    },
    metricLabel: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        fontWeight: 600,
        color: "#555",
        marginBottom: 6,
    },
    metricValue: {
        color: "#2575fc",
    },
    metricBar: {
        height: 6,
        background: "#e0e0e0",
        borderRadius: 3,
        overflow: "hidden",
    },
    metricFill: {
        height: "100%",
        background: "linear-gradient(90deg, #27ae60, #2ecc71)",
        borderRadius: 3,
    },
    policySection: {
        background: "linear-gradient(135deg, #e8f4f8 0%, #e8f4f8 100%)",
        padding: 18,
        borderRadius: 10,
        marginBottom: 20,
        borderLeft: "4px solid #2575fc",
    },
    policyTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 12px 0",
    },
    policiesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
    },
    policyItem: {
        background: "white",
        padding: 12,
        borderRadius: 6,
        textAlign: "center",
        border: "1px solid #ddd",
    },
    policyIcon: {
        display: "block",
        fontSize: 20,
        marginBottom: 6,
    },
    policyName: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 4px 0",
    },
    policyDesc: {
        fontSize: 10,
        color: "#999",
        margin: 0,
    },
    detailsToggle: {
        width: "100%",
        padding: "12px 16px",
        background: "#f0f0f0",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 15,
        transition: "all 0.3s ease",
    },
    detailsSection: {
        background: "#f9f9f9",
        padding: 18,
        borderRadius: 8,
        marginBottom: 15,
        animation: "slideInDown 0.4s ease",
    },
    detailsTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 12px 0",
    },
    detailItem: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        fontSize: 12,
        borderBottom: "1px solid #eee",
    },
    detailLabel: {
        fontWeight: 600,
        color: "#666",
    },
    detailValue: {
        color: "#2c3e50",
        fontWeight: 700,
    },
    reviewsSection: {
        marginTop: 15,
        paddingTop: 15,
        borderTop: "1px solid #e0e0e0",
    },
    reviewsTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 10px 0",
    },
    reviewItem: {
        background: "white",
        padding: 10,
        borderRadius: 6,
        marginBottom: 8,
        border: "1px solid #eee",
    },
    reviewHeader: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    reviewName: {
        fontSize: 11,
        fontWeight: 700,
        color: "#2c3e50",
    },
    reviewRating: {
        fontSize: 10,
        color: "#FFB700",
    },
    reviewText: {
        fontSize: 11,
        color: "#666",
        margin: 0,
    },
    noteBox: {
        background: "#e8f4f8",
        padding: 12,
        borderRadius: 6,
        border: "1px solid #b3e5fc",
        textAlign: "center",
    },
    note: {
        fontSize: 11,
        color: "#0277bd",
        margin: 0,
        fontWeight: 600,
    },
};

export default SellerInfo;
