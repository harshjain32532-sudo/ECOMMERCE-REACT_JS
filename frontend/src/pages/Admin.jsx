import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, getProducts, createProduct, deleteProduct, updateProduct, getAdminStats, getCustomers, createCustomer } from "../api.js";

function Admin() {
    const navigate = useNavigate();
    const [product, setProduct] = useState({ name: "", price: "", image: "", description: "", stock: 10 });
    const [customer, setCustomer] = useState({ name: "", email: "", password: "" });
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [dbStatus, setDbStatus] = useState("Checking...");
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                setStatus("❌ Please select a valid image file");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setStatus("❌ Image size must be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                setProduct({ ...product, image: imageData });
                setImagePreview(imageData);
                setStatus("✅ Image loaded successfully");
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const loadAdminData = async () => {
            try {
                const profileRes = await getProfile();
                if (profileRes.data.role !== "admin") {
                    navigate("/");
                    return;
                }
                setDbStatus("Connected ✅");
                await loadProducts();
                await loadStats();
                await loadCustomers();
            } catch (err) {
                console.error(err);
                setDbStatus("Connection Error ❌");
                navigate("/");
            }
        };

        const loadCustomers = async () => {
            try {
                const res = await getCustomers();
                setCustomers(res.data);
            } catch (error) {
                const serverMessage = error.response?.data?.error || error.message;
                console.error("loadCustomers error:", error);
                setDbStatus("Error loading customers ❌");
                setStatus(`❌ Failed to load customers: ${serverMessage}`);
                throw error;
            }
        };

        loadAdminData();
    }, []);

    const refreshData = async () => {
        setDbStatus("Refreshing...");
        try {
            await loadProducts();
            await loadStats();
            await loadCustomers();
            setDbStatus("Connected ✅");
            setStatus("Data refreshed from database!");
        } catch (error) {
            setDbStatus("Refresh failed ❌");
            setStatus("Failed to refresh data");
        }
    };

    const loadProducts = async () => {
        try {
            const res = await getProducts();
            setProducts(res.data);
        } catch (error) {
            const serverMessage = error.response?.data?.error || error.message;
            setStatus(`❌ Failed to load products: ${serverMessage}`);
            console.error("loadProducts error:", error);
            throw error;
        }
    };

    const loadStats = async () => {
        try {
            const res = await getAdminStats();
            setStats(res.data);
        } catch (error) {
            const serverMessage = error.response?.data?.error || error.message;
            setStatus(`❌ Failed to load stats: ${serverMessage}`);
            console.error("loadStats error:", error);
            throw error;
        }
    };

    const handleAddProduct = async () => {
        if (!localStorage.getItem("token")) {
            setStatus("❌ No auth token found. Please log in as admin and try again.");
            return;
        }

        if (!product.name || !product.price) {
            setStatus("Name and price are required.");
            return;
        }

        const imageValue = (product.image || "").trim();
        if (imageValue && !imageValue.startsWith("data:") && !/^https?:\/\//i.test(imageValue)) {
            setStatus("❌ Image must be an uploaded file or a valid http/https URL");
            return;
        }

        setLoading(true);
        setStatus("Saving to database...");
        try {
            const payload = {
                name: product.name,
                price: Number(product.price),
                image: imageValue,
                description: product.description || "",
                stock: Number(product.stock) || 0,
            };
            console.log("[Admin] save product payload", payload);

            let res;
            if (editingId) {
                res = await updateProduct(editingId, payload);
                setProducts(prev => prev.map(p => p._id === editingId ? res.data : p));
                setStatus("✅ Product updated in database!");
            } else {
                res = await createProduct(payload);
                setProducts(prev => [...prev, res.data]);
                setStatus("✅ Product added to database!");
            }
            setProduct({ name: "", price: "", image: "", description: "", stock: 10 });
            setImagePreview("");
            setEditingId(null);
            await loadStats();
        } catch (error) {
            const serverMessage = error.response?.data?.error || error.message;
            setStatus(`❌ Failed to save to database: ${serverMessage}`);
            console.error("Add product error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async () => {
        if (!customer.name || !customer.email || !customer.password) {
            setStatus("Name, email, and password are required for a customer.");
            return;
        }

        setLoading(true);
        setStatus("Creating customer in database...");
        try {
            const res = await createCustomer(customer);
            setCustomers(prev => [res.data.customer, ...prev]);
            setCustomer({ name: "", email: "", password: "" });
            setStatus("✅ Customer added to database!");
            loadStats();
        } catch (error) {
            setStatus("❌ Failed to add customer to database: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (item) => {
        setProduct({ name: item.name, price: item.price, image: item.image, description: item.description, stock: item.stock });
        setImagePreview(item.image);
        setEditingId(item._id);
        setStatus(`Editing product: ${item.name}`);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setProduct({ name: "", price: "", image: "", description: "", stock: 10 });
        setImagePreview("");
        setStatus("Edit canceled");
    };

    const handleDeleteProduct = async (id) => {
        if (confirm("Delete this product from database?")) {
            setStatus("Deleting from database...");
            try {
                await deleteProduct(id);
                setProducts(prev => prev.filter(p => p._id !== id));
                setStatus("✅ Product deleted from database!");
                loadStats();
            } catch (error) {
                setStatus("❌ Failed to delete from database");
            }
        }
    };

    return (
        <div style={styles.container}>
            <h1>Admin Dashboard</h1>
            <p>Manage products and inventory.</p>
            <div style={styles.dbStatus}>
                <span>Database Status: {dbStatus}</span>
                <button onClick={refreshData} style={styles.refreshButton}>🔄 Refresh Data</button>
            </div>
            {stats && (
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <h3>{stats.usersCount}</h3>
                        <p>Users</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3>{stats.productsCount}</h3>
                        <p>Products</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3>{stats.ordersCount}</h3>
                        <p>Orders</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3>₹{stats.totalSales}</h3>
                        <p>Total Sales</p>
                    </div>
                </div>
            )}
            {status && <div style={styles.status}>{status}</div>}
            <div style={styles.addSection}>
                <h2>Add New Product</h2>
                <div style={styles.form}>
                    <input value={product.name} placeholder="Product name" onChange={e => setProduct({ ...product, name: e.target.value })} style={styles.input} />
                    <input value={product.price} type="number" placeholder="Price" onChange={e => setProduct({ ...product, price: e.target.value })} style={styles.input} />

                    <div style={styles.imageUploadSection}>
                        <label style={styles.fileInputLabel}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={styles.fileInput}
                            />
                            📁 Browse & Upload Image
                        </label>
                        <p style={styles.imageHint}>or paste image URL below</p>
                        <input
                            value={product.image && !product.image.startsWith("data:") ? product.image : ""}
                            placeholder="Image URL (online)"
                            onChange={e => {
                                setProduct({ ...product, image: e.target.value });
                                setImagePreview(e.target.value);
                            }}
                            style={styles.input}
                        />
                    </div>

                    {imagePreview && (
                        <div style={styles.previewSection}>
                            <p style={styles.previewLabel}>Image Preview:</p>
                            <img src={imagePreview} alt="Preview" style={styles.previewImage} onError={() => setStatus("❌ Failed to load image")} />
                        </div>
                    )}

                    <input value={product.stock} type="number" placeholder="Stock" onChange={e => setProduct({ ...product, stock: e.target.value })} style={styles.input} />
                    <textarea value={product.description} placeholder="Description" rows={4} onChange={e => setProduct({ ...product, description: e.target.value })} style={styles.input} />
                    <div style={styles.editActions}>
                        <button onClick={handleAddProduct} disabled={loading} style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}>
                            {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                        </button>
                        {editingId && (
                            <button onClick={handleCancelEdit} style={{ ...styles.button, background: "#aaa", marginLeft: 8 }}>
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div style={styles.addSection}>
                <h2>Add New Customer</h2>
                <div style={styles.form}>
                    <input value={customer.name} placeholder="Customer name" onChange={e => setCustomer({ ...customer, name: e.target.value })} style={styles.input} />
                    <input value={customer.email} type="email" placeholder="Customer email" onChange={e => setCustomer({ ...customer, email: e.target.value })} style={styles.input} />
                    <input value={customer.password} type="password" placeholder="Customer password" onChange={e => setCustomer({ ...customer, password: e.target.value })} style={styles.input} />
                    <button onClick={handleAddCustomer} disabled={loading} style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}>{loading ? "Adding..." : "Add Customer"}</button>
                </div>
            </div>
            <div style={styles.productsSection}>
                <h2>Products ({products.length})</h2>
                {products.length === 0 ? <p>No products found.</p> : <div style={styles.productsList}>{products.map(p => (
                    <div key={p._id} style={styles.productCard}>
                        <div style={styles.productHeader}>
                            {p.image && <img src={p.image} alt={p.name} style={styles.productImage} />}
                            <div style={styles.productInfo}>
                                <h3>{p.name}</h3>
                                <p>₹{p.price}</p>
                                <p style={styles.stock}>Stock: {p.stock}</p>
                                <p style={styles.description}>{p.description}</p>
                            </div>
                        </div>
                        <div style={styles.productActions}>
                            <button onClick={() => handleEditProduct(p)} style={styles.editButton}>Edit</button>
                            <button onClick={() => handleDeleteProduct(p._id)} style={styles.deleteButton}>Delete</button>
                        </div>
                    </div>
                ))}</div>}
            </div>
            <div style={styles.productsSection}>
                <h2>Customers ({customers.length})</h2>
                {customers.length === 0 ? <p>No customers found.</p> : <div style={styles.productsList}>{customers.map(c => (
                    <div key={c._id || c.id} style={styles.productCard}>
                        <div style={styles.productInfo}>
                            <h3>{c.name || "No name"}</h3>
                            <p>{c.email}</p>
                            <p style={styles.stock}>Joined: {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}</div>}
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: 1000, margin: "0 auto", padding: 20 },
    dbStatus: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, marginBottom: 20, borderRadius: 4, background: "#e8f4fd", border: "1px solid #b3d9ff" },
    refreshButton: { padding: 8, background: "#28a745", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 },
    status: { padding: 12, marginBottom: 20, borderRadius: 4, background: "#d4edda", color: "#155724" },
    addSection: { background: "#f5f5f5", padding: 24, borderRadius: 8, marginBottom: 32 },
    form: { display: "grid", gap: 12, marginTop: 16 },
    input: { padding: 12, border: "1px solid #ddd", borderRadius: 4, fontSize: 14 },
    button: { padding: 12, background: "#3498db", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 16, fontWeight: "bold" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 },
    statCard: { padding: 20, borderRadius: 8, background: "#f5f8ff", border: "1px solid #dce7ff", textAlign: "center" },
    productsSection: { marginTop: 32 },
    productsList: { display: "grid", gap: 16, marginTop: 16 },
    productCard: { border: "1px solid #ddd", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 16 },
    productHeader: { display: "flex", gap: 16, flex: 1 },
    productImage: { width: 100, height: 100, objectFit: "cover", borderRadius: 4 },
    productInfo: { flex: 1 },
    stock: { fontSize: 12, color: "#666" },
    description: { fontSize: 12, color: "#999", marginTop: 8 },
    productActions: { display: "flex", gap: 12 },
    editButton: { padding: "8px 16px", background: "#f39c12", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", height: "fit-content" },
    deleteButton: { padding: "8px 16px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", height: "fit-content" },
    editActions: { display: "flex", gap: 8, alignItems: "center" },
    fileInput: { display: "none" },
    fileInputLabel: { padding: 12, background: "#28a745", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14, fontWeight: "bold", display: "inline-block", textAlign: "center" },
    imageUploadSection: { display: "flex", flexDirection: "column", gap: 12 },
    imageHint: { fontSize: 12, color: "#666", margin: "4px 0 0 0" },
    previewSection: { display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "#fff", borderRadius: 4, border: "1px solid #ddd" },
    previewLabel: { fontSize: 12, fontWeight: "bold", color: "#333", margin: 0 },
    previewImage: { maxWidth: "100%", maxHeight: 300, borderRadius: 4, objectFit: "contain" }
};

export default Admin;
