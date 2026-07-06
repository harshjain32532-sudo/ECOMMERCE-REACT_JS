import { useEffect, useState } from "react";
import { searchProducts, getFilterOptions, applyCoupon } from "../api.js";

export function ProductSearch() {
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        category: "",
        minPrice: 0,
        maxPrice: 10000,
        minRating: 0,
        tags: []
    });
    const [filterOptions, setFilterOptions] = useState({
        categories: [],
        tags: [],
        priceRange: { minPrice: 0, maxPrice: 10000 },
        ratings: []
    });
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(null);
    const [cartTotal, setCartTotal] = useState(1000); // Example cart total

    useEffect(() => {
        loadFilterOptions();
        searchProducts();
    }, []);

    const loadFilterOptions = async () => {
        try {
            const res = await getFilterOptions();
            setFilterOptions(res.data);
        } catch (err) {
            console.error("Failed to load filter options");
        }
    };

    const searchProducts = async () => {
        setLoading(true);
        try {
            const res = await searchProducts(query, filters);
            setProducts(res.data);
        } catch (err) {
            console.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterName, value) => {
        const newFilters = { ...filters, [filterName]: value };
        setFilters(newFilters);
        performSearch(newFilters);
    };

    const handlePriceChange = (type, value) => {
        const newFilters = { ...filters };
        if (type === "min") newFilters.minPrice = parseFloat(value);
        if (type === "max") newFilters.maxPrice = parseFloat(value);
        setFilters(newFilters);
        performSearch(newFilters);
    };

    const handleTagToggle = (tag) => {
        const newTags = filters.tags.includes(tag)
            ? filters.tags.filter(t => t !== tag)
            : [...filters.tags, tag];
        handleFilterChange("tags", newTags);
    };

    const performSearch = async (filtersToUse) => {
        setLoading(true);
        try {
            const res = await searchProducts(query, filtersToUse);
            setProducts(res.data);
        } catch (err) {
            console.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        try {
            const res = await applyCoupon(couponCode, cartTotal);
            if (res.data.valid) {
                setCouponDiscount(res.data.coupon);
            }
        } catch (err) {
            setCouponDiscount(null);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.layout}>
                {/* Filters Sidebar */}
                <aside style={styles.sidebar}>
                    <h2 style={styles.sidebarTitle}>🔍 Filters</h2>

                    {/* Search */}
                    <div style={styles.filterGroup}>
                        <label>Search Products</label>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                handleFilterChange("query", e.target.value);
                            }}
                            style={styles.input}
                        />
                    </div>

                    {/* Category */}
                    <div style={styles.filterGroup}>
                        <label>Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            style={styles.select}
                        >
                            <option value="">All Categories</option>
                            {filterOptions.categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div style={styles.filterGroup}>
                        <label>Price Range</label>
                        <div style={styles.priceInputs}>
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => handlePriceChange("min", e.target.value)}
                                style={styles.priceInput}
                            />
                            <span style={styles.priceSeparator}>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => handlePriceChange("max", e.target.value)}
                                style={styles.priceInput}
                            />
                        </div>
                        <input
                            type="range"
                            min={filterOptions.priceRange.minPrice}
                            max={filterOptions.priceRange.maxPrice}
                            value={filters.maxPrice}
                            onChange={(e) => handlePriceChange("max", e.target.value)}
                            style={styles.slider}
                        />
                    </div>

                    {/* Rating */}
                    <div style={styles.filterGroup}>
                        <label>Minimum Rating</label>
                        <select
                            value={filters.minRating}
                            onChange={(e) => handleFilterChange("minRating", e.target.value)}
                            style={styles.select}
                        >
                            <option value="0">All Ratings</option>
                            <option value="1">⭐ 1+</option>
                            <option value="2">⭐⭐ 2+</option>
                            <option value="3">⭐⭐⭐ 3+</option>
                            <option value="4">⭐⭐⭐⭐ 4+</option>
                            <option value="5">⭐⭐⭐⭐⭐ 5</option>
                        </select>
                    </div>

                    {/* Tags */}
                    {filterOptions.tags.length > 0 && (
                        <div style={styles.filterGroup}>
                            <label>Tags</label>
                            <div style={styles.tagsContainer}>
                                {filterOptions.tags.slice(0, 5).map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagToggle(tag)}
                                        style={{
                                            ...styles.tagButton,
                                            ...(filters.tags.includes(tag) && styles.tagButtonActive)
                                        }}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Coupon */}
                    <div style={styles.filterGroup}>
                        <label>Apply Coupon</label>
                        <div style={styles.couponGroup}>
                            <input
                                type="text"
                                placeholder="Enter code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                style={styles.input}
                            />
                            <button onClick={handleApplyCoupon} style={styles.applyButton}>
                                Apply
                            </button>
                        </div>
                        {couponDiscount && (
                            <div style={styles.couponInfo}>
                                <p>✓ Coupon Applied</p>
                                <p style={styles.discountAmount}>
                                    Save ₹{couponDiscount.discountAmount}
                                </p>
                                <p style={styles.finalTotal}>
                                    Final: ₹{couponDiscount.finalTotal}
                                </p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Products */}
                <main style={styles.main}>
                    <div style={styles.resultsHeader}>
                        <h2>Products ({products.length})</h2>
                        {loading && <span style={styles.loading}>Loading...</span>}
                    </div>

                    {products.length === 0 && !loading && (
                        <div style={styles.empty}>
                            <p>No products found. Try adjusting your filters.</p>
                        </div>
                    )}

                    <div style={styles.productsGrid}>
                        {products.map(product => (
                            <div key={product._id} style={styles.productCard}>
                                {product.image && (
                                    <img src={product.image} alt={product.name} style={styles.productImage} />
                                )}
                                <h3 style={styles.productName}>{product.name}</h3>
                                {product.rating > 0 && (
                                    <div style={styles.rating}>
                                        {"⭐".repeat(Math.round(product.rating))}
                                        <span style={styles.ratingValue}>
                                            {product.rating.toFixed(1)} ({product.reviewCount})
                                        </span>
                                    </div>
                                )}
                                <p style={styles.productPrice}>₹{product.price}</p>
                                <p style={styles.productStock}>
                                    {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                                </p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 1400,
        margin: "0 auto",
        padding: 20,
    },
    layout: {
        display: "grid",
        gridTemplateColumns: "250px 1fr",
        gap: 20,
    },
    sidebar: {
        backgroundColor: "#f9f9f9",
        padding: 16,
        borderRadius: 8,
        maxHeight: "90vh",
        overflowY: "auto",
    },
    sidebarTitle: {
        margin: "0 0 20px 0",
        fontSize: 18,
        fontWeight: "bold",
    },
    filterGroup: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: "1px solid #ddd",
    },
    input: {
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: 4,
        fontSize: 14,
        boxSizing: "border-box",
    },
    select: {
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: 4,
        fontSize: 14,
        boxSizing: "border-box",
    },
    priceInputs: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    priceInput: {
        flex: 1,
        padding: "8px",
        border: "1px solid #ddd",
        borderRadius: 4,
        fontSize: 14,
    },
    priceSeparator: {
        color: "#999",
    },
    slider: {
        width: "100%",
    },
    tagsContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
    },
    tagButton: {
        padding: "6px 12px",
        border: "1px solid #ddd",
        borderRadius: 20,
        backgroundColor: "#fff",
        cursor: "pointer",
        fontSize: 12,
        transition: "all 0.3s",
    },
    tagButtonActive: {
        backgroundColor: "#3498db",
        color: "white",
        borderColor: "#3498db",
    },
    couponGroup: {
        display: "flex",
        gap: 8,
    },
    applyButton: {
        padding: "8px 16px",
        backgroundColor: "#27ae60",
        color: "white",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontWeight: "bold",
    },
    couponInfo: {
        marginTop: 12,
        padding: 12,
        backgroundColor: "#d4edda",
        borderRadius: 4,
        color: "#155724",
    },
    discountAmount: {
        margin: "4px 0",
        fontSize: 14,
        fontWeight: "bold",
    },
    finalTotal: {
        margin: "4px 0 0 0",
        fontSize: 12,
    },
    main: {
        flex: 1,
    },
    resultsHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    loading: {
        color: "#999",
        fontSize: 14,
    },
    empty: {
        textAlign: "center",
        padding: 40,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
    },
    productsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
    },
    productCard: {
        border: "1px solid #ddd",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#fff",
        transition: "all 0.3s",
    },
    productImage: {
        width: "100%",
        height: 200,
        objectFit: "cover",
    },
    productName: {
        margin: "12px 12px 0 12px",
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    rating: {
        margin: "8px 12px",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        gap: 4,
    },
    ratingValue: {
        color: "#666",
        marginLeft: 4,
    },
    productPrice: {
        margin: "8px 12px",
        fontSize: 16,
        fontWeight: "bold",
        color: "#27ae60",
    },
    productStock: {
        margin: "8px 12px 12px",
        fontSize: 12,
        color: "#999",
    },
};

export default ProductSearch;
