import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { notificationSchema, notificationPreferenceSchema, notificationQueueSchema, deviceTokenSchema } from "../models/notification.js";

const router = express.Router();
const Notification = mongoose.model("Notification", notificationSchema);
const NotificationPreference = mongoose.model("NotificationPreference", notificationPreferenceSchema);
const NotificationQueue = mongoose.model("NotificationQueue", notificationQueueSchema);
const DeviceToken = mongoose.model("DeviceToken", deviceTokenSchema);
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const getAuthenticatedUserId = (req) => {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return null;
    try {
        const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
        return decoded.id;
    } catch {
        return null;
    }
};

const getDefaultPreferences = () => ({
    channels: { email: true, sms: true, push: true },
    categories: {
        orderUpdates: true,
        paymentUpdates: true,
        deliveryUpdates: true,
        promotions: true,
        priceDrops: true,
        backInStock: true,
        productRecommendations: true,
        reviews: false,
        wishlistNotifications: true,
        newsletter: true,
    },
    frequency: "instant",
    quietHours: { enabled: false, startTime: "22:00", endTime: "08:00" },
});

const normalizePreferences = (prefs = {}) => ({
    channels: { email: true, sms: true, push: true, ...(prefs.channels || {}) },
    categories: { ...getDefaultPreferences().categories, ...(prefs.categories || {}) },
    frequency: prefs.frequency || "instant",
    quietHours: { enabled: false, startTime: "22:00", endTime: "08:00", ...(prefs.quietHours || {}) },
});

const categoryKeyForType = (type) => {
    switch (type) {
        case "payment":
        case "payment_confirmation":
            return "paymentUpdates";
        case "delivery":
        case "shipping":
            return "deliveryUpdates";
        case "promotion":
        case "promotional_offer":
            return "promotions";
        case "price_drop":
            return "priceDrops";
        case "back_in_stock":
            return "backInStock";
        case "order_status":
        default:
            return "orderUpdates";
    }
};

const shouldSend = (preferences, type) => {
    const category = categoryKeyForType(type);
    const categories = preferences?.categories || {};
    return categories[category] !== false;
};

const createNotificationRecord = async ({ userId, type, title, message, description, channels = {}, actionUrl, orderId, productId, priority = "medium" }) => {
    if (!userId) return null;

    const preferences = await NotificationPreference.findOne({ userId });
    if (!preferences || !shouldSend(preferences, type)) {
        return null;
    }

    const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        description,
        channels: {
            email: true,
            sms: true,
            push: true,
            inApp: true,
            ...channels,
        },
        actionUrl,
        orderId,
        productId,
        priority,
    });

    return notification;
};

// 1. NOTIFICATION MANAGEMENT
router.get("/notifications", async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req) || req.query.userId;
        if (!userId) return res.status(401).json({ error: "Authentication required" });

        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "10", 10);
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
        const total = await Notification.countDocuments({ userId });

        res.json({
            notifications,
            total,
            page,
            limit,
            unreadCount: notifications.filter((n) => !n.read).length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/notifications/unread", async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });

        const notifications = await Notification.find({ userId, read: false }).sort({ createdAt: -1 }).lean();
        res.json({ unreadCount: notifications.length, notifications });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/notifications/:id/read", async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });

        const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId }, { read: true, readAt: new Date() }, { new: true });
        res.json({ message: "Notification marked as read", notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/notifications/mark-all-read", async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });

        await Notification.updateMany({ userId, read: false }, { read: true, readAt: new Date() });
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/notifications/:id", async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });

        await Notification.findOneAndDelete({ _id: req.params.id, userId });
        res.json({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. NOTIFICATION PREFERENCES
router.get("/notification-preferences", async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });

        const preferenceDoc = await NotificationPreference.findOne({ userId });
        const preferences = normalizePreferences(preferenceDoc?.toObject?.() || {});
        res.json({ preferences });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/notification-preferences", async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({ error: "Authentication required" });

        const { channels, categories, frequency, quietHours } = req.body || {};
        const prepared = normalizePreferences({ channels, categories, frequency, quietHours });

        const preferenceDoc = await NotificationPreference.findOneAndUpdate(
            { userId },
            { userId, ...prepared, updatedAt: new Date() },
            { new: true, upsert: true }
        );

        res.json({ message: "Notification preferences updated successfully", preferences: normalizePreferences(preferenceDoc.toObject()) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. SEND NOTIFICATIONS (Admin only)
router.post("/notifications/send", async (req, res) => {
    try {
        const { userId, type, title, message, channels, description, actionUrl, orderId, productId, priority } = req.body;
        if (!userId || !title || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const notification = await createNotificationRecord({ userId, type, title, message, description, channels, actionUrl, orderId, productId, priority });
        if (!notification) {
            return res.json({ message: "Notification preference disabled for this category", notification: null });
        }

        res.json({ message: "Notification sent successfully", notificationId: notification._id, notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/notifications/send-bulk", async (req, res) => {
    try {
        const { userIds, title, message, channels, type, description, actionUrl, priority } = req.body;
        if (!userIds || !title || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const created = [];
        for (const id of userIds) {
            const notification = await createNotificationRecord({ userId: id, type, title, message, description, channels, actionUrl, priority });
            if (notification) created.push(notification._id);
        }

        res.json({ message: `Notification sent to ${created.length} users`, notificationIds: created });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. EMAIL/SMS QUEUE
router.get("/notification-queue", async (req, res) => {
    try {
        const status = req.query.status || "all";
        const query = status === "all" ? {} : { status };
        const queue = await NotificationQueue.find(query).sort({ createdAt: -1 }).lean();
        res.json({ queue });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/notification-queue/:id/retry", async (req, res) => {
    try {
        const notification = await NotificationQueue.findById(req.params.id);
        if (!notification) return res.status(404).json({ error: "Queue item not found" });
        notification.retryCount += 1;
        notification.status = "pending";
        await notification.save();
        res.json({ message: "Notification queued for retry", notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. DEVICE TOKEN MANAGEMENT
router.post("/device-tokens", async (req, res) => {
    try {
        const { deviceToken, deviceType, deviceName } = req.body;
        const userId = getAuthenticatedUserId(req);

        if (!deviceToken || !deviceType) {
            return res.status(400).json({ error: "Device token and type required" });
        }

        const tokenDoc = await DeviceToken.findOneAndUpdate(
            { userId, deviceToken },
            { userId, deviceToken, deviceType, deviceName, isActive: true, lastUsedAt: new Date(), updatedAt: new Date() },
            { new: true, upsert: true }
        );

        res.json({ message: "Device token registered successfully", token: tokenDoc });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/device-tokens/:deviceId", async (req, res) => {
    try {
        await DeviceToken.findByIdAndDelete(req.params.deviceId);
        res.json({ message: "Device token removed" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
