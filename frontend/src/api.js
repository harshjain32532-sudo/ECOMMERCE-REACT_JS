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

export const registerWithOTP = (name, email, phone) =>
    api.post("/api/auth/register", { name, email, phone });

export const verifySignupOTP = (email, otp, password, name, phone) =>
    api.post("/api/auth/verify-otp-signup", { email, otp, password, name, phone });

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
export const cancelOrder = (id) => api.post(`/orders/${id}/cancel`);
export const requestReturn = (id, data) => api.post(`/orders/${id}/return`, data);
export const getOrderRefund = (id) => api.get(`/orders/${id}/refund`);
export const aiOrderAssistant = (orderId, message) => api.post("/ai/order-assistant", { orderId, message });
export const aiReturnAssistant = (orderId, message, action, options = {}) =>
    api.post("/ai/return-assistant", { orderId, message, action, useOpenAI: options.useOpenAI });
export const getAdminOrders = () => api.get("/admin/orders");
export const getAdminProductOrders = () => api.get("/admin/product-orders");
export const updateAdminOrderStatus = (orderId, status, message) =>
    api.put(`/admin/orders/${orderId}/status`, { status, message });
export const getAdminDeliveryTracking = () => api.get("/admin/delivery-tracking");
export const updateDeliveryDate = (orderId, deliveredAt, trackingNumber) =>
    api.put(`/admin/delivery/${orderId}`, { deliveredAt, trackingNumber });

export const getAdminStats = () => api.get("/admin/stats");
export const getAdminCategories = () => api.get("/admin/categories");
export const createAdminCategory = (data) => api.post("/admin/categories", data);
export const updateAdminCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const deleteAdminCategory = (id) => api.delete(`/admin/categories/${id}`);
export const getAdminBrands = () => api.get("/admin/brands");
export const createAdminBrand = (data) => api.post("/admin/brands", data);
export const updateAdminBrand = (id, data) => api.put(`/admin/brands/${id}`, data);
export const deleteAdminBrand = (id) => api.delete(`/admin/brands/${id}`);
export const getAdminUsers = () => api.get("/admin/users");
export const updateAdminUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminCoupons = () => api.get("/admin/coupons");
export const createAdminCoupon = (data) => api.post("/admin/coupons", data);
export const updateAdminCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data);
export const deleteAdminCoupon = (id) => api.delete(`/admin/coupons/${id}`);
export const getAdminInventory = () => api.get("/admin/inventory");
export const updateAdminInventory = (productId, data) => api.put(`/admin/inventory/${productId}`, data);

// OTP & SMS Verification
export const sendOTP = (phone, provider = "twilio") =>
    api.post("/otp/send", { phone, provider });

export const verifyOTP = (phone, otp) =>
    api.post("/otp/verify", { phone, otp });

// 2FA Methods
export const enable2FA = (method) =>
    api.post("/user/2fa/enable", { method });

export const disable2FA = (method) =>
    api.post("/user/2fa/disable", { method });

export const get2FAStatus = () =>
    api.get("/user/2fa/status");

export const updatePhoneNumber = (phone) =>
    api.post("/user/phone/update", { phone });

// ========== EMAIL PREFERENCES ==========
export const getEmailPreferences = () =>
    api.get("/user/email-preferences");

export const updateEmailPreferences = (preferences) =>
    api.put("/user/email-preferences", preferences);

// ========== COUPONS ==========
export const applyCoupon = (code, cartTotal) =>
    api.post("/coupons/apply", { code, cartTotal });

export const getAllCoupons = () =>
    api.get("/coupons");

export const createCoupon = (data) =>
    api.post("/coupons", data);

// ========== BROWSING HISTORY & RECOMMENDATIONS ==========
export const trackProductView = (productId) =>
    api.post(`/products/${productId}/view`);

export const getRecommendations = () =>
    api.get("/recommendations");

export const getBrowsingHistory = () =>
    api.get("/browsing-history");

// ========== SEARCH & FILTERS ==========
export const searchProducts = (query, filters = {}) =>
    api.get("/products/search", { params: { query, ...filters } });

export const getFilterOptions = () =>
    api.get("/products/filters/options");

// ========== ANALYTICS ==========
export const getSalesAnalytics = (startDate, endDate, period = "day") =>
    api.get("/admin/analytics/sales", {
        params: { startDate, endDate, period }
    });

export const getCustomerAnalytics = () =>
    api.get("/admin/analytics/customers");

export const getProductAnalytics = () =>
    api.get("/admin/analytics/products");

