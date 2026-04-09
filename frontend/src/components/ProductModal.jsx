import { useState } from "react";

function ProductModal({ isOpen, product, onClose, onAddToCart, onToggleWishlist, isInWishlist }) {
    if (!isOpen || !product) return null;

    return (
        <>
            {/* Backdrop */}
            <div style={styles.backdrop} onClick={onClose}></div>

            {/* Modal */}
            <div style={styles.modal}>
                <div style={styles.closeButton} onClick={onClose}>
                    ✕
                </div>

                <div style={styles.content}>
                    {/* Product Image */}
                    <div style={styles.imageSection}>
                        {product.image && (
                            <img src={product.image} alt={product.name} style={styles.image} />
                        )}
                    </div>

                    {/* Product Details */}
                    <div style={styles.detailsSection}>
                        <h2 style={styles.title}>{product.name}</h2>

                        <div style={styles.priceSection}>
                            <span style={styles.price}>₹{product.price}</span>
                            <span style={styles.stock}>
                                {product.stock > 0 ? (
                                    <span style={styles.inStock}>In Stock</span>
                                ) : (
                                    <span style={styles.outOfStock}>Out of Stock</span>
                                )}
                            </span>
                        </div>

                        <div style={styles.description}>
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>

                        {product.category && (
                            <div style={styles.info}>
                                <strong>Category:</strong> {product.category}
                            </div>
                        )}

                        {product.stock !== undefined && (
                            <div style={styles.info}>
                                <strong>Available Stock:</strong> {product.stock}
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
        transition: "background 0.2s, transform 0.2s",
        background: "rgba(255,255,255,0.95)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
    },
    content: {
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 24,
    },
    imageSection: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
    },
    image: {
        maxWidth: "100%",
        height: "auto",
        maxHeight: 320,
        borderRadius: 18,
        objectFit: "cover",
        border: "2px solid rgba(142, 68, 173, 0.18)",
    },
    detailsSection: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        margin: "0 0 10px 0",
        color: "#2c2663",
    },
    priceSection: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 18,
        paddingBottom: 18,
        borderBottom: "1px solid rgba(74, 58, 255, 0.12)",
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
        background: "#e9d5ff",
        color: "#5b21b6",
        padding: "6px 16px",
        borderRadius: 999,
        fontSize: 14,
        fontWeight: "700",
    },
    outOfStock: {
        background: "#fed7d7",
        color: "#991b1b",
        padding: "6px 16px",
        borderRadius: 999,
        fontSize: 14,
        fontWeight: "700",
    },
    description: {
        marginBottom: 18,
        color: "#4b4b71",
        lineHeight: 1.75,
    },
    info: {
        fontSize: 15,
        color: "#4b4b71",
        marginBottom: 10,
    },
    buttonGroup: {
        display: "flex",
        gap: 14,
        marginTop: 12,
        flexWrap: "wrap",
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
        transition: "transform 0.2s, box-shadow 0.2s",
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
        transition: "transform 0.2s, background 0.2s, color 0.2s",
        background: "#fff",
        color: "#f97316",
    },
};

export default ProductModal;
