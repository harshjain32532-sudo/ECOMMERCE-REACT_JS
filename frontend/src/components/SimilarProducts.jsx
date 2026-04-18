import { useState } from "react";

function SimilarProducts({ currentProduct = {}, similarProducts = [], onProductClick, onAddToCart, onToggleWishlist, wishlist = [] }) {
    const [displayCount, setDisplayCount] = useState(6);

    const displayedProducts = similarProducts.slice(0, displayCount);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>🔍 Similar Products</h2>
                <p style={styles.subtitle}>You might also like these products</p>
            </div>

            {displayedProducts.length > 0 ? (
                <div style={styles.productsGrid}>
                    {displayedProducts.map((product, idx) => {
                        const isInWishlist = wishlist.some(item => item._id === product._id);
                        const discount = product.originalPrice ?
                            Math.round((1 - product.price / product.originalPrice) * 100) : 0;

                        return (
                            <div
                                key={idx}
                                onClick={() => onProductClick(product)}
                                style={{
                                    ...styles.productCard,
                                    animation: `fadeIn 0.5s ease ${idx * 0.05}s both`,
                                }}
                            >
                                {/* Image Container */}
                                <div style={styles.imageContainer}>
                                    {product.image && (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            style={styles.image}
                                        />
                                    )}

                                    {/* Discount Badge */}
                                    {discount > 0 && (
                                        <div style={styles.discountBadge}>
                                            -{discount}%
                                        </div>
                                    )}

                                    {/* Wishlist Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleWishlist(product);
                                        }}
                                        style={{
                                            ...styles.wishlistBtn,
                                            color: isInWishlist ? "#e74c3c" : "#ccc",
                                        }}
                                    >
                                        ♥
                                    </button>
                                </div>

                                {/* Product Info */}
                                <div style={styles.info}>
                                    <h3 style={styles.name}>{product.name}</h3>

                                    {/* Rating */}
                                    {product.rating && (
                                        <div style={styles.rating}>
                                            <span style={styles.stars}>
                                                {"★".repeat(Math.floor(product.rating))}
                                            </span>
                                            <span style={styles.ratingText}>
                                                {product.rating} ({product.reviews || 0})
                                            </span>
                                        </div>
                                    )}

                                    {/* Price */}
                                    <div style={styles.priceContainer}>
                                        <span style={styles.price}>₹{product.price}</span>
                                        {product.originalPrice && (
                                            <span style={styles.originalPrice}>
                                                ₹{product.originalPrice}
                                            </span>
                                        )}
                                    </div>

                                    {/* Category Tag */}
                                    {product.category && (
                                        <span style={styles.categoryTag}>
                                            {product.category}
                                        </span>
                                    )}

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddToCart(product);
                                        }}
                                        style={styles.addBtn}
                                    >
                                        🛒 Add to Cart
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={styles.emptyState}>
                    <p style={styles.emptyIcon}>📭</p>
                    <p style={styles.emptyText}>No similar products found</p>
                </div>
            )}

            {/* Load More Button */}
            {similarProducts.length > displayCount && (
                <button
                    onClick={() => setDisplayCount(displayCount + 6)}
                    style={styles.loadMoreBtn}
                >
                    Load More Similar Products
                </button>
            )}

            {/* Info Box */}
            <div style={styles.infoBox}>
                <p style={styles.infoText}>
                    💡 These products are similar based on category, price range, and customer preferences
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        padding: 30,
        borderRadius: 12,
        marginBottom: 30,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        animation: "fadeIn 0.4s ease",
    },
    header: {
        marginBottom: 25,
        paddingBottom: 15,
        borderBottom: "2px solid #f0f0f0",
    },
    title: {
        fontSize: 20,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 6px 0",
    },
    subtitle: {
        fontSize: 12,
        color: "#999",
        margin: 0,
    },
    productsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 16,
        marginBottom: 20,
    },
    productCard: {
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #f0f0f0",
        transition: "all 0.3s ease",
        cursor: "pointer",
        background: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        paddingBottom: "100%",
        background: "#f9f9f9",
        overflow: "hidden",
    },
    image: {
        position: "absolute",
        width: "100%",
        height: "100%",
        objectFit: "contain",
        padding: 10,
        top: 0,
        left: 0,
    },
    discountBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        background: "#e74c3c",
        color: "white",
        padding: "6px 10px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 700,
        zIndex: 10,
    },
    wishlistBtn: {
        position: "absolute",
        top: 10,
        left: 10,
        background: "rgba(255,255,255,0.9)",
        border: "none",
        borderRadius: "50%",
        width: 36,
        height: 36,
        fontSize: 20,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        zIndex: 10,
    },
    info: {
        padding: 12,
    },
    name: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 6px 0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    rating: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginBottom: 8,
    },
    stars: {
        fontSize: 11,
        color: "#FFB700",
    },
    ratingText: {
        fontSize: 10,
        color: "#999",
    },
    priceContainer: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
    },
    price: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2575fc",
    },
    originalPrice: {
        fontSize: 11,
        color: "#999",
        textDecoration: "line-through",
    },
    categoryTag: {
        display: "inline-block",
        fontSize: 10,
        color: "#2575fc",
        background: "#e8f4f8",
        padding: "3px 8px",
        borderRadius: 4,
        marginBottom: 10,
        fontWeight: 600,
    },
    addBtn: {
        width: "100%",
        padding: "10px 8px",
        background: "#2575fc",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 11,
        transition: "all 0.3s ease",
    },
    emptyState: {
        textAlign: "center",
        padding: 40,
    },
    emptyIcon: {
        fontSize: 40,
        margin: "0 0 15px 0",
    },
    emptyText: {
        fontSize: 16,
        fontWeight: 700,
        color: "#999",
        margin: 0,
    },
    loadMoreBtn: {
        width: "100%",
        padding: "14px 16px",
        background: "#f0f0f0",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        transition: "all 0.3s ease",
        marginBottom: 15,
    },
    infoBox: {
        background: "#e8f4f8",
        padding: 12,
        borderRadius: 6,
        border: "1px solid #b3e5fc",
        textAlign: "center",
    },
    infoText: {
        fontSize: 11,
        color: "#0277bd",
        margin: 0,
        fontWeight: 500,
    },
};

export default SimilarProducts;
