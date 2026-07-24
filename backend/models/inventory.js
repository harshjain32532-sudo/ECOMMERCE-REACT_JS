import mongoose from "mongoose";

// Supplier Schema
const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String,
    },
    gstNumber: String,
    paymentTerms: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Purchase Order Schema
const purchaseOrderSchema = new mongoose.Schema({
    poNumber: { type: String, unique: true, required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        unitPrice: Number,
        total: Number,
    }],
    totalAmount: Number,
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,
    status: {
        type: String,
        enum: ["draft", "sent", "confirmed", "shipped", "received", "cancelled"],
        default: "draft"
    },
    notes: String,
    attachments: [String],
    createdBy: String,
    updatedAt: { type: Date, default: Date.now }
});

// Stock Level Schema
const stockLevelSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
    currentStock: { type: Number, default: 0 },
    minimumStock: { type: Number, default: 10 },
    maximumStock: { type: Number, default: 100 },
    reorderPoint: { type: Number, default: 20 },
    reorderQuantity: { type: Number, default: 50 },
    lastReorderedDate: Date,
    warehouseLocation: String,
    lastUpdated: { type: Date, default: Date.now },
    stockHistory: [{
        type: { type: String, enum: ["purchase", "sale", "adjustment", "damage", "return"] },
        quantity: Number,
        reason: String,
        date: { type: Date, default: Date.now },
        referenceId: String,
    }],
});

// Stock Alert Schema
const stockAlertSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    alertType: { type: String, enum: ["low_stock", "out_of_stock", "overstock"], required: true },
    threshold: Number,
    currentStock: Number,
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    notes: String,
});

// Inventory Forecast Schema
const inventoryForecastSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    forecastDate: Date,
    predictedDemand: Number,
    recommendedStock: Number,
    confidenceLevel: { type: Number, min: 0, max: 100 }, // 0-100 percentage
    factors: {
        historicalAverage: Number,
        seasonalTrend: Number,
        promotionImpact: Number,
    },
    accuracy: Number,
    createdAt: { type: Date, default: Date.now },
});

export { supplierSchema, purchaseOrderSchema, stockLevelSchema, stockAlertSchema, inventoryForecastSchema };
