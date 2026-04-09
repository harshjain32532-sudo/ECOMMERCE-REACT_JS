import { useEffect, useState } from "react";
import { getProducts } from "../api.js";
import ProductModal from "../components/ProductModal.jsx";

function Home({ addToCart, wishlist = [], onToggleWishlist }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hoveredProductId, setHoveredProductId] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await getProducts();
            setProducts(res.data);
        } catch (err) {
            setError("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const isProductInWishlist = (productId) => {
        return wishlist.some(w => w.productId === productId || w._id === productId);
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>🏪 Welcome to Our Store</h1>
            {error && <div style={styles.error}>{error}</div>}
            {loading ? (
                <p>Loading products...</p>
            ) : products.length === 0 ? (
                <p>No products available.</p>
            ) : (
                <div style={styles.grid}>
                    {products.map(p => (
                        <div
                            key={p._id}
                            onMouseEnter={() => setHoveredProductId(p._id)}
                            onMouseLeave={() => setHoveredProductId(null)}
                            style={{
                                ...styles.card,
                                transform: hoveredProductId === p._id ? "translateY(-8px) scale(1.02)" : "translateY(0)",
                                boxShadow: hoveredProductId === p._id ? "0 20px 42px rgba(85, 48, 118, 0.18)" : styles.card.boxShadow,
                            }}
                        >
                            {p.image && (
                                <img src={p.image} alt={p.name} style={styles.image} />
                            )}
                            <h3>{p.name}</h3>
                            <p style={styles.price}>₹{p.price}</p>
                            <p style={styles.description}>{p.description}</p>
                            <p style={styles.stock}>Stock: {p.stock}</p>
                            <div style={styles.buttonGroup}>
                                <button
                                    onClick={() => handleQuickView(p)}
                                    style={styles.quickViewButton}
                                >
                                    👁️ Quick View
                                </button>
                                <button
                                    onClick={() => addToCart(p)}
                                    style={styles.button}
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => onToggleWishlist(p)}
                                    style={{
                                        ...styles.secondaryButton,
                                        background: isProductInWishlist(p._id) ? "#e74c3c" : "#f5f5f5",
                                        color: isProductInWishlist(p._id) ? "#fff" : "#333",
                                    }}
                                >
                                    {isProductInWishlist(p._id) ? "❤️ Remove" : "🤍 Add"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ProductModal
                isOpen={isModalOpen}
                product={selectedProduct}
                onClose={handleCloseModal}
                onAddToCart={addToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={selectedProduct ? isProductInWishlist(selectedProduct._id) : false}
            />
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: 20,
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, #ffebf8 0%, transparent 40%), linear-gradient(180deg, #f3f9ff 0%, #ffffff 40%, #e8f5ff 100%)",
    },
    title: {
        fontSize: 42,
        margin: "0 0 12px",
        color: "#3e2a73",
        textShadow: "0 2px 18px rgba(63, 43, 91, 0.16)",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 26,
        marginTop: 24,
    },
    card: {
        borderRadius: 24,
        padding: 22,
        background: "linear-gradient(180deg, #ffffff 0%, #f4ebff 100%)",
        boxShadow: "0 18px 40px rgba(70, 42, 132, 0.12)",
        border: "1px solid rgba(147, 85, 204, 0.16)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        cursor: "pointer",
    },
    cardHover: {},
    buttonGroup: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginTop: 14,
    },
    quickViewButton: {
        flex: 1,
        minWidth: 100,
        padding: 12,
        background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 14,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: "700",
        transition: "transform 0.2s, background 0.2s",
        boxShadow: "0 12px 22px rgba(155, 89, 182, 0.22)",
    },
    button: {
        flex: 1,
        minWidth: 120,
        padding: 12,
        background: "linear-gradient(135deg, #35aee3 0%, #2a80e6 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 14,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: "700",
        transition: "transform 0.2s, background 0.2s",
        boxShadow: "0 12px 22px rgba(52, 152, 219, 0.22)",
    },
    secondaryButton: {
        flex: 1,
        minWidth: 100,
        padding: 12,
        background: "#ffffff",
        color: "#333",
        border: "1px solid rgba(142, 68, 173, 0.24)",
        borderRadius: 14,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: "700",
        transition: "transform 0.2s, background 0.2s, color 0.2s",
    },
    image: {
        width: "100%",
        height: 220,
        objectFit: "contain",
        objectPosition: "center",
        backgroundColor: "#f2f4ff",
        borderRadius: 16,
        marginBottom: 14,
    },
    price: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2c3e50",
        margin: "10px 0 6px",
    },
    description: {
        fontSize: 13,
        color: "#5a5a79",
        margin: "8px 0",
        lineHeight: 1.6,
        minHeight: 54,
    },
    stock: {
        fontSize: 13,
        color: "#7f8c8d",
        margin: "8px 0",
    },
    error: {
        color: "#9c1b32",
        padding: 14,
        background: "#ffe3e6",
        borderRadius: 12,
        border: "1px solid #f2c1cc",
        marginTop: 12,
    },
};

export default Home;
