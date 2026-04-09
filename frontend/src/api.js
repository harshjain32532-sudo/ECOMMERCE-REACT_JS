import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
    baseURL: API_BASE,
});

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return {
        Authorization: `Bearer ${token}`,
    };
};

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.debug("[api] request", config.method, config.url, "token:", Boolean(token));
    return config;
});

// Auth
export const register = (name, email, password) =>
    api.post("/register", { name, email, password });

export const login = (email, password) =>
    api.post("/login", { email, password });

export const forgotPassword = (email) =>
    api.post("/forgot-password", { email });

export const getCustomers = () => api.get("/admin/customers");
export const createCustomer = (data) => api.post("/admin/customers", data);

export const resetPassword = (token, password) =>
    api.post("/reset-password", { token, password });

export const getUser = () => api.get("/user");
export const getProfile = () => api.get("/user/profile");
export const updateProfile = (data) => api.put("/user/profile", data);
export const changePassword = (data) => api.put("/user/password", data);

export const getCart = () => api.get("/cart");
export const saveCart = (cart) => api.put("/cart", { cart });

export const getWishlist = () => api.get("/wishlist");
export const addToWishlist = (item) => api.post("/wishlist", { item });
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

// Products
export const getProducts = () => api.get("/products");
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token available. Please log in.");
    return api.post("/products", data, { headers: getAuthHeaders() });
};
export const updateProduct = (id, data) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token available. Please log in.");
    return api.put(`/products/${id}`, data, { headers: getAuthHeaders() });
};
export const deleteProduct = (id) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token available. Please log in.");
    return api.delete(`/products/${id}`, { headers: getAuthHeaders() });
};

// Orders
export const getOrders = () => api.get("/orders");
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post("/orders", data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);

export const getAdminStats = () => api.get("/admin/stats");
