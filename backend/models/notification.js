import mongoose from "mongoose";

// Notification Schema
const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: ["order_status", "promotion", "payment", "delivery", "review", "wishlist", "general", "price_drop", "back_in_stock", "payment_confirmation", "shipping"],
        required: true
    },
    title: String,
    message: String,
    description: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    actionUrl: String,
    icon: String,
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    channels: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true }
    },
    status: {
        email: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
        sms: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
        push: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    },
    read: { type: Boolean, default: false },
    readAt: Date,
    createdAt: { type: Date, default: Date.now },
    scheduledFor: Date,
});

// Notification Preference Schema
const notificationPreferenceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    channels: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
    },
    categories: {
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
        productRecommendations: { type: Boolean, default: true },
        reviews: { type: Boolean, default: true },
        wishlistNotifications: { type: Boolean, default: false },
        newsletter: { type: Boolean, default: true },
        paymentUpdates: { type: Boolean, default: true },
        deliveryUpdates: { type: Boolean, default: true },
    },
    frequency: {
        type: String,
        enum: ["instant", "daily", "weekly", "never"],
        default: "instant"
    },
    quietHours: {
        enabled: { type: Boolean, default: false },
        startTime: String, // HH:MM format
        endTime: String,   // HH:MM format
    },
    updatedAt: { type: Date, default: Date.now }
});

// SMS/Email Queue Schema
const notificationQueueSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: String, // Email or Phone number
    notificationType: String,
    channel: { type: String, enum: ["email", "sms", "push"], required: true },
    subject: String,
    content: String,
    templateId: String,
    templateData: mongoose.Schema.Types.Mixed,
    status: {
        type: String,
        enum: ["pending", "processing", "sent", "failed", "bounced"],
        default: "pending"
    },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    lastRetryAt: Date,
    errorMessage: String,
    sentAt: Date,
    deliveredAt: Date,
    createdAt: { type: Date, default: Date.now, expires: 2592000 }, // Auto-delete after 30 days
});

// Push Notification Device Schema
const deviceTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deviceId: String,
    deviceToken: String,
    deviceType: { type: String, enum: ["ios", "android", "web"], required: true },
    deviceName: String,
    appVersion: String,
    osVersion: String,
    isActive: { type: Boolean, default: true },
    lastUsedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export { notificationSchema, notificationPreferenceSchema, notificationQueueSchema, deviceTokenSchema };
