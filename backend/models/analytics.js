import mongoose from "mongoose";

// Analytics Schema - Daily Sales
const dailySalesSchema = new mongoose.Schema({
    date: { type: Date, required: true, unique: true },
    totalSales: Number,
    totalOrders: Number,
    totalRevenue: Number,
    averageOrderValue: Number,
    uniqueCustomers: Number,
    conversionRate: Number,
    topProducts: [{
        productId: String,
        productName: String,
        unitsSold: Number,
        revenue: Number,
    }],
    paymentMethodBreakdown: {
        card: Number,
        upi: Number,
        wallet: Number,
        cod: Number,
    },
    createdAt: { type: Date, default: Date.now }
});

// Product Performance Schema
const productPerformanceSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
    productName: String,
    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    cartAdds: { type: Number, default: 0 },
    conversionRate: Number,
    returnRate: Number,
    category: String,
    trend: { type: String, enum: ["increasing", "decreasing", "stable"], default: "stable" },
    lastUpdated: { type: Date, default: Date.now }
});

// User Activity Schema
const userActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    activityType: {
        type: String,
        enum: ["login", "view_product", "add_cart", "purchase", "review", "wishlist", "search"],
        required: true
    },
    productId: String,
    orderId: String,
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed,
});

// Revenue Analytics Schema
const revenueAnalyticsSchema = new mongoose.Schema({
    period: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], required: true },
    date: { type: Date, required: true },
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    costOfGoodsSold: { type: Number, default: 0 },
    grossProfit: { type: Number, default: 0 },
    grossMargin: Number,
    expenses: {
        marketing: { type: Number, default: 0 },
        shipping: { type: Number, default: 0 },
        operations: { type: Number, default: 0 },
    },
    netProfit: Number,
    returnsAndRefunds: { type: Number, default: 0 },
    discountsGiven: { type: Number, default: 0 },
});

export { dailySalesSchema, productPerformanceSchema, userActivitySchema, revenueAnalyticsSchema };
