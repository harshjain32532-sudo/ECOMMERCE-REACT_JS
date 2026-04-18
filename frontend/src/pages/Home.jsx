import { useEffect, useState } from "react";
import { getProducts } from "../api.js";
import ProductModal from "../components/ProductModal.jsx";

function Home({ addToCart, wishlist = [], onToggleWishlist }) {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hoveredProductId, setHoveredProductId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("name");
    const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await getProducts();
            setProducts(res.data);
            filterAndSortProducts(res.data, searchTerm, sortOption, priceRange);
        } catch (err) {
            setError("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProducts = (productList, search, sort, price) => {
        let filtered = productList.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase());
            const matchesPrice = p.price >= price.min && p.price <= price.max;
            return matchesSearch && matchesPrice;
        });

        // Sort products
        if (sort === "name") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === "price-low") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sort === "price-high") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sort === "newest") {
            filtered.reverse();
        }

        setFilteredProducts(filtered);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        filterAndSortProducts(products, value, sortOption, priceRange);
    };

    const handleSort = (value) => {
        setSortOption(value);
        filterAndSortProducts(products, searchTerm, value, priceRange);
    };

    const handlePriceFilter = (min, max) => {
        const newRange = { min, max };
        setPriceRange(newRange);
        filterAndSortProducts(products, searchTerm, sortOption, newRange);
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

    const getMaxPrice = () => {
        return products.length > 0 ? Math.max(...products.map(p => p.price)) : 10000;
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>🏪 Welcome to Our Store</h1>

            {/* Search & Filter Section */}
            <div style={styles.searchFilterSection}>
                <div style={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="🔍 Search products..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        ...styles.filterToggleBtn,
                        background: showFilters ? "linear-gradient(135deg, #6a11cb, #2575fc)" : "#f5f5f5",
                        color: showFilters ? "#fff" : "#333",
                    }}
                >
                    ⚙️ {showFilters ? "Hide" : "Show"} Filters
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div style={styles.filterPanel}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Sort By:</label>
                        <select
                            value={sortOption}
                            onChange={(e) => handleSort(e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="name">Product Name (A-Z)</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Price Range:</label>
                        <div style={styles.priceInputGroup}>
                            <input
                                type="number"
                                placeholder="Min"
                                min="0"
                                max={getMaxPrice()}
                                value={priceRange.min === 0 ? '' : priceRange.min}
                                onChange={(e) => handlePriceFilter(e.target.value ? parseInt(e.target.value) : 0, priceRange.max)}
                                style={styles.priceInput}
                            />
                            <span style={styles.priceSeparator}>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                min="0"
                                max={getMaxPrice()}
                                value={priceRange.max === Infinity ? '' : priceRange.max}
                                onChange={(e) => handlePriceFilter(priceRange.min, e.target.value ? parseInt(e.target.value) : Infinity)}
                                style={styles.priceInput}
                            />
                        </div>
                    </div>
                </div>
            )}

            {error && <div style={styles.error}>{error}</div>}

            {/* Results Count */}
            {!loading && (
                <p style={styles.resultsCount}>
                    Found <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>
            )}

            {/* Loading State */}
            {loading ? (
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading products...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={styles.emptyIcon}>🔍</p>
                    <p>No products found. Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {filteredProducts.map((p, idx) => (
                        <div
                            key={p._id}
                            onMouseEnter={() => setHoveredProductId(p._id)}
                            onMouseLeave={() => setHoveredProductId(null)}
                            style={{
                                ...styles.card,
                                transform: hoveredProductId === p._id ? "translateY(-8px) scale(1.02)" : "translateY(0)",
                                boxShadow: hoveredProductId === p._id ? "0 20px 42px rgba(85, 48, 118, 0.18)" : styles.card.boxShadow,
                                animation: `fadeIn 0.5s ease ${idx * 0.05}s both`,
                            }}
                        >
                            {p.stock <= 0 && <div style={styles.outOfStock}>Out of Stock</div>}
                            {p.image && (
                                <img src={p.image} alt={p.name} style={styles.image} />
                            )}
                            <h3 style={styles.productName}>{p.name}</h3>
                            <p style={styles.price}>₹{p.price}</p>
                            <p style={styles.description}>{p.description}</p>
                            <p style={styles.stock}>📦 Stock: {p.stock}</p>
                            <div style={styles.buttonGroup}>
                                <button
                                    onClick={() => handleQuickView(p)}
                                    style={styles.quickViewButton}
                                    disabled={p.stock <= 0}
                                >
                                    👁️ Quick View
                                </button>
                                <button
                                    onClick={() => addToCart(p)}
                                    style={styles.button}
                                    disabled={p.stock <= 0}
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
        animation: "fadeIn 0.6s ease",
    },
    title: {
        fontSize: 42,
        margin: "0 0 12px",
        color: "#3e2a73",
        textShadow: "0 2px 18px rgba(63, 43, 91, 0.16)",
        animation: "slideInLeft 0.6s ease",
    },
    searchFilterSection: {
        display: "flex",
        gap: 16,
        marginBottom: 24,
        flexWrap: "wrap",
        alignItems: "center",
        animation: "slideInLeft 0.6s ease 0.1s both",
    },
    searchBox: {
        flex: 1,
        minWidth: 250,
    },
    searchInput: {
        width: "100%",
        padding: "14px 18px",
        fontSize: 15,
        border: "2px solid #e0e0e0",
        borderRadius: 12,
        background: "#fff",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    },
    filterToggleBtn: {
        padding: "12px 24px",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    filterPanel: {
        background: "white",
        border: "2px solid rgba(147, 85, 204, 0.16)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 20,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
        animation: "slideInDown 0.4s ease",
    },
    filterGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
    },
    filterLabel: {
        fontWeight: 600,
        color: "#333",
        fontSize: 14,
    },
    filterSelect: {
        padding: "10px 12px",
        borderRadius: 8,
        border: "2px solid #e0e0e0",
        background: "#fff",
        cursor: "pointer",
        fontSize: 14,
        transition: "all 0.3s ease",
    },
    priceInputGroup: {
        display: "flex",
        gap: 8,
        alignItems: "center",
    },
    priceInput: {
        flex: 1,
        padding: "10px 12px",
        borderRadius: 8,
        border: "2px solid #e0e0e0",
        fontSize: 14,
        transition: "all 0.3s ease",
    },
    priceSeparator: {
        color: "#999",
        fontWeight: 600,
    },
    resultsCount: {
        fontSize: 14,
        color: "#666",
        marginBottom: 16,
        animation: "fadeIn 0.4s ease",
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
        gap: 16,
    },
    spinner: {
        width: 50,
        height: 50,
        border: "4px solid rgba(0, 0, 0, 0.1)",
        borderTopColor: "#2575fc",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
    emptyState: {
        textAlign: "center",
        padding: 60,
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(147, 85, 204, 0.1), rgba(37, 117, 252, 0.1))",
        animation: "fadeIn 0.5s ease",
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
        animation: "bounce 2s ease-in-out infinite",
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
        position: "relative",
        overflow: "hidden",
    },
    outOfStock: {
        position: "absolute",
        top: 12,
        right: 12,
        background: "#e74c3c",
        color: "white",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        zIndex: 10,
    },
    productName: {
        fontSize: 18,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 8,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
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
        transition: "transform 0.2s, background 0.2s, opacity 0.2s",
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
        transition: "transform 0.2s, background 0.2s, opacity 0.2s",
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
        transition: "transform 0.3s ease",
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
        fontWeight: 500,
    },
    error: {
        color: "#9c1b32",
        padding: 14,
        background: "#ffe3e6",
        borderRadius: 12,
        border: "1px solid #f2c1cc",
        marginTop: 12,
        animation: "slideInDown 0.4s ease",
    },
};

export default Home;
