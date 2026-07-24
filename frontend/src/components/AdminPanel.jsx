import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import {
    getCustomers,
    getAdminOrders,
    getAdminProductOrders,
    updateAdminOrderStatus,
    getAdminDeliveryTracking,
    updateDeliveryDate,
    getAdminCategories,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory,
    getAdminBrands,
    createAdminBrand,
    updateAdminBrand,
    deleteAdminBrand,
    getAdminUsers,
    updateAdminUserRole,
    deleteAdminUser,
    getAdminCoupons,
    createAdminCoupon,
    updateAdminCoupon,
    deleteAdminCoupon,
    getAdminInventory,
    updateAdminInventory
} from "../api.js";
import "../styles/AdminPanel.css";

function AdminPanel() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("products");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterStock, setFilterStock] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [adminName, setAdminName] = useState("Admin");
    const [toastQueue, setToastQueue] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [deliveredProducts, setDeliveredProducts] = useState([]);
    const [productOrders, setProductOrders] = useState([]);
    const [deliveryTracking, setDeliveryTracking] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [updatingOrderStatus, setUpdatingOrderStatus] = useState(null);
    const [editingDelivery, setEditingDelivery] = useState(null);
    const [editDeliveryDate, setEditDeliveryDate] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "Electronics",
        brand: "Generic",
        stock: "10",
        image: "",
    });
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [users, setUsers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [inventorySummary, setInventorySummary] = useState({ totalProducts: 0, lowStock: 0, outOfStock: 0 });
    const [catalogForm, setCatalogForm] = useState({ type: "category", name: "" });
    const [editingCatalogId, setEditingCatalogId] = useState(null);
    const [couponForm, setCouponForm] = useState({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minPurchaseAmount: "",
        expiryDate: "",
        isActive: true,
    });
    const [editingCouponId, setEditingCouponId] = useState(null);

    // Show toast notification
    const showToast = (text, type = "success") => {
        const id = Date.now();
        setToastQueue(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
            setToastQueue(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // Check admin access
    useEffect(() => {
        const role = localStorage.getItem("role");
        const userEmail = localStorage.getItem("email");
        if (role !== "admin") {
            navigate("/login");
            return;
        }
        setAdminName(userEmail || "Admin");
        fetchProducts();
        const tab = searchParams.get("tab");
        if (tab) {
            setActiveTab(tab);
        }
    }, [navigate, searchParams]);

    useEffect(() => {
        if (activeTab === "customers") {
            fetchCustomers();
        } else if (activeTab === "delivered" || activeTab === "orders") {
            fetchOrders();
        } else if (activeTab === "product-orders") {
            fetchProductOrders();
        } else if (activeTab === "catalog") {
            fetchCatalogData();
        } else if (activeTab === "coupons") {
            fetchCoupons();
        } else if (activeTab === "inventory") {
            fetchInventory();
        } else if (activeTab === "users") {
            fetchUsers();
        }
    }, [activeTab]);

    // Fetch all products
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get("/products");
            setProducts(response.data);
            showToast("Products loaded successfully", "success");
        } catch (error) {
            showToast("Failed to fetch products", "error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch all customers
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await getCustomers();
            setCustomers(response.data || []);
            showToast("Customers loaded successfully", "success");
        } catch (error) {
            showToast("Failed to fetch customers", "error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch all orders
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getAdminOrders();
            const allOrders = response.data || [];
            setOrders(allOrders);
            // Filter delivered orders
            const delivered = allOrders.filter(order => order.status === "delivered");
            setDeliveredProducts(delivered);
            showToast("Orders loaded successfully", "success");
        } catch (error) {
            showToast("Failed to fetch orders", "error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch all product orders
    const fetchProductOrders = async () => {
        try {
            setLoading(true);
            const response = await getAdminProductOrders();
            setProductOrders(response.data || []);
            showToast("Product orders loaded successfully", "success");
        } catch (error) {
            showToast("Failed to fetch product orders", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalogData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, brandsRes] = await Promise.all([getAdminCategories(), getAdminBrands()]);
            setCategories(categoriesRes.data || []);
            setBrands(brandsRes.data || []);
        } catch (error) {
            showToast("Failed to load catalog data", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await getAdminCoupons();
            setCoupons(response.data || []);
        } catch (error) {
            showToast("Failed to load coupons", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await getAdminInventory();
            setInventory(response.data?.products || []);
            setInventorySummary(response.data?.summary || { totalProducts: 0, lowStock: 0, outOfStock: 0 });
        } catch (error) {
            showToast("Failed to load inventory", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getAdminUsers();
            setUsers(response.data || []);
        } catch (error) {
            showToast("Failed to load users", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCatalogSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = { name: catalogForm.name.trim() };
            if (!payload.name) {
                showToast("Name is required", "error");
                return;
            }
            if (catalogForm.type === "category") {
                if (editingCatalogId) {
                    await updateAdminCategory(editingCatalogId, payload);
                } else {
                    await createAdminCategory(payload);
                }
            } else {
                if (editingCatalogId) {
                    await updateAdminBrand(editingCatalogId, payload);
                } else {
                    await createAdminBrand(payload);
                }
            }
            showToast(`${catalogForm.type === "category" ? "Category" : "Brand"} saved successfully`, "success");
            setCatalogForm({ type: catalogForm.type, name: "" });
            setEditingCatalogId(null);
            await fetchCatalogData();
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to save item", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEditCatalog = (type, item) => {
        setCatalogForm({ type, name: item.name });
        setEditingCatalogId(item._id || item.id);
    };

    const handleDeleteCatalog = async (type, item) => {
        if (!window.confirm(`Delete this ${type}?`)) return;
        try {
            setLoading(true);
            if (type === "category") {
                await deleteAdminCategory(item._id || item.id);
            } else {
                await deleteAdminBrand(item._id || item.id);
            }
            showToast(`${type === "category" ? "Category" : "Brand"} deleted`, "success");
            await fetchCatalogData();
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to delete item", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                code: couponForm.code.trim().toUpperCase(),
                description: couponForm.description.trim(),
                discountType: couponForm.discountType,
                discountValue: Number(couponForm.discountValue),
                minPurchaseAmount: Number(couponForm.minPurchaseAmount) || 0,
                expiryDate: couponForm.expiryDate || undefined,
                isActive: couponForm.isActive,
            };
            if (!payload.code || !payload.discountValue) {
                showToast("Code and discount value are required", "error");
                return;
            }
            if (editingCouponId) {
                await updateAdminCoupon(editingCouponId, payload);
            } else {
                await createAdminCoupon(payload);
            }
            showToast("Coupon saved successfully", "success");
            setCouponForm({ code: "", description: "", discountType: "percentage", discountValue: "", minPurchaseAmount: "", expiryDate: "", isActive: true });
            setEditingCouponId(null);
            await fetchCoupons();
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to save coupon", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEditCoupon = (coupon) => {
        setEditingCouponId(coupon._id);
        setCouponForm({
            code: coupon.code || "",
            description: coupon.description || "",
            discountType: coupon.discountType || "percentage",
            discountValue: coupon.discountValue || "",
            minPurchaseAmount: coupon.minPurchaseAmount || "",
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : "",
            isActive: coupon.isActive !== false,
        });
    };

    const handleDeleteCoupon = async (coupon) => {
        if (!window.confirm("Delete this coupon?")) return;
        try {
            setLoading(true);
            await deleteAdminCoupon(coupon._id);
            showToast("Coupon deleted", "success");
            await fetchCoupons();
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to delete coupon", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleInventoryUpdate = async (product) => {
        try {
            const newStock = window.prompt("Enter new stock quantity", product.stock || 0);
            if (newStock === null) return;
            const stockValue = Number(newStock);
            if (Number.isNaN(stockValue)) {
                showToast("Please enter a valid number", "error");
                return;
            }
            setLoading(true);
            await updateAdminInventory(product._id, { stock: stockValue });
            showToast("Inventory updated", "success");
            await fetchInventory();
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to update inventory", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUserRoleChange = async (userId, role) => {
        try {
            setLoading(true);
            await updateAdminUserRole(userId, role);
            showToast("User role updated", "success");
            await fetchUsers();
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to update role", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Delete ${user.name || user.email}?`)) return;
        try {
            setLoading(true);
            await deleteAdminUser(user._id);
            showToast("User deleted", "success");
            await fetchUsers();
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to delete user", "error");
        } finally {
            setLoading(false);
        }
    };

    // Update order status
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            setUpdatingOrderStatus(orderId);
            await updateAdminOrderStatus(orderId, newStatus);
            showToast(`Order status updated to ${newStatus}`, "success");
            await fetchOrders();
            await fetchProductOrders();
        } catch (error) {
            showToast("Failed to update order status", "error");
        } finally {
            setUpdatingOrderStatus(null);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setOrderModalOpen(true);
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        await handleUpdateOrderStatus(orderId, "cancelled");
    };

    const handleDownloadInvoice = (order) => {
        const customerName = order.customerName || "Unknown";
        const email = order.email || "N/A";
        const date = new Date(order.createdAt).toLocaleDateString();
        const itemsHtml = (order.items || []).map((item) => `
            <tr>
                <td style="border:1px solid #ddd;padding:8px;">${item.name}</td>
                <td style="border:1px solid #ddd;padding:8px;text-align:center;">${item.quantity || 1}</td>
                <td style="border:1px solid #ddd;padding:8px;text-align:right;">₹${(item.price || 0).toLocaleString()}</td>
                <td style="border:1px solid #ddd;padding:8px;text-align:right;">₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
            </tr>`).join("");

        const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${order._id}</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#222;}h1{margin-bottom:0.25rem;}table{width:100%;border-collapse:collapse;margin-top:16px;}th,td{border:1px solid #ddd;padding:10px;}th{background:#f5f5f5;text-align:left;} .summary{margin-top:24px;}</style>
</head>
<body>
<h1>Invoice</h1>
<p><strong>Order:</strong> ${order._id}</p>
<p><strong>Customer:</strong> ${customerName}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Date:</strong> ${date}</p>
<p><strong>Status:</strong> ${order.status?.toUpperCase() || "N/A"}</p>
<p><strong>Payment Status:</strong> ${order.paymentStatus?.toUpperCase() || "N/A"}</p>
<table>
<thead>
<tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
</thead>
<tbody>${itemsHtml}</tbody>
</table>
<div class="summary">
<p><strong>Grand Total:</strong> ₹${(order.total || 0).toLocaleString()}</p>
<p><strong>Payment Method:</strong> ${order.paymentMethod || "N/A"}</p>
</div>
</body>
</html>`;

        const blob = new Blob([invoiceHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${order._id?.slice(-8)}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const closeOrderModal = () => {
        setOrderModalOpen(false);
        setSelectedOrder(null);
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                showToast("Please select a valid image file", "error");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast("Image size must be less than 5MB", "error");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData({ ...formData, image: event.target.result });
                setImagePreview(event.target.result);
                showToast("Image loaded successfully", "success");
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Add new product
    const handleAddProduct = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.image) {
            showToast("Please fill all required fields", "error");
            return;
        }

        try {
            setLoading(true);
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price) * 1.2,
                category: formData.category,
                stock: parseInt(formData.stock),
                image: formData.image,
            };

            const response = await api.post("/products", productData);

            if (response.status === 201) {
                showToast("Product added successfully", "success");
                setProducts([...products, response.data]);
                setFormData({
                    name: "",
                    description: "",
                    price: "",
                    originalPrice: "",
                    category: "Electronics",
                    stock: "10",
                    image: "",
                });
                setImagePreview("");
                setShowAddForm(false);
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to add product", "error");
        } finally {
            setLoading(false);
        }
    };

    // Delete product with confirmation
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            setLoading(true);
            const response = await api.delete(`/products/${productId}`);

            if (response.status === 200) {
                showToast("Product deleted successfully", "success");
                setProducts(products.filter(p => p._id !== productId));
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to delete product", "error");
        } finally {
            setLoading(false);
        }
    };

    // Update product
    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            showToast("Please fill all required fields", "error");
            return;
        }

        try {
            setLoading(true);
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price) * 1.2,
                category: formData.category,
                stock: parseInt(formData.stock),
                image: formData.image,
            };

            const response = await api.put(`/products/${editingId}`, productData);

            if (response.status === 200) {
                showToast("Product updated successfully", "success");
                setProducts(products.map(p => p._id === editingId ? response.data : p));
                setFormData({
                    name: "",
                    description: "",
                    price: "",
                    originalPrice: "",
                    category: "Electronics",
                    stock: "10",
                    image: "",
                });
                setImagePreview("");
                setEditingId(null);
                setShowAddForm(false);
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to update product", "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const handleEditProduct = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            category: product.category,
            stock: product.stock,
            image: product.image,
        });
        setImagePreview(product.image);
        setEditingId(product._id);
        setShowAddForm(true);
        window.scrollTo(0, 0);
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        showToast("Logged out successfully", "success");
        setTimeout(() => navigate("/login"), 1500);
    };

    // Filter and search products
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || product.category === filterCategory;
        const matchesStock =
            filterStock === "all" ? true :
                filterStock === "in-stock" ? product.stock > 0 :
                    product.stock === 0;
        return matchesSearch && matchesCategory && matchesStock;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    return (
        <div className="admin-dashboard">
            {/* Toast Notifications */}
            <div className="toast-container">
                {toastQueue.map((toast) => (
                    <div key={toast.id} className={`toast ${toast.type}`}>
                        {toast.text}
                    </div>
                ))}
            </div>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
                <div className="sidebar-header">
                    <h2>📊 EmberCart Admin</h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        ☰
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                        onClick={() => setActiveTab("dashboard")}
                    >
                        📈 Dashboard
                    </button>
                    <button
                        className={`nav-item ${activeTab === "products" ? "active" : ""}`}
                        onClick={() => setActiveTab("products")}
                    >
                        📦 Products
                    </button>
                    <button
                        className={`nav-item ${activeTab === "customers" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("customers");
                            fetchCustomers();
                        }}
                    >
                        👥 Customers
                    </button>
                    <button
                        className={`nav-item ${activeTab === "delivered" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("delivered");
                            fetchOrders();
                        }}
                    >
                        ✅ Delivered Products
                    </button>
                    <button
                        className={`nav-item ${activeTab === "product-orders" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("product-orders");
                            fetchProductOrders();
                        }}
                    >
                        📦 Product Orders
                    </button>
                    <button
                        className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("orders");
                            fetchOrders();
                        }}
                    >
                        🛒 Orders
                    </button>
                    <button
                        className={`nav-item ${activeTab === "catalog" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("catalog");
                            fetchCatalogData();
                        }}
                    >
                        🗂️ Catalog
                    </button>
                    <button
                        className={`nav-item ${activeTab === "coupons" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("coupons");
                            fetchCoupons();
                        }}
                    >
                        🎟️ Coupons
                    </button>
                    <button
                        className={`nav-item ${activeTab === "inventory" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("inventory");
                            fetchInventory();
                        }}
                    >
                        📦 Inventory
                    </button>
                    <button
                        className={`nav-item ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("users");
                            fetchUsers();
                        }}
                    >
                        👤 Users
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <div className="header-left">
                        <button
                            className="menu-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            ☰
                        </button>
                        <h1 className="page-title">
                            {activeTab === "dashboard" && "Dashboard"}
                            {activeTab === "products" && "Product Management"}
                            {activeTab === "customers" && "Customers"}
                            {activeTab === "delivered" && "Delivered Products"}
                            {activeTab === "product-orders" && "Product Orders Management"}
                            {activeTab === "orders" && "Orders"}
                            {activeTab === "catalog" && "Catalog Management"}
                            {activeTab === "coupons" && "Coupon Management"}
                            {activeTab === "inventory" && "Inventory Management"}
                            {activeTab === "users" && "User Management"}
                        </h1>
                    </div>
                    <div className="header-right">
                        <span className="admin-email">👤 {adminName}</span>
                        <button className="profile-btn">⚙️</button>
                    </div>
                </header>

                {/* Dashboard Tab */}
                {activeTab === "dashboard" && (
                    <section className="dashboard-section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📦</div>
                                <div className="stat-content">
                                    <h3>Total Products</h3>
                                    <p className="stat-value">{products.length}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✅</div>
                                <div className="stat-content">
                                    <h3>In Stock</h3>
                                    <p className="stat-value">{products.filter(p => p.stock > 0).length}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⚠️</div>
                                <div className="stat-content">
                                    <h3>Out of Stock</h3>
                                    <p className="stat-value">{products.filter(p => p.stock === 0).length}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-content">
                                    <h3>Total Value</h3>
                                    <p className="stat-value">₹{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="actions-grid">
                                <button
                                    className="action-btn add"
                                    onClick={() => {
                                        setActiveTab("products");
                                        setShowAddForm(true);
                                    }}
                                >
                                    ➕ Add Product
                                </button>
                                <button className="action-btn view">📊 View Reports</button>
                                <button className="action-btn settings">⚙️ Settings</button>
                                <button className="action-btn help">❓ Help</button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                    <section className="products-section">
                        {/* Add/Edit Form */}
                        {showAddForm && (
                            <div className="form-container">
                                <h2>{editingId ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
                                <form onSubmit={editingId ? handleUpdateProduct : handleAddProduct} className="product-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Product Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Enter product name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select name="category" value={formData.category} onChange={handleInputChange}>
                                                <option>Electronics</option>
                                                <option>Home & Garden</option>
                                                <option>Fashion</option>
                                                <option>Sports</option>
                                                <option>Books</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Price (₹) *</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="Enter price"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Original Price (₹)</label>
                                            <input
                                                type="number"
                                                name="originalPrice"
                                                value={formData.originalPrice}
                                                onChange={handleInputChange}
                                                placeholder="Enter original price"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Stock Quantity</label>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleInputChange}
                                                placeholder="Enter stock"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Enter product description"
                                            rows="4"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Product Image *</label>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} required={!editingId} />
                                        {imagePreview && (
                                            <div className="image-preview">
                                                <img src={imagePreview} alt="Preview" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="btn-submit" disabled={loading}>
                                            {loading ? "⏳ Processing..." : (editingId ? "💾 Update Product" : "➕ Add Product")}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-cancel"
                                            onClick={() => {
                                                setShowAddForm(false);
                                                setEditingId(null);
                                                setFormData({
                                                    name: "",
                                                    description: "",
                                                    price: "",
                                                    originalPrice: "",
                                                    category: "Electronics",
                                                    stock: "10",
                                                    image: "",
                                                });
                                                setImagePreview("");
                                            }}
                                        >
                                            ✕ Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Search and Filter */}
                        {!showAddForm && (
                            <div className="search-filter-section">
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="🔍 Search products by name..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>

                                <div className="filter-group">
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => {
                                            setFilterCategory(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Home & Garden">Home & Garden</option>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Books">Books</option>
                                    </select>

                                    <select
                                        value={filterStock}
                                        onChange={(e) => {
                                            setFilterStock(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="all">All Stock Status</option>
                                        <option value="in-stock">In Stock</option>
                                        <option value="out-of-stock">Out of Stock</option>
                                    </select>

                                    <button
                                        className="btn-add-product"
                                        onClick={() => setShowAddForm(true)}
                                    >
                                        ➕ Add Product
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Products Table */}
                        {!showAddForm && (
                            <div className="products-list-section">
                                <div className="section-header">
                                    <h2>📦 Products ({filteredProducts.length})</h2>
                                    {filteredProducts.length > 0 && (
                                        <span className="page-info">Page {currentPage} of {totalPages}</span>
                                    )}
                                </div>

                                {loading && (
                                    <div className="loading-spinner">
                                        <div className="spinner"></div>
                                        <p>Loading products...</p>
                                    </div>
                                )}

                                {!loading && filteredProducts.length === 0 && (
                                    <div className="empty-state">
                                        <p>📭 No products found</p>
                                        {searchTerm || filterCategory !== "all" || filterStock !== "all" ? (
                                            <button onClick={() => {
                                                setSearchTerm("");
                                                setFilterCategory("all");
                                                setFilterStock("all");
                                                setCurrentPage(1);
                                            }}>Clear Filters</button>
                                        ) : (
                                            <button onClick={() => setShowAddForm(true)}>Add your first product</button>
                                        )}
                                    </div>
                                )}

                                {!loading && filteredProducts.length > 0 && (
                                    <>
                                        <div className="table-responsive">
                                            <table className="products-table">
                                                <thead>
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Product Name</th>
                                                        <th>Category</th>
                                                        <th>Price</th>
                                                        <th>Stock</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentProducts.map((product) => (
                                                        <tr key={product._id}>
                                                            <td className="product-image-cell">
                                                                <img src={product.image} alt={product.name} />
                                                            </td>
                                                            <td className="product-name-cell">
                                                                <strong>{product.name}</strong>
                                                                <br />
                                                                <small>{product.description?.substring(0, 50)}...</small>
                                                            </td>
                                                            <td>{product.category || "Electronics"}</td>
                                                            <td className="price-cell">₹{product.price.toLocaleString()}</td>
                                                            <td>
                                                                <span className={`stock-badge ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
                                                                    {product.stock > 0 ? `✓ ${product.stock}` : "Out"}
                                                                </span>
                                                            </td>
                                                            <td className="actions-cell">
                                                                <button
                                                                    className="btn-edit"
                                                                    onClick={() => handleEditProduct(product)}
                                                                    title="Edit"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    className="btn-delete"
                                                                    onClick={() => handleDeleteProduct(product._id)}
                                                                    title="Delete"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="pagination">
                                                <button
                                                    onClick={() => setCurrentPage(1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    ⏮ First
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    ⏪ Prev
                                                </button>
                                                <span className="page-number">{currentPage} / {totalPages}</span>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next ⏩
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(totalPages)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Last ⏭
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {/* Customers Tab */}
                {activeTab === "customers" && (
                    <section className="customers-section">
                        <div className="section-header">
                            <h2>👥 Customers ({customers.length})</h2>
                        </div>

                        {loading && (
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <p>Loading customers...</p>
                            </div>
                        )}

                        {!loading && customers.length === 0 && (
                            <div className="empty-state">
                                <p>📭 No customers found</p>
                            </div>
                        )}

                        {!loading && customers.length > 0 && (
                            <div className="table-responsive">
                                <table className="products-table">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Total Orders</th>
                                            <th>Total Spent</th>
                                            <th>Joined Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map((customer) => (
                                            <tr key={customer._id}>
                                                <td>{customer.email}</td>
                                                <td>{customer.name || "N/A"}</td>
                                                <td>{customer.phone || "N/A"}</td>
                                                <td><strong>{customer.totalOrders || 0}</strong></td>
                                                <td>₹{(customer.totalSpent || 0).toLocaleString()}</td>
                                                <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* Delivered Products Tab */}
                {activeTab === "delivered" && (
                    <section className="delivered-section">
                        <div className="section-header">
                            <h2>✅ Delivered Products ({deliveredProducts.length})</h2>
                        </div>

                        {loading && (
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <p>Loading delivered orders...</p>
                            </div>
                        )}

                        {!loading && deliveredProducts.length === 0 && (
                            <div className="empty-state">
                                <p>📭 No delivered orders yet</p>
                            </div>
                        )}

                        {!loading && deliveredProducts.length > 0 && (
                            <div className="delivered-grid">
                                {deliveredProducts.map((order) => (
                                    <div key={order._id} className="delivered-card">
                                        <div className="order-header">
                                            <h3>Order #{order._id?.slice(-6).toUpperCase()}</h3>
                                            <span className="delivered-badge">✅ DELIVERED</span>
                                        </div>
                                        <div className="order-details">
                                            <p><strong>Customer:</strong> {order.customerName || order.email}</p>
                                            <p><strong>Delivery Date:</strong> {new Date(order.deliveredAt || order.updatedAt).toLocaleDateString()}</p>
                                            <p><strong>Total Amount:</strong> ₹{(order.total || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="order-items">
                                            <h4>📦 Items Delivered:</h4>
                                            <ul>
                                                {order.items?.map((item, idx) => (
                                                    <li key={idx}>
                                                        {item.name} (Qty: {item.quantity})
                                                    </li>
                                                )) || <li>No items</li>}
                                            </ul>
                                        </div>
                                        {order.shippingAddress && (
                                            <div className="shipping-info">
                                                <h4>📍 Delivery Address:</h4>
                                                <p>{order.shippingAddress.address}</p>
                                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Product Orders Tab */}
                {activeTab === "product-orders" && (
                    <section className="product-orders-section">
                        <div className="section-header">
                            <h2>📦 Product Orders ({productOrders.length})</h2>
                        </div>

                        {loading && (
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <p>Loading product orders...</p>
                            </div>
                        )}

                        {!loading && productOrders.length === 0 && (
                            <div className="empty-state">
                                <p>📭 No product orders found</p>
                            </div>
                        )}

                        {!loading && productOrders.length > 0 && (
                            <div className="product-orders-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer Name</th>
                                            <th>Product Name</th>
                                            <th>Quantity</th>
                                            <th>Unit Price</th>
                                            <th>Total Order Price</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productOrders.map((order) => (
                                            <tr key={`${order.orderId}-${order.productId}`}>
                                                <td className="order-id-cell">
                                                    <strong>{order.orderNumber}</strong>
                                                </td>
                                                <td className="customer-name-cell">
                                                    {order.customerName}
                                                    <br />
                                                    <small>{order.email}</small>
                                                </td>
                                                <td className="product-name-cell">
                                                    <strong>{order.productName}</strong>
                                                </td>
                                                <td className="quantity-cell">
                                                    {order.quantity}
                                                </td>
                                                <td className="price-cell">
                                                    ₹{(order.productPrice || 0).toLocaleString()}
                                                </td>
                                                <td className="total-price-cell">
                                                    <strong>₹{(order.totalOrderPrice || 0).toLocaleString()}</strong>
                                                </td>
                                                <td className="status-cell">
                                                    <span className={`status-badge ${order.status}`}>
                                                        {order.status?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="action-cell">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                                                        disabled={updatingOrderStatus === order.orderId}
                                                        className="status-dropdown"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                    <section className="orders-section">
                        <div className="section-header">
                            <h2>🛒 Orders ({orders.length})</h2>
                        </div>

                        {loading && (
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <p>Loading orders...</p>
                            </div>
                        )}

                        {!loading && orders.length === 0 && (
                            <div className="empty-state">
                                <p>📭 No orders found</p>
                            </div>
                        )}

                        {!loading && orders.length > 0 && (
                            <div className="table-responsive">
                                <table className="orders-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Products</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                            <th>Placed</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order._id}>
                                                <td>{order._id?.slice(-8).toUpperCase()}</td>
                                                <td>
                                                    <strong>{order.customerName || "Unknown"}</strong>
                                                    <br />
                                                    <small>{order.email || "N/A"}</small>
                                                </td>
                                                <td className="order-products-cell">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={`${order._id}-${idx}`} className="order-product-item">
                                                            <span>{item.name}</span>
                                                            <span className="order-product-meta">x{item.quantity || 1}</span>
                                                        </div>
                                                    ))}
                                                </td>
                                                <td>₹{(order.total || 0).toLocaleString()}</td>
                                                <td>
                                                    <span className={`status-badge ${order.status}`}>
                                                        {order.status?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${order.paymentStatus || "pending"}`}>
                                                        {(order.paymentStatus || "pending").toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="order-row-actions">
                                                        <button className="btn-view" onClick={() => handleViewOrder(order)}>View</button>
                                                        <button className="btn-invoice" onClick={() => handleDownloadInvoice(order)}>Invoice</button>
                                                        <button className="btn-cancel" onClick={() => handleCancelOrder(order._id)}>Cancel</button>
                                                    </div>
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                                        disabled={updatingOrderStatus === order._id}
                                                        className="status-dropdown"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {orderModalOpen && selectedOrder && (
                    <div className="modal-overlay" onClick={closeOrderModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Order Details</h3>
                                <button className="modal-close" onClick={closeOrderModal}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="order-detail-grid">
                                    <div>
                                        <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                                        <p><strong>Customer:</strong> {selectedOrder.customerName || "Unknown"}</p>
                                        <p><strong>Email:</strong> {selectedOrder.email || "N/A"}</p>
                                        <p><strong>Status:</strong> {selectedOrder.status?.toUpperCase()}</p>
                                        <p><strong>Payment:</strong> {(selectedOrder.paymentStatus || "pending").toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p><strong>Placed:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                        <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || "N/A"}</p>
                                        <p><strong>Shipping:</strong> {selectedOrder.shippingAddress?.line1 || "N/A"}</p>
                                        <p><strong>City:</strong> {selectedOrder.shippingAddress?.city || "N/A"}</p>
                                        <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="order-items-detail">
                                    <h4>Products</h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items?.map((item, idx) => (
                                                <tr key={`${selectedOrder._id}-${idx}`}>
                                                    <td>{item.name}</td>
                                                    <td>{item.quantity || 1}</td>
                                                    <td>₹{(item.price || 0).toLocaleString()}</td>
                                                    <td>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Catalog Tab */}
                {activeTab === "catalog" && (
                    <section className="catalog-section">
                        <div className="section-header">
                            <h2>🗂️ Catalog Management</h2>
                        </div>
                        <form onSubmit={handleCatalogSubmit} className="product-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select value={catalogForm.type} onChange={(e) => setCatalogForm({ ...catalogForm, type: e.target.value })}>
                                        <option value="category">Category</option>
                                        <option value="brand">Brand</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input type="text" value={catalogForm.name} onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })} placeholder="Enter name" />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-submit">{editingCatalogId ? "Update" : "Create"}</button>
                                {editingCatalogId && <button type="button" className="btn-cancel" onClick={() => { setEditingCatalogId(null); setCatalogForm({ type: catalogForm.type, name: "" }); }}>Cancel</button>}
                            </div>
                        </form>
                        <div className="catalog-grid">
                            <div className="catalog-card">
                                <h3>Categories</h3>
                                <ul>
                                    {categories.map((item) => (
                                        <li key={item._id || item.id}>
                                            <span>{item.name}</span>
                                            <div>
                                                <button className="btn-edit" onClick={() => handleEditCatalog("category", item)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDeleteCatalog("category", item)}>Delete</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="catalog-card">
                                <h3>Brands</h3>
                                <ul>
                                    {brands.map((item) => (
                                        <li key={item._id || item.id}>
                                            <span>{item.name}</span>
                                            <div>
                                                <button className="btn-edit" onClick={() => handleEditCatalog("brand", item)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDeleteCatalog("brand", item)}>Delete</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                )}

                {/* Coupons Tab */}
                {activeTab === "coupons" && (
                    <section className="coupons-section">
                        <div className="section-header">
                            <h2>🎟️ Coupon Management</h2>
                        </div>
                        <form onSubmit={handleCouponSubmit} className="product-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Code</label>
                                    <input type="text" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} placeholder="SAVE10" />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input type="text" value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} placeholder="Holiday offer" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Discount Type</label>
                                    <select value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}>
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Discount Value</label>
                                    <input type="number" value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })} placeholder="10" />
                                </div>
                                <div className="form-group">
                                    <label>Minimum Purchase</label>
                                    <input type="number" value={couponForm.minPurchaseAmount} onChange={(e) => setCouponForm({ ...couponForm, minPurchaseAmount: e.target.value })} placeholder="500" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expiry Date</label>
                                    <input type="date" value={couponForm.expiryDate} onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select value={couponForm.isActive ? "active" : "inactive"} onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.value === "active" })}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-submit">{editingCouponId ? "Update" : "Create"}</button>
                                {editingCouponId && <button type="button" className="btn-cancel" onClick={() => { setEditingCouponId(null); setCouponForm({ code: "", description: "", discountType: "percentage", discountValue: "", minPurchaseAmount: "", expiryDate: "", isActive: true }); }}>Cancel</button>}
                            </div>
                        </form>
                        <div className="table-responsive">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Description</th>
                                        <th>Discount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map((coupon) => (
                                        <tr key={coupon._id}>
                                            <td>{coupon.code}</td>
                                            <td>{coupon.description}</td>
                                            <td>{coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                                            <td>{coupon.isActive ? "Active" : "Inactive"}</td>
                                            <td>
                                                <button className="btn-edit" onClick={() => handleEditCoupon(coupon)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDeleteCoupon(coupon)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Inventory Tab */}
                {activeTab === "inventory" && (
                    <section className="inventory-section">
                        <div className="section-header">
                            <h2>📦 Inventory Management</h2>
                        </div>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📦</div>
                                <div className="stat-content">
                                    <h3>Total Products</h3>
                                    <p className="stat-value">{inventorySummary.totalProducts}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⚠️</div>
                                <div className="stat-content">
                                    <h3>Low Stock</h3>
                                    <p className="stat-value">{inventorySummary.lowStock}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">❌</div>
                                <div className="stat-content">
                                    <h3>Out of Stock</h3>
                                    <p className="stat-value">{inventorySummary.outOfStock}</p>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Brand</th>
                                        <th>Stock</th>
                                        <th>Price</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map((product) => (
                                        <tr key={product._id}>
                                            <td>{product.name}</td>
                                            <td>{product.category}</td>
                                            <td>{product.brand || "Generic"}</td>
                                            <td>{product.stock}</td>
                                            <td>₹{(product.price || 0).toLocaleString()}</td>
                                            <td><button className="btn-edit" onClick={() => handleInventoryUpdate(product)}>Adjust Stock</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <section className="users-section">
                        <div className="section-header">
                            <h2>👤 User Management</h2>
                        </div>
                        <div className="table-responsive">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td>{user.name || "N/A"}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <select value={user.role || "user"} onChange={(e) => handleUserRoleChange(user._id, e.target.value)}>
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button className="btn-delete" onClick={() => handleDeleteUser(user)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default AdminPanel;
