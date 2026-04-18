import { useState } from "react";

function ProductShowcase({ title, products = [], onAddToCart, onToggleWishlist, wishlist = [], type = "bestsellers" }) {
    const [hoveredId, setHoveredId] = useState(null);

    const getIcon = () => {
        switch (type) {
            case "bestsellers": return "🏆";
            case "trending": return "🔥";
            case "newarrival": return "✨";
            case "recommendation": return "💡";
            default: return "⭐";
        }
    };

    const isProductInWishlist = (productId) => {
        return wishlist.some(w => w.productId === productId || w._id === productId);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>
                    {getIcon()} {title}
                </h2>
                <a href="#" style={styles.viewAll}>View All →</a>
            </div>

            <div style={styles.productsGrid}>
                {products.map((product, idx) => (
                    <div
                        key={product._id}
                        onMouseEnter={() => setHoveredId(product._id)}
                        onMouseLeave={() => setHoveredId(null)}
                        style={{
                            ...styles.productCard,
                            transform: hoveredId === product._id ? "translateY(-8px) scale(1.02)" : "translateY(0)",
                            boxShadow: hoveredId === product._id ? "0 12px 24px rgba(0,0,0,0.15)" : styles.productCard.boxShadow,
                            animation: `fadeIn 0.5s ease ${idx * 0.05}s both`,
                        }}
                    >
                        {/* Discount Badge */}
                        {product.discount && (
                            <div style={styles.discountBadge}>
                                -{product.discount}%
                            </div>
                        )}

                        {/* Image */}
                        <div style={styles.imageContainer}>
                            {product.image && (
                                <img src={product.image} alt={product.name} style={styles.image} />
                            )}
                        </div>

                        {/* Rating */}
                        {product.rating && (
                            <div style={styles.ratingBadge}>
                                ⭐ {product.rating} ({product.reviewCount || 0})
                            </div>
                        )}

                        {/* Info */}
                        <div style={styles.info}>
                            <h3 style={styles.name}>{product.name}</h3>
                            <p style={styles.category}>{product.category}</p>

                            {/* Price */}
                            <div style={styles.priceContainer}>
                                <span style={styles.currentPrice}>₹{product.price}</span>
                                {product.originalPrice && (
                                    <span style={styles.originalPrice}>₹{product.originalPrice}</span>
                                )}
                            </div>

                            {/* Buttons */}
                            <div style={styles.buttonGroup}>
                                <button
                                    onClick={() => onAddToCart(product)}
                                    style={styles.addButton}
                                >
                                    🛒 Add
                                </button>
                                <button
                                    onClick={() => onToggleWishlist(product)}
                                    style={{
                                        ...styles.wishlistBtn,
                                        background: isProductInWishlist(product._id) ? "#e74c3c" : "#f5f5f5",
                                    }}
                                >
                                    {isProductInWishlist(product._id) ? "❤️" : "🤍"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        marginBottom: 40,
        padding: 20,
        background: "white",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        animation: "fadeIn 0.6s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottom: "2px solid #f0f0f0",
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: "#2c3e50",
        margin: 0,
    },
    viewAll: {
        color: "#2575fc",
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
        transition: "all 0.3s ease",
    },
    productsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
    },
    productCard: {
        borderRadius: 12,
        overflow: "hidden",
        background: "white",
        border: "1px solid #f0f0f0",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "relative",
    },
    discountBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        background: "#e74c3c",
        color: "white",
        padding: "6px 12px",
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 12,
        zIndex: 10,
    },
    imageContainer: {
        width: "100%",
        height: 160,
        background: "#f9f9f9",
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
        padding: 10,
    },
    ratingBadge: {
        background: "#2575fc",
        color: "white",
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 600,
        margin: "8px",
        borderRadius: 6,
        display: "inline-block",
    },
    info: {
        padding: "12px",
    },
    name: {
        fontSize: 14,
        fontWeight: 600,
        color: "#2c3e50",
        margin: "0 0 4px 0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    category: {
        fontSize: 12,
        color: "#999",
        margin: "0 0 8px 0",
    },
    priceContainer: {
        marginBottom: 10,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: 700,
        color: "#2575fc",
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 12,
        color: "#999",
        textDecoration: "line-through",
    },
    buttonGroup: {
        display: "flex",
        gap: 8,
    },
    addButton: {
        flex: 1,
        padding: "8px 12px",
        background: "linear-gradient(135deg, #2575fc 0%, #1e5dcc 100%)",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 12,
        transition: "all 0.3s ease",
    },
    wishlistBtn: {
        width: 40,
        height: 40,
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 16,
        transition: "all 0.3s ease",
    },
};

export default ProductShowcase;
