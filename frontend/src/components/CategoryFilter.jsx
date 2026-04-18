import { useState } from "react";

function CategoryFilter({ categories = [], onSelectCategory, selectedCategory = null }) {
    const [expanded, setExpanded] = useState(true);

    // Default categories if none provided
    const defaultCategories = categories.length > 0 ? categories : [
        { id: "all", name: "All Products", icon: "📦", count: 0 },
        { id: "electronics", name: "Electronics", icon: "📱", count: 0 },
        { id: "fashion", name: "Fashion", icon: "👕", count: 0 },
        { id: "books", name: "Books", icon: "📚", count: 0 },
        { id: "home", name: "Home & Living", icon: "🏠", count: 0 },
        { id: "sports", name: "Sports", icon: "⚽", count: 0 },
        { id: "beauty", name: "Beauty", icon: "💄", count: 0 },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>📂 Categories</h3>
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={styles.toggleBtn}
                >
                    {expanded ? "−" : "+"}
                </button>
            </div>

            {expanded && (
                <div style={styles.categoryList}>
                    {defaultCategories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.id)}
                            style={{
                                ...styles.categoryItem,
                                background: selectedCategory === cat.id ? "#f0f0f0" : "transparent",
                                borderLeft: selectedCategory === cat.id ? "4px solid #2575fc" : "4px solid transparent",
                                paddingLeft: selectedCategory === cat.id ? "12px" : "16px",
                            }}
                        >
                            <span style={styles.icon}>{cat.icon}</span>
                            <span style={styles.categoryName}>{cat.name}</span>
                            {cat.count > 0 && (
                                <span style={styles.count}>{cat.count}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden",
        animation: "slideInLeft 0.5s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        borderBottom: "2px solid #f0f0f0",
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        color: "#2c3e50",
        margin: 0,
    },
    toggleBtn: {
        background: "none",
        border: "none",
        fontSize: 20,
        cursor: "pointer",
        color: "#999",
        width: 30,
        height: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
    },
    categoryList: {
        padding: "8px 0",
        animation: "slideInDown 0.3s ease",
    },
    categoryItem: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        borderRadius: 0,
    },
    icon: {
        fontSize: 18,
    },
    categoryName: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        fontWeight: 500,
    },
    count: {
        background: "#f5f5f5",
        padding: "2px 8px",
        borderRadius: 12,
        fontSize: 12,
        color: "#999",
        fontWeight: 600,
    },
};

export default CategoryFilter;
