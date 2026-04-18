import { useState } from "react";

function ProductModal({ isOpen, product, onClose, onAddToCart, onToggleWishlist, isInWishlist }) {
    const [isHovered, setIsHovered] = useState(false);

    if (!isOpen || !product) return null;

    return (
        <>
            {/* Backdrop */}
            <div style={styles.backdrop} onClick={onClose}></div>

            {/* Modal */}
            <div style={styles.modal}>
                <div
                    style={styles.closeButton}
                    onClick={onClose}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#7c3aed";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.transform = "scale(1.1) rotate(90deg)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.95)";
                        e.currentTarget.style.color = "#4b4b6a";
                        e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                    }}
                >
                    ✕
                </div>

                <div style={styles.content}>
                    {/* Product Image */}
                    <div style={styles.imageSection}>
                        {product.image && (
                            <img
                                src={product.image}
                                alt={product.name}
                                style={styles.image}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            />
                        )}
                    </div>

                    {/* Product Details */}
                    <div style={styles.detailsSection}>
                        <h2 style={styles.title}>{product.name}</h2>

                        <div style={styles.priceSection}>
                            <span style={styles.price}>₹{product.price}</span>
                            <span style={styles.stock}>
                                {product.stock > 0 ? (
                                    <span style={styles.inStock}>✓ In Stock</span>
                                ) : (
                                    <span style={styles.outOfStock}>✕ Out of Stock</span>
                                )}
                            </span>
                        </div>

                        <div style={styles.description}>
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>

                        {product.category && (
                            <div style={styles.info}>
                                <strong>📂 Category:</strong> {product.category}
                            </div>
                        )}

                        {product.stock !== undefined && (
                            <div style={styles.info}>
                                <strong>📦 Available Stock:</strong> {product.stock} units
                            </div>
                        )}

                        {/* Buttons */}
                        <div style={styles.buttonGroup}>
                            <button
                                onClick={() => {
                                    onAddToCart(product);
                                    onClose();
                                }}
                                disabled={product.stock === 0}
                                style={{
                                    ...styles.addToCartButton,
                                    opacity: product.stock === 0 ? 0.5 : 1,
                                    cursor: product.stock === 0 ? "not-allowed" : "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    if (product.stock > 0) {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 16px 32px rgba(124, 58, 237, 0.3)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = styles.addToCartButton.boxShadow;
                                }}
                            >
                                🛒 Add to Cart
                            </button>

                            <button
                                onClick={() => {
                                    onToggleWishlist(product);
                                    onClose();
                                }}
                                style={{
                                    ...styles.wishlistButton,
                                    background: isInWishlist ? "#e74c3c" : "#f5f5f5",
                                    color: isInWishlist ? "#fff" : "#333",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 12px 24px rgba(233, 30, 99, 0.2)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                {isInWishlist ? "❤️ Remove from Wishlist" : "🤍 Add to Wishlist"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    backdrop: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(16, 24, 40, 0.75)",
        zIndex: 999,
        backdropFilter: "blur(5px)",
        animation: "fadeIn 0.3s ease",
    },
    modal: {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "linear-gradient(180deg, #ffffff 0%, #f4f2ff 100%)",
        borderRadius: 26,
        boxShadow: "0 25px 60px rgba(79, 70, 229, 0.18)",
        zIndex: 1000,
        maxWidth: 700,
        width: "95%",
        maxHeight: "90vh",
        overflow: "auto",
        border: "1px solid rgba(142, 68, 173, 0.16)",
        animation: "slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        fontSize: 26,
        cursor: "pointer",
        color: "#4b4b6a",
        fontWeight: "bold",
        zIndex: 1001,
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        transition: "background 0.3s ease, color 0.3s ease, transform 0.3s ease",
        background: "rgba(255,255,255,0.95)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
    },
    content: {
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        animation: "fadeIn 0.5s ease 0.1s both",
    },
    imageSection: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: 18,
    },
    image: {
        maxWidth: "100%",
        height: "auto",
        maxHeight: 320,
        borderRadius: 18,
        objectFit: "cover",
        border: "2px solid rgba(142, 68, 173, 0.18)",
        transition: "transform 0.4s ease",
    },
    detailsSection: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        margin: "0 0 10px 0",
        color: "#2c2663",
        animation: "slideInLeft 0.5s ease 0.15s both",
    },
    priceSection: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 18,
        paddingBottom: 18,
        borderBottom: "2px solid rgba(124, 58, 237, 0.2)",
        animation: "slideInLeft 0.5s ease 0.2s both",
    },
    price: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#5b21b6",
        textShadow: "0 1px 10px rgba(91, 33, 182, 0.14)",
    },
    stock: {
        marginLeft: "auto",
    },
    inStock: {
        background: "linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%)",
        color: "#5b21b6",
        padding: "8px 16px",
        borderRadius: 999,
        fontSize: 14,
        fontWeight: "700",
        boxShadow: "0 4px 12px rgba(167, 139, 250, 0.2)",
        border: "1px solid rgba(167, 139, 250, 0.3)",
    },
    outOfStock: {
        background: "linear-gradient(135deg, #fed7d7 0%, #fecaca 100%)",
        color: "#991b1b",
        padding: "8px 16px",
        borderRadius: 999,
        fontSize: 14,
        fontWeight: "700",
        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
    },
    description: {
        marginBottom: 18,
        color: "#4b4b71",
        lineHeight: 1.75,
        animation: "slideInLeft 0.5s ease 0.25s both",
    },
    info: {
        fontSize: 15,
        color: "#4b4b71",
        marginBottom: 10,
        animation: "slideInLeft 0.5s ease 0.3s both",
        fontWeight: 500,
    },
    buttonGroup: {
        display: "flex",
        gap: 14,
        marginTop: 12,
        flexWrap: "wrap",
        animation: "slideInLeft 0.5s ease 0.35s both",
    },
    addToCartButton: {
        flex: 1,
        minWidth: 150,
        padding: 14,
        background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: "700",
        cursor: "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        boxShadow: "0 12px 24px rgba(124, 58, 237, 0.2)",
    },
    wishlistButton: {
        flex: 1,
        minWidth: 150,
        padding: 14,
        border: "2px solid #f97316",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: "700",
        cursor: "pointer",
        transition: "transform 0.3s ease, background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
        background: "#fff",
        color: "#f97316",
    },
};

export default ProductModal;
