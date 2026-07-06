import mongoose from "mongoose";

// Delivery Tracking Schema
const deliveryTrackingSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    trackingNumber: { type: String, unique: true, required: true },
    carrier: String,
    carrierName: { type: String, enum: ["DHL", "FedEx", "UPS", "LocalShip", "Courier"], required: true },

    // Driver Information
    driver: {
        id: String,
        name: String,
        phone: String,
        email: String,
        photo: String,
        rating: Number,
        totalDeliveries: Number,
    },

    // GPS Tracking
    gpsTracking: {
        enabled: { type: Boolean, default: true },
        latitude: Number,
        longitude: Number,
        accuracy: Number,
        lastUpdated: Date,
        nextUpdateScheduled: Date,
    },

    // Delivery Route
    route: [{
        checkpoint: String,
        latitude: Number,
        longitude: Number,
        estimatedTime: Date,
        actualTime: Date,
        status: String,
        notes: String,
    }],

    // Current Status
    currentLocation: String,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    deliveryAttempts: [{
        attemptNumber: Number,
        timestamp: Date,
        status: String,
        notes: String,
        photoUrl: String,
    }],

    // Proof of Delivery
    proofOfDelivery: {
        recipientName: String,
        recipientPhoto: String,
        signatureRequired: { type: Boolean, default: true },
        signaturePhoto: String,
        deliveryPhoto: String,
        notes: String,
        otp: String,
        otpVerified: { type: Boolean, default: false },
        verificationTime: Date,
    },

    // Status History
    statusHistory: [{
        status: { type: String, enum: ["picked_up", "in_transit", "out_for_delivery", "delivered", "failed", "returned"] },
        timestamp: { type: Date, default: Date.now },
        location: String,
        notes: String,
        latitude: Number,
        longitude: Number,
    }],

    // Issues & Delays
    issues: [{
        type: String,
        timestamp: Date,
        description: String,
        resolution: String,
    }],

    // Notifications Sent
    notificationsSent: {
        pickupNotification: Date,
        inTransitNotification: Date,
        outForDeliveryNotification: Date,
        deliveryNotification: Date,
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Delivery Agent Schema
const deliveryAgentSchema = new mongoose.Schema({
    agentId: String,
    name: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String, required: true },
    photo: String,
    carrierCompany: { type: String, required: true },

    // Performance Metrics
    totalDeliveries: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    averageRating: { type: Number, default: 5 },
    totalRatings: { type: Number, default: 0 },

    // Availability
    isActive: { type: Boolean, default: true },
    serviceAreas: [String], // Cities/regions they deliver to
    deliveryCapacity: { type: Number, default: 10 }, // Max deliveries per day

    // Current Status
    currentLocation: {
        latitude: Number,
        longitude: Number,
        address: String,
        lastUpdated: Date,
    },

    isOnDuty: { type: Boolean, default: false },
    currentDeliveries: Number,

    // Banking Details
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String,
    },

    // Documents
    documents: {
        drivingLicense: String,
        idProof: String,
        backgroundCheck: String,
    },

    joinedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Shipment Timeline Schema
const shipmentTimelineSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    events: [{
        eventName: String,
        eventDescription: String,
        location: String,
        timestamp: Date,
        status: String,
        icon: String,
    }],
    createdAt: { type: Date, default: Date.now }
});

export { deliveryTrackingSchema, deliveryAgentSchema, shipmentTimelineSchema };
