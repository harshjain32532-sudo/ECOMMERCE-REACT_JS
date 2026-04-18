import { useState } from "react";

function RecentlyViewed({ products = [], onProductClick, onAddToCart, maxItems = 6 }) {
    const displayProducts = products.slice(0, maxItems);

    if (!products || products.length === 0) return null;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>🕐 Recently Viewed</h3>
                <a href="#" style={styles.clearLink}>Clear History</a>
            </div>

            <div style={styles.productsCarousel}>
                {displayProducts.map((product, idx) => (
                    <div
                        key={`${product._id}-${idx}`}
                        onClick={() => onProductClick(product)}
                        style={{
                            ...styles.productTile,
                            animation: `fadeIn 0.5s ease ${idx * 0.05}s both`,
                        }}
                    >
                        {/* Image */}
                        <div style={styles.imageContainer}>
                            {product.image && (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={styles.image}
                                />
                            )}
                        </div>

                        {/* Info */}
                        <div style={styles.info}>
                            <h4 style={styles.name}>{product.name}</h4>
                            <p style={styles.price}>₹{product.price}</p>

                            {product.rating && (
                                <div style={styles.rating}>
                                    ⭐ {product.rating}
                                </div>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToCart(product);
                                }}
                                style={styles.addButton}
                            >
                                Add to Cart
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
        background: "white",
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
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
        fontSize: 18,
        fontWeight: 700,
        color: "#2c3e50",
        margin: 0,
    },
    clearLink: {
        color: "#2575fc",
        fontSize: 12,
        textDecoration: "none",
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    productsCarousel: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 16,
        overflowX: "auto",
    },
    productTile: {
        borderRadius: 10,
        border: "1px solid #f0f0f0",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    },
    imageContainer: {
        width: "100%",
        height: 120,
        background: "#f9f9f9",
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
        padding: 8,
    },
    info: {
        padding: 12,
    },
    name: {
        fontSize: 12,
        fontWeight: 600,
        color: "#2c3e50",
        margin: "0 0 4px 0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    price: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2575fc",
        margin: "4px 0",
    },
    rating: {
        fontSize: 11,
        color: "#FFB700",
        marginBottom: 8,
    },
    addButton: {
        width: "100%",
        padding: "6px 8px",
        background: "linear-gradient(135deg, #2575fc 0%, #1e5dcc 100%)",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
};

export default RecentlyViewed;
