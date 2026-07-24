import mongoose from "mongoose";

// Payment Method Schema
const paymentMethodSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: ["credit_card", "debit_card", "upi", "wallet"],
        required: true
    },
    // For cards
    cardNumber: String, // Last 4 digits only
    cardholderName: String,
    expiryMonth: Number,
    expiryYear: Number,
    cardBrand: String,

    // For UPI
    upiId: String,

    // For Wallet
    walletBalance: { type: Number, default: 0 },
    walletCurrency: { type: String, default: "INR" },

    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    stripeTokenId: String,
    razorpayTokenId: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Payment Transaction Schema
const paymentTransactionSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: Number,
    currency: { type: String, default: "INR" },
    paymentMethod: String,
    paymentGateway: {
        type: String,
        enum: ["stripe", "razorpay", "upi", "wallet", "cod"],
        required: true
    },
    transactionId: String,
    referenceNumber: String,
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed", "refunded", "cancelled"],
        default: "pending"
    },
    errorMessage: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
    completedAt: Date,
});

// Wallet Transaction Schema
const walletTransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["credit", "debit", "refund", "cashback"], required: true },
    amount: Number,
    previousBalance: Number,
    currentBalance: Number,
    reason: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    description: String,
    createdAt: { type: Date, default: Date.now },
});

// COD (Cash on Delivery) Order Schema
const codOrderSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    expectedCashAmount: Number,
    collectedAmount: { type: Number, default: null },
    collectionDate: Date,
    collectionAgent: String,
    agentPhone: String,
    status: {
        type: String,
        enum: ["pending", "collected", "failed"],
        default: "pending"
    },
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Payment History Schema
const paymentHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    amount: Number,
    paymentMethod: String,
    status: String,
    date: { type: Date, default: Date.now },
    receiptUrl: String,
    invoiceUrl: String,
});

export { paymentMethodSchema, paymentTransactionSchema, walletTransactionSchema, codOrderSchema, paymentHistorySchema };
