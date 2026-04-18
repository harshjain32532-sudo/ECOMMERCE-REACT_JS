import { useState } from "react";

function ProductComparison({ compareItems = [], onRemove, isOpen = false, onAddToCart }) {
    const [expandedRow, setExpandedRow] = useState(null);

    if (!isOpen || compareItems.length === 0) return null;

    // Get all unique attributes from all products
    const allAttributes = new Set();
    compareItems.forEach(item => {
        if (item && item.specs) {
            Object.keys(item.specs).forEach(key => allAttributes.add(key));
        }
    });

    const attributes = Array.from(allAttributes);

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>Compare Products</h2>
                    <button
                        style={styles.closeBtn}
                        onClick={() => isOpen && window.location.reload()}
                    >
                        ✕
                    </button>
                </div>

                {/* Comparison Table */}
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <tbody>
                            {/* Product Names Row */}
                            <tr style={styles.headerRow}>
                                <td style={styles.attributeCell}></td>
                                {compareItems.map((item, idx) => (
                                    <td key={idx} style={styles.productCell}>
                                        <div style={styles.productName}>{item?.name}</div>
                                    </td>
                                ))}
                            </tr>

                            {/* Product Images Row */}
                            <tr style={styles.imageRow}>
                                <td style={styles.attributeCell}></td>
                                {compareItems.map((item, idx) => (
                                    <td key={idx} style={styles.productCell}>
                                        {item?.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={styles.productImage}
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Price Row */}
                            <tr style={styles.dataRow}>
                                <td style={styles.attributeCell}>Price</td>
                                {compareItems.map((item, idx) => (
                                    <td key={idx} style={styles.productCell}>
                                        <span style={styles.price}>₹{item?.price}</span>
                                    </td>
                                ))}
                            </tr>

                            {/* Rating Row */}
                            <tr style={styles.dataRow}>
                                <td style={styles.attributeCell}>Rating</td>
                                {compareItems.map((item, idx) => (
                                    <td key={idx} style={styles.productCell}>
                                        <span style={styles.rating}>
                                            {item?.rating ? `⭐ ${item.rating}` : "N/A"}
                                        </span>
                                    </td>
                                ))}
                            </tr>

                            {/* Stock Row */}
                            <tr style={styles.dataRow}>
                                <td style={styles.attributeCell}>Stock</td>
                                {compareItems.map((item, idx) => (
                                    <td key={idx} style={styles.productCell}>
                                        <span style={{
                                            color: item?.stock > 0 ? "#27ae60" : "#e74c3c",
                                            fontWeight: 600,
                                        }}>
                                            {item?.stock > 0 ? `${item.stock} in stock` : "Out of Stock"}
                                        </span>
                                    </td>
                                ))}
                            </tr>

                            {/* Dynamic Attributes */}
                            {attributes.map((attr) => (
                                <tr
                                    key={attr}
                                    style={styles.dataRow}
                                    onClick={() => setExpandedRow(expandedRow === attr ? null : attr)}
                                >
                                    <td style={styles.attributeCell}>
                                        <span style={styles.attributeName}>{attr}</span>
                                    </td>
                                    {compareItems.map((item, idx) => (
                                        <td key={idx} style={styles.productCell}>
                                            <span style={styles.attributeValue}>
                                                {item?.specs?.[attr] || "N/A"}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* Add to Cart Row */}
                            <tr style={styles.actionRow}>
                                <td style={styles.attributeCell}></td>
                                {compareItems.map((item, idx) => (
                                    <td key={idx} style={styles.productCell}>
                                        <button
                                            style={styles.addButton}
                                            onClick={() => onAddToCart(item)}
                                        >
                                            Add to Cart
                                        </button>
                                    </td>
                                ))}
                            </tr>

                            {/* Remove Row */}
                            <tr style={styles.actionRow}>
                                <td style={styles.attributeCell}></td>
                                {compareItems.map((item, idx) => (
                                    <td key={idx} style={styles.productCell}>
                                        <button
                                            style={styles.removeButton}
                                            onClick={() => onRemove(item._id)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div style={styles.legend}>
                    <p>💡 Tip: Use the compare feature to make informed purchasing decisions by viewing all important specifications side by side.</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
    },
    modal: {
        background: "white",
        borderRadius: 12,
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        maxWidth: "95vw",
        maxHeight: "85vh",
        overflow: "auto",
        animation: "slideInDown 0.4s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottom: "2px solid #f0f0f0",
        background: "linear-gradient(135deg, #2575fc 0%, #1e5dcc 100%)",
        color: "white",
        position: "sticky",
        top: 0,
    },
    title: {
        margin: 0,
        fontSize: 20,
        fontWeight: 700,
    },
    closeBtn: {
        background: "rgba(255,255,255,0.2)",
        border: "none",
        color: "white",
        fontSize: 24,
        cursor: "pointer",
        width: 40,
        height: 40,
        borderRadius: "50%",
        transition: "all 0.3s ease",
    },
    tableContainer: {
        overflowX: "auto",
        padding: 20,
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: 500,
    },
    headerRow: {
        background: "#f5f5f5",
        borderTop: "2px solid #ddd",
        borderBottom: "2px solid #ddd",
    },
    imageRow: {
        borderBottom: "1px solid #eee",
    },
    dataRow: {
        borderBottom: "1px solid #eee",
        transition: "all 0.3s ease",
    },
    actionRow: {
        borderTop: "2px solid #ddd",
        borderBottom: "2px solid #ddd",
    },
    attributeCell: {
        padding: 12,
        fontWeight: 600,
        color: "#2c3e50",
        textAlign: "left",
        minWidth: 120,
        background: "#f9f9f9",
        borderRight: "1px solid #eee",
    },
    productCell: {
        padding: 12,
        textAlign: "center",
        minWidth: 120,
    },
    productName: {
        fontWeight: 600,
        color: "#2c3e50",
        fontSize: 14,
    },
    productImage: {
        maxWidth: 100,
        maxHeight: 100,
        objectFit: "contain",
    },
    price: {
        fontSize: 16,
        fontWeight: 700,
        color: "#2575fc",
    },
    rating: {
        fontSize: 14,
        color: "#FFB700",
        fontWeight: 600,
    },
    attributeName: {
        cursor: "pointer",
        fontWeight: 600,
        color: "#2c3e50",
    },
    attributeValue: {
        color: "#555",
        fontSize: 13,
    },
    addButton: {
        padding: "10px 16px",
        background: "linear-gradient(135deg, #27ae60 0%, #229954 100%)",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
        width: "100%",
    },
    removeButton: {
        padding: "10px 16px",
        background: "#e74c3c",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
        width: "100%",
    },
    legend: {
        padding: 15,
        background: "#fffbea",
        borderTop: "1px solid #f0e5d0",
        color: "#8b7500",
        fontSize: 12,
        fontWeight: 500,
        textAlign: "center",
    },
};

export default ProductComparison;
