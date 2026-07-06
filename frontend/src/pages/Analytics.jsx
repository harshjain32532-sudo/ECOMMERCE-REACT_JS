import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getSalesAnalytics,
    getCustomerAnalytics,
    getProductAnalytics
} from "../api.js";

export function AnalyticsDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [period, setPeriod] = useState("day");

    const [salesData, setSalesData] = useState([]);
    const [customerData, setCustomerData] = useState({
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        repeatCustomers: 0,
        repeatCustomerRate: 0,
        avgOrderValue: 0
    });
    const [productData, setProductData] = useState({
        topProducts: [],
        lowStockProducts: []
    });

    useEffect(() => {
        // Check if user is admin
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        loadAnalytics();
    }, [period]);

    const loadAnalytics = async () => {
        setLoading(true);
        setError("");
        try {
            // Load all analytics in parallel
            const [salesRes, customerRes, productRes] = await Promise.all([
                getSalesAnalytics(null, null, period),
                getCustomerAnalytics(),
                getProductAnalytics()
            ]);

            setSalesData(salesRes.data);
            setCustomerData(customerRes.data);
            setProductData(productRes.data);
        } catch (err) {
            setError("Failed to load analytics. You may not have admin access.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={styles.loading}>📊 Loading analytics...</div>;
    }

    if (error) {
        return <div style={styles.error}>⚠️ {error}</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>📊 Analytics Dashboard</h1>
                <div style={styles.periodSelector}>
                    <button
                        onClick={() => setPeriod("day")}
                        style={{ ...styles.periodButton, ...(period === "day" && styles.periodButtonActive) }}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setPeriod("week")}
                        style={{ ...styles.periodButton, ...(period === "week" && styles.periodButtonActive) }}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setPeriod("month")}
                        style={{ ...styles.periodButton, ...(period === "month" && styles.periodButtonActive) }}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div style={styles.metricsGrid}>
                <div style={styles.metricCard}>
                    <h3>💰 Total Revenue</h3>
                    <p style={styles.metricValue}>₹{(customerData.totalRevenue || 0).toLocaleString()}</p>
                    <p style={styles.metricLabel}>From all orders</p>
                </div>

                <div style={styles.metricCard}>
                    <h3>📦 Total Orders</h3>
                    <p style={styles.metricValue}>{customerData.totalOrders}</p>
                    <p style={styles.metricLabel}>Completed orders</p>
                </div>

                <div style={styles.metricCard}>
                    <h3>👥 Total Customers</h3>
                    <p style={styles.metricValue}>{customerData.totalCustomers}</p>
                    <p style={styles.metricLabel}>Registered users</p>
                </div>

                <div style={styles.metricCard}>
                    <h3>🔄 Repeat Customer Rate</h3>
                    <p style={styles.metricValue}>{customerData.repeatCustomerRate}%</p>
                    <p style={styles.metricLabel}>{customerData.repeatCustomers} repeat customers</p>
                </div>

                <div style={styles.metricCard}>
                    <h3>💵 Average Order Value</h3>
                    <p style={styles.metricValue}>₹{parseFloat(customerData.avgOrderValue || 0).toFixed(2)}</p>
                    <p style={styles.metricLabel}>Per transaction</p>
                </div>
            </div>

            {/* Sales Trend */}
            {salesData.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>📈 Sales Trend</h2>
                    <div style={styles.chartPlaceholder}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th>Period</th>
                                    <th>Orders</th>
                                    <th>Total Sales</th>
                                    <th>Avg Order Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesData.map((item, idx) => (
                                    <tr key={idx} style={styles.tableRow}>
                                        <td style={styles.tableCell}>{item._id}</td>
                                        <td style={styles.tableCell}>{item.orderCount}</td>
                                        <td style={styles.tableCell}>₹{item.totalSales.toFixed(2)}</td>
                                        <td style={styles.tableCell}>₹{item.avgOrderValue.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Top Products */}
            {productData.topProducts.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>🏆 Top Selling Products</h2>
                    <div style={styles.productsGrid}>
                        {productData.topProducts.map((product, idx) => (
                            <div key={idx} style={styles.productCard}>
                                <div style={styles.productRank}>#{idx + 1}</div>
                                <h3>Product {product._id.slice(-4)}</h3>
                                <p style={styles.stat}>
                                    <strong>Sold:</strong> {product.totalSold} units
                                </p>
                                <p style={styles.stat}>
                                    <strong>Revenue:</strong> ₹{product.totalRevenue.toFixed(2)}
                                </p>
                                <p style={styles.stat}>
                                    <strong>Orders:</strong> {product.orderCount}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Low Stock Alert */}
            {productData.lowStockProducts.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>⚠️ Low Stock Alert</h2>
                    <div style={styles.alertContainer}>
                        {productData.lowStockProducts.map((product) => (
                            <div key={product._id} style={styles.alertItem}>
                                <div style={styles.alertContent}>
                                    <h4>{product.name}</h4>
                                    <p style={styles.alertPrice}>₹{product.price}</p>
                                </div>
                                <div style={styles.stockBadge}>
                                    {product.stock} left
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Export Report */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>📥 Export Report</h2>
                <div style={styles.exportButtons}>
                    <button style={styles.exportButton}>📊 Export as CSV</button>
                    <button style={styles.exportButton}>📄 Generate PDF</button>
                </div>
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
    loading: {
        textAlign: "center",
        padding: 60,
        fontSize: 18,
        color: "#666",
    },
    error: {
        padding: 16,
        backgroundColor: "#fadbd8",
        color: "#c0392b",
        borderRadius: 8,
        marginBottom: 20,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
    },
    periodSelector: {
        display: "flex",
        gap: 8,
    },
    periodButton: {
        padding: "8px 16px",
        border: "1px solid #ddd",
        backgroundColor: "#fff",
        borderRadius: 4,
        cursor: "pointer",
        transition: "all 0.3s",
        fontSize: 14,
        fontWeight: "500",
    },
    periodButtonActive: {
        backgroundColor: "#3498db",
        color: "white",
        borderColor: "#3498db",
    },
    metricsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 30,
    },
    metricCard: {
        padding: 20,
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    metricValue: {
        margin: "12px 0 4px 0",
        fontSize: 28,
        fontWeight: "bold",
        color: "#27ae60",
    },
    metricLabel: {
        margin: 0,
        color: "#999",
        fontSize: 12,
    },
    section: {
        padding: 20,
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: 8,
        marginBottom: 20,
    },
    sectionTitle: {
        margin: "0 0 16px 0",
        fontSize: 18,
        fontWeight: "bold",
    },
    chartPlaceholder: {
        backgroundColor: "#f9f9f9",
        borderRadius: 4,
        overflow: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    tableHeader: {
        backgroundColor: "#f0f0f0",
    },
    tableRow: {
        borderBottom: "1px solid #eee",
    },
    tableCell: {
        padding: "12px",
        textAlign: "left",
    },
    productsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
    },
    productCard: {
        padding: 16,
        backgroundColor: "#f9f9f9",
        borderRadius: 4,
        position: "relative",
    },
    productRank: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#f39c12",
        color: "white",
        width: 32,
        height: 32,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: 14,
    },
    stat: {
        margin: "8px 0",
        fontSize: 13,
        color: "#666",
    },
    alertContainer: {
        display: "grid",
        gap: 12,
    },
    alertItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#fff3cd",
        borderLeft: "4px solid #f39c12",
        borderRadius: 4,
    },
    alertContent: {
        flex: 1,
    },
    alertPrice: {
        margin: "4px 0 0 0",
        fontSize: 12,
        color: "#666",
    },
    stockBadge: {
        padding: "4px 12px",
        backgroundColor: "#f39c12",
        color: "white",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: "bold",
        whiteSpace: "nowrap",
    },
    exportButtons: {
        display: "flex",
        gap: 12,
    },
    exportButton: {
        padding: "10px 20px",
        backgroundColor: "#3498db",
        color: "white",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background 0.3s",
    },
};

export default AnalyticsDashboard;
