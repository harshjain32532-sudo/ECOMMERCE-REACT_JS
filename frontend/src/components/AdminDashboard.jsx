import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        topProducts: [],
        recentOrders: [],
        salesTrend: [],
        conversionRate: 0,
        averageOrderValue: 0,
        repeatCustomerRate: 0,
        cartAbandonmentRate: 0
    });

    const [timeRange, setTimeRange] = useState('7days');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/analytics/dashboard?range=${timeRange}`);
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, trend, color }) => (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-content">
                <h3>{title}</h3>
                <p className="stat-value">
                    {typeof value === 'number'
                        ? value.toLocaleString()
                        : value}
                </p>
                {trend && <span className={`trend trend-${trend > 0 ? 'up' : 'down'}`}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>}
            </div>
        </div>
    );

    if (loading) {
        return <div className="admin-dashboard loading">Loading dashboard...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>📊 Admin Dashboard</h1>
                <div className="time-range-selector">
                    <button
                        className={timeRange === '7days' ? 'active' : ''}
                        onClick={() => setTimeRange('7days')}
                    >
                        7 Days
                    </button>
                    <button
                        className={timeRange === '30days' ? 'active' : ''}
                        onClick={() => setTimeRange('30days')}
                    >
                        30 Days
                    </button>
                    <button
                        className={timeRange === '90days' ? 'active' : ''}
                        onClick={() => setTimeRange('90days')}
                    >
                        90 Days
                    </button>
                    <button
                        className={timeRange === 'yearly' ? 'active' : ''}
                        onClick={() => setTimeRange('yearly')}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Total Revenue"
                    value={`₹${dashboardData.totalRevenue}`}
                    icon="💰"
                    trend={12.5}
                    color="primary"
                />
                <StatCard
                    title="Total Orders"
                    value={dashboardData.totalOrders}
                    icon="📦"
                    trend={8.3}
                    color="success"
                />
                <StatCard
                    title="Total Customers"
                    value={dashboardData.totalCustomers}
                    icon="👥"
                    trend={5.2}
                    color="info"
                />
                <StatCard
                    title="Total Products"
                    value={dashboardData.totalProducts}
                    icon="📦"
                    trend={-2.1}
                    color="warning"
                />
            </div>

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                >
                    Sales Analytics
                </button>
                <button
                    className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    Product Performance
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <>
                        <div className="analytics-section">
                            <h2>Key Metrics</h2>
                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <span className="metric-label">Conversion Rate</span>
                                    <span className="metric-value">{dashboardData.conversionRate.toFixed(2)}%</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-label">Avg Order Value</span>
                                    <span className="metric-value">₹{dashboardData.averageOrderValue}</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-label">Repeat Customer Rate</span>
                                    <span className="metric-value">{dashboardData.repeatCustomerRate.toFixed(2)}%</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-label">Cart Abandonment</span>
                                    <span className="metric-value">{dashboardData.cartAbandonmentRate.toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="two-column-layout">
                            <div className="section">
                                <h2>🔥 Top Selling Products</h2>
                                <div className="products-list">
                                    {dashboardData.topProducts.slice(0, 5).map((product, idx) => (
                                        <div key={idx} className="product-row">
                                            <span className="rank">#{idx + 1}</span>
                                            <span className="product-name">{product.name}</span>
                                            <span className="product-sales">{product.sales} sold</span>
                                            <span className="product-revenue">₹{product.revenue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="section">
                                <h2>📋 Recent Orders</h2>
                                <div className="orders-list">
                                    {dashboardData.recentOrders.slice(0, 5).map((order, idx) => (
                                        <div key={idx} className="order-row">
                                            <span className="order-id">#{order.id}</span>
                                            <span className={`order-status status-${order.status}`}>{order.status}</span>
                                            <span className="order-amount">₹{order.amount}</span>
                                            <span className="order-date">{new Date(order.date).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'sales' && (
                    <div className="section">
                        <h2>Sales Analytics</h2>
                        <div className="chart-placeholder">
                            <p>💹 Sales Chart - Implementation in progress</p>
                            <p>Daily, Weekly, Monthly sales data visualization</p>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="section">
                        <h2>Product Performance</h2>
                        <div className="chart-placeholder">
                            <p>📊 Product Performance Chart</p>
                            <p>Best performing products, revenue, ratings</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
