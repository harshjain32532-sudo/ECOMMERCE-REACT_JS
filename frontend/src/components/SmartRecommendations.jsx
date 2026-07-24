import { useEffect, useState } from "react";
import { getRecommendations, trackProductView } from "../api.js";

export function SmartRecommendations() {
    const [recommendations, setRecommendations] = useState({
        similar: [],
        browsing: [],
        category: []
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("similar");

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        try {
            const res = await getRecommendations();
            setRecommendations(res.data);
        } catch (err) {
            console.error("Failed to load recommendations");
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = async (productId) => {
        try {
            await trackProductView(productId);
        } catch (err) {
            console.error("Failed to track view");
        }
    };

    if (loading) return <div style={styles.loading}>Loading recommendations...</div>;

    const activeRecommendations = {
        similar: { data: recommendations.similar, title: "Similar Products" },
        browsing: { data: recommendations.browsing, title: "Popular Products" },
        category: { data: recommendations.category, title: "Category Recommendations" }
    };

    const currentData = activeRecommendations[activeTab];

    return (
        <div style={styles.container}>
            <h1>💡 Recommended For You</h1>

            {/* Tabs */}
            <div style={styles.tabs}>
                {Object.entries(activeRecommendations).map(([key, { title }]) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        style={{
                            ...styles.tab,
                            ...(activeTab === key && styles.tabActive)
                        }}
                    >
                        {title}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            {currentData.data.length === 0 ? (
                <div style={styles.empty}>
                    <p>No recommendations available yet. Browse more products to get personalized suggestions!</p>
                </div>
            ) : (
                <div style={styles.productsGrid}>
                    {currentData.data.map(product => (
                        <div
                            key={product._id}
                            style={styles.productCard}
                            onClick={() => handleProductClick(product._id)}
                            role="button"
                            tabIndex={0}
                        >
                            {product.image && (
                                <div style={styles.imageContainer}>
                                    <img src={product.image} alt={product.name} style={styles.productImage} />
                                    {product.rating > 4 && (
                                        <div style={styles.popularBadge}>Popular</div>
                                    )}
                                </div>
                            )}
                            <div style={styles.productInfo}>
                                <h3 style={styles.productName}>{product.name}</h3>
                                <p style={styles.productDescription}>
                                    {product.description?.substring(0, 60)}...
                                </p>
                                <div style={styles.productMeta}>
                                    {product.rating > 0 && (
                                        <div style={styles.rating}>
                                            {"⭐".repeat(Math.round(product.rating))}
                                            <span style={styles.ratingValue}>({product.reviewCount})</span>
                                        </div>
                                    )}
                                </div>
                                <div style={styles.productFooter}>
                                    <p style={styles.productPrice}>₹{product.price}</p>
                                    <button style={styles.addButton}>Add to Cart</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recommendation Tips */}
            <div style={styles.tipsBox}>
                <h3>💡 How We Recommend</h3>
                <ul style={styles.tipsList}>
                    <li><strong>Similar Products:</strong> Based on items you've recently viewed</li>
                    <li><strong>Popular Products:</strong> Best-selling items in your favorite categories</li>
                    <li><strong>Category Recommendations:</strong> Top-rated products in categories you like</li>
                </ul>
                <p style={styles.tipsNote}>
                    The more you browse and shop, the better our recommendations become!
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: 20,
    },
    loading: {
        textAlign: "center",
        padding: 40,
        color: "#666",
    },
    tabs: {
        display: "flex",
        gap: 12,
        marginBottom: 30,
        borderBottom: "2px solid #eee",
        paddingBottom: 0,
    },
    tab: {
        padding: "12px 20px",
        border: "none",
        backgroundColor: "transparent",
        color: "#666",
        fontSize: 16,
        fontWeight: "500",
        cursor: "pointer",
        borderBottom: "3px solid transparent",
        transition: "all 0.3s",
    },
    tabActive: {
        color: "#3498db",
        borderBottomColor: "#3498db",
    },
    empty: {
        textAlign: "center",
        padding: 40,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        color: "#666",
    },
    productsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 40,
    },
    productCard: {
        border: "1px solid #ddd",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#fff",
        transition: "all 0.3s ease",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    imageContainer: {
        position: "relative",
        height: 220,
        overflow: "hidden",
    },
    productImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "transform 0.3s",
    },
    popularBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#f39c12",
        color: "white",
        padding: "4px 12px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: "bold",
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        margin: "0 0 8px 0",
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        height: 40,
        overflow: "hidden",
    },
    productDescription: {
        margin: "0 0 8px 0",
        fontSize: 12,
        color: "#999",
        lineHeight: "1.4",
    },
    productMeta: {
        marginBottom: 8,
    },
    rating: {
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        gap: 4,
    },
    ratingValue: {
        color: "#666",
        marginLeft: 4,
        fontSize: 11,
    },
    productFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 8,
        borderTop: "1px solid #eee",
    },
    productPrice: {
        margin: 0,
        fontSize: 14,
        fontWeight: "bold",
        color: "#27ae60",
    },
    addButton: {
        padding: "6px 12px",
        backgroundColor: "#3498db",
        color: "white",
        border: "none",
        borderRadius: 4,
        fontSize: 12,
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background 0.3s",
    },
    tipsBox: {
        padding: 20,
        backgroundColor: "#f0f7ff",
        borderLeft: "4px solid #3498db",
        borderRadius: 8,
    },
    tipsList: {
        margin: "12px 0",
        paddingLeft: 20,
        color: "#666",
        lineHeight: "1.8",
    },
    tipsNote: {
        margin: "12px 0 0 0",
        color: "#666",
        fontSize: 14,
        fontStyle: "italic",
    },
};

export default SmartRecommendations;
