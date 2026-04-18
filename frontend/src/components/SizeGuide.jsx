import { useState } from "react";

function SizeGuide({ productType = "clothing", onClose }) {
    const [selectedCategory, setSelectedCategory] = useState(productType || "clothing");

    const sizeGuides = {
        clothing: {
            title: "Clothing Size Guide",
            description: "Find your perfect fit with our size guide",
            table: [
                { size: "XS", chestCm: "81-86", waistCm: "66-71", fitNote: "Slim Fit" },
                { size: "S", chestCm: "86-91", waistCm: "71-76", fitNote: "Regular Fit" },
                { size: "M", chestCm: "91-97", waistCm: "76-82", fitNote: "Regular Fit" },
                { size: "L", chestCm: "97-102", waistCm: "82-87", fitNote: "Regular Fit" },
                { size: "XL", chestCm: "102-107", waistCm: "87-97", fitNote: "Relaxed Fit" },
                { size: "XXL", chestCm: "107-112", waistCm: "97-107", fitNote: "Relaxed Fit" },
            ],
            tips: [
                "Measure your chest at the fullest point",
                "Measure your waist at the natural crease",
                "Take measurements while wearing minimal clothing",
                "Use a soft measuring tape, not a rigid ruler",
            ],
        },
        shoes: {
            title: "Shoes Size Guide",
            description: "Find the right shoe size for comfort",
            table: [
                { size: "5", lengthCm: "23", widthCm: "8.5", fitNote: "Narrow" },
                { size: "6", lengthCm: "24", widthCm: "8.8", fitNote: "Narrow" },
                { size: "7", lengthCm: "24.8", widthCm: "9.1", fitNote: "Regular" },
                { size: "8", lengthCm: "25.4", widthCm: "9.4", fitNote: "Regular" },
                { size: "9", lengthCm: "26.3", widthCm: "9.8", fitNote: "Regular" },
                { size: "10", lengthCm: "27.3", widthCm: "10.2", fitNote: "Wide" },
                { size: "11", lengthCm: "28.3", widthCm: "10.6", fitNote: "Wide" },
            ],
            tips: [
                "Shoe sizes can vary by brand",
                "Measure feet in the evening when they're slightly swollen",
                "Always leave 1cm gap between toe and shoe end",
                "Stand while measuring for accurate length",
            ],
        },
        accessories: {
            title: "Accessories Size Guide",
            description: "Get the perfect fit for accessories",
            table: [
                { size: "One Size", circumferenceCm: "Varies", fitNote: "Adjustable" },
                { size: "Small", circumferenceCm: "18-20", fitNote: "Snug fit" },
                { size: "Medium", circumferenceCm: "20-22", fitNote: "Regular fit" },
                { size: "Large", circumferenceCm: "22-24", fitNote: "Loose fit" },
            ],
            tips: [
                "Wrap measuring tape around the fullest part",
                "Keep tape snug but not tight",
                "Check product-specific measurements",
                "Consider material stretch if applicable",
            ],
        },
    };

    const guide = sizeGuides[selectedCategory] || sizeGuides.clothing;
    const columns = guide.table.length > 0 ? Object.keys(guide.table[0]) : [];

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>📏 {guide.title}</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Category Tabs */}
                <div style={styles.tabs}>
                    {Object.keys(sizeGuides).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                ...styles.tab,
                                borderBottom: selectedCategory === cat ? "3px solid #2575fc" : "1px solid #ddd",
                                color: selectedCategory === cat ? "#2575fc" : "#666",
                            }}
                        >
                            {sizeGuides[cat].title.split(" ")[0]}
                        </button>
                    ))}
                </div>

                {/* Description */}
                <p style={styles.description}>{guide.description}</p>

                {/* Size Table */}
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.headerRow}>
                                {columns.map((col) => (
                                    <th key={col} style={styles.th}>
                                        {col === "size" && "Size"}
                                        {col === "chestCm" && "Chest (cm)"}
                                        {col === "waistCm" && "Waist (cm)"}
                                        {col === "lengthCm" && "Length (cm)"}
                                        {col === "widthCm" && "Width (cm)"}
                                        {col === "circumferenceCm" && "Circumference (cm)"}
                                        {col === "fitNote" && "Fit Note"}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {guide.table.map((row, idx) => (
                                <tr
                                    key={idx}
                                    style={{
                                        ...styles.tr,
                                        background: idx % 2 === 0 ? "white" : "#f9f9f9",
                                    }}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col}
                                            style={{
                                                ...styles.td,
                                                fontWeight: col === "size" ? 700 : 400,
                                                color: col === "size" ? "#2575fc" : "#666",
                                            }}
                                        >
                                            {row[col]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Tips Section */}
                <div style={styles.tipsSection}>
                    <h3 style={styles.tipsTitle}>💡 Measurement Tips</h3>
                    <ul style={styles.tipsList}>
                        {guide.tips.map((tip, idx) => (
                            <li key={idx} style={styles.tipItem}>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Size Conversion */}
                <div style={styles.conversionBox}>
                    <h3 style={styles.conversionTitle}>🌍 International Size Conversion</h3>
                    <div style={styles.conversionGrid}>
                        <div style={styles.conversionItem}>
                            <span style={styles.conversionLabel}>European</span>
                            <span style={styles.conversionValue}>EU size</span>
                        </div>
                        <div style={styles.conversionItem}>
                            <span style={styles.conversionLabel}>US</span>
                            <span style={styles.conversionValue}>US size</span>
                        </div>
                        <div style={styles.conversionItem}>
                            <span style={styles.conversionLabel}>UK</span>
                            <span style={styles.conversionValue}>UK size</span>
                        </div>
                        <div style={styles.conversionItem}>
                            <span style={styles.conversionLabel}>India</span>
                            <span style={styles.conversionValue}>IN size</span>
                        </div>
                    </div>
                </div>

                {/* Fit Guide Visual */}
                <div style={styles.fitGuideSection}>
                    <h3 style={styles.fitGuideTitle}>👕 How Should it Fit?</h3>
                    <div style={styles.fitTips}>
                        <div style={styles.fitTip}>
                            <div style={styles.fitIcon}>✓</div>
                            <div>
                                <p style={styles.fitLabel}>Perfect Fit</p>
                                <p style={styles.fitDesc}>Comfortable yet snug, no excess fabric</p>
                            </div>
                        </div>
                        <div style={styles.fitTip}>
                            <div style={styles.fitIcon}>⚠</div>
                            <div>
                                <p style={styles.fitLabel}>Too Tight</p>
                                <p style={styles.fitDesc}>Restrict movement or create bulges</p>
                            </div>
                        </div>
                        <div style={styles.fitTip}>
                            <div style={styles.fitIcon}>⚠</div>
                            <div>
                                <p style={styles.fitLabel}>Too Loose</p>
                                <p style={styles.fitDesc}>Excess fabric or unflattering drape</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Return Policy Note */}
                <div style={styles.noteBox}>
                    <p style={styles.note}>
                        📌 Not sure about sizing? We offer easy returns & exchanges within 7 days if the size doesn't fit perfectly.
                    </p>
                </div>

                <button onClick={onClose} style={styles.closeFullBtn}>
                    Got It, Close Size Guide
                </button>
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
        padding: 20,
        animation: "fadeIn 0.3s ease",
    },
    modal: {
        background: "white",
        borderRadius: 12,
        maxWidth: 900,
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        animation: "slideInUp 0.4s ease",
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
        zIndex: 10,
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
    tabs: {
        display: "flex",
        gap: 0,
        padding: "0 20px",
        borderBottom: "1px solid #ddd",
        background: "#fafafa",
    },
    tab: {
        padding: "15px 20px",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 13,
        transition: "all 0.3s ease",
        color: "#666",
    },
    description: {
        padding: "20px",
        fontSize: 13,
        color: "#666",
        margin: 0,
        background: "#f9f9f9",
    },
    tableContainer: {
        padding: "20px",
        overflowX: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    headerRow: {
        background: "#f0f0f0",
    },
    th: {
        padding: "14px 10px",
        textAlign: "left",
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        borderBottom: "2px solid #ddd",
    },
    tr: {
        borderBottom: "1px solid #eee",
    },
    td: {
        padding: "12px 10px",
        fontSize: 13,
    },
    tipsSection: {
        padding: 20,
        background: "#e8f4f8",
        borderLeft: "4px solid #2575fc",
        margin: "20px",
        borderRadius: 8,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 12px 0",
    },
    tipsList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
    },
    tipItem: {
        fontSize: 12,
        color: "#555",
        padding: "6px 0 6px 24px",
        position: "relative",
    },
    conversionBox: {
        padding: 20,
        margin: "20px",
        background: "#f9f9f9",
        borderRadius: 8,
        border: "1px solid #e0e0e0",
    },
    conversionTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 12px 0",
    },
    conversionGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
    },
    conversionItem: {
        background: "white",
        padding: 12,
        borderRadius: 6,
        border: "1px solid #ddd",
        textAlign: "center",
    },
    conversionLabel: {
        display: "block",
        fontSize: 11,
        color: "#999",
        fontWeight: 600,
        marginBottom: 6,
    },
    conversionValue: {
        display: "block",
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
    },
    fitGuideSection: {
        padding: 20,
        margin: "20px",
        background: "#f9f9f9",
        borderRadius: 8,
    },
    fitGuideTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 12px 0",
    },
    fitTips: {
        display: "grid",
        gap: 12,
    },
    fitTip: {
        display: "flex",
        gap: 12,
        padding: 12,
        background: "white",
        borderRadius: 6,
        border: "1px solid #ddd",
    },
    fitIcon: {
        fontSize: 24,
        minWidth: 30,
        textAlign: "center",
    },
    fitLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: 0,
    },
    fitDesc: {
        fontSize: 11,
        color: "#666",
        margin: "4px 0 0 0",
    },
    noteBox: {
        padding: 15,
        margin: "20px",
        background: "#fffbea",
        border: "1px solid #f0e5d0",
        borderRadius: 8,
    },
    note: {
        fontSize: 12,
        color: "#8b7500",
        margin: 0,
        fontWeight: 500,
    },
    closeFullBtn: {
        width: "calc(100% - 40px)",
        margin: "20px",
        padding: "14px 16px",
        background: "#2575fc",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        transition: "all 0.3s ease",
    },
};

export default SizeGuide;
