import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true,
        index: true
    },
    phone: {
        type: String,
        sparse: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["email", "sms", "signup", "login", "password-reset", "email-verification", "phone-verification"],
        default: "email"
    },
    purpose: {
        type: String,
        enum: ["signup", "login", "password-reset", "email-verification", "phone-verification", "2fa"],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 10 * 60 * 1000),
        index: { expires: 0 } // Auto-delete after expiration
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    verifiedAt: Date,
    metadata: {
        ipAddress: String,
        userAgent: String,
        userId: mongoose.Schema.Types.ObjectId
    }
});

// Index for faster queries
otpSchema.index({ email: 1, type: 1, createdAt: -1 });
otpSchema.index({ phone: 1, type: 1, createdAt: -1 });

// Pre-save hook to set expiration (10 minutes from now)
otpSchema.pre("save", function (next) {
    if (!this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }
    next();
});

export default mongoose.model("OTP", otpSchema);
