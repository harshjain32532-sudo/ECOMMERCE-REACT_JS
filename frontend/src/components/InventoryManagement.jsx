import React, { useState, useEffect } from 'react';
import './InventoryManagement.css';

const InventoryManagement = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [suppliers, setSuppliers] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [stockLevels, setStockLevels] = useState([]);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'suppliers') {
                const res = await fetch('/api/inventory/suppliers');
                const data = await res.json();
                setSuppliers(data.suppliers || []);
            } else if (activeTab === 'purchase-orders') {
                const res = await fetch('/api/inventory/purchase-orders');
                const data = await res.json();
                setPurchaseOrders(data.purchaseOrders || []);
            } else if (activeTab === 'stock') {
                const res = await fetch('/api/inventory/stock-levels');
                const data = await res.json();
                setStockLevels(data.stockLevels || []);
            } else if (activeTab === 'alerts') {
                const res = await fetch('/api/inventory/stock-alerts');
                const data = await res.json();
                setStockAlerts(data.stockAlerts || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setLoading(false);
    };

    const handleAddSupplier = async () => {
        try {
            const res = await fetch('/api/inventory/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({});
                setShowModal(false);
                loadData();
            }
        } catch (error) {
            console.error('Error adding supplier:', error);
        }
    };

    return (
        <div className="inventory-management">
            <div className="inventory-header">
                <h1>📦 Inventory Management</h1>
            </div>

            <div className="inventory-tabs">
                <button
                    className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    Stock Levels
                </button>
                <button
                    className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('alerts')}
                >
                    Stock Alerts
                </button>
                <button
                    className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('suppliers')}
                >
                    Suppliers
                </button>
                <button
                    className={`tab-btn ${activeTab === 'purchase-orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('purchase-orders')}
                >
                    Purchase Orders
                </button>
            </div>

            <div className="inventory-content">
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        {activeTab === 'products' && (
                            <div className="stock-levels-section">
                                <div className="section-header">
                                    <h2>📊 Stock Levels</h2>
                                    <button className="btn btn-primary">+ New Entry</button>
                                </div>
                                <table className="inventory-table">
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Current Stock</th>
                                            <th>Minimum Level</th>
                                            <th>Maximum Level</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockLevels.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.productName}</td>
                                                <td className="stock-value">{item.currentStock}</td>
                                                <td>{item.minimumStock}</td>
                                                <td>{item.maximumStock}</td>
                                                <td>
                                                    <span className={`status status-${item.currentStock > item.maximumStock ? 'overstock' :
                                                            item.currentStock < item.minimumStock ? 'low' : 'normal'
                                                        }`}>
                                                        {item.currentStock > item.maximumStock ? 'Overstock' :
                                                            item.currentStock < item.minimumStock ? 'Low Stock' : 'Normal'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-secondary">Adjust</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {stockLevels.length === 0 && (
                                    <div className="empty-state">No stock levels found</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'alerts' && (
                            <div className="alerts-section">
                                <div className="section-header">
                                    <h2>🚨 Stock Alerts</h2>
                                </div>
                                <div className="alerts-grid">
                                    {stockAlerts.map((alert, idx) => (
                                        <div key={idx} className={`alert-card alert-${alert.alertType}`}>
                                            <div className="alert-icon">
                                                {alert.alertType === 'low_stock' && '📉'}
                                                {alert.alertType === 'out_of_stock' && '❌'}
                                                {alert.alertType === 'overstock' && '📈'}
                                            </div>
                                            <div className="alert-content">
                                                <h3>{alert.productName}</h3>
                                                <p className="alert-type">{alert.alertType.replace('_', ' ').toUpperCase()}</p>
                                                <p className="current-stock">Current: {alert.currentStock} units</p>
                                                <p className="alert-time">
                                                    {new Date(alert.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button className="btn btn-sm btn-primary">Resolve</button>
                                        </div>
                                    ))}
                                </div>
                                {stockAlerts.length === 0 && (
                                    <div className="empty-state">✅ No active alerts</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'suppliers' && (
                            <div className="suppliers-section">
                                <div className="section-header">
                                    <h2>👥 Suppliers</h2>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowModal(true)}
                                    >
                                        + Add Supplier
                                    </button>
                                </div>
                                <table className="inventory-table">
                                    <thead>
                                        <tr>
                                            <th>Supplier Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>GST Number</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suppliers.map((supplier, idx) => (
                                            <tr key={idx}>
                                                <td>{supplier.name}</td>
                                                <td>{supplier.email}</td>
                                                <td>{supplier.phone}</td>
                                                <td>{supplier.gstNumber || '-'}</td>
                                                <td>
                                                    <span className={`status status-${supplier.status}`}>
                                                        {supplier.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-secondary">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {suppliers.length === 0 && (
                                    <div className="empty-state">No suppliers found</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'purchase-orders' && (
                            <div className="po-section">
                                <div className="section-header">
                                    <h2>📋 Purchase Orders</h2>
                                    <button className="btn btn-primary">+ Create PO</button>
                                </div>
                                <table className="inventory-table">
                                    <thead>
                                        <tr>
                                            <th>PO Number</th>
                                            <th>Supplier</th>
                                            <th>Items</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchaseOrders.map((po, idx) => (
                                            <tr key={idx}>
                                                <td className="po-number">{po.poNumber}</td>
                                                <td>{po.supplierName}</td>
                                                <td>{po.items?.length || 0}</td>
                                                <td className="amount">₹{po.totalAmount}</td>
                                                <td>
                                                    <span className={`status status-${po.status}`}>
                                                        {po.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-secondary">View</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {purchaseOrders.length === 0 && (
                                    <div className="empty-state">No purchase orders found</div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Supplier</h2>
                        <form>
                            <input
                                type="text"
                                placeholder="Supplier Name"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="GST Number"
                                value={formData.gstNumber || ''}
                                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                            />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleAddSupplier} className="btn btn-primary">
                                    Add Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
