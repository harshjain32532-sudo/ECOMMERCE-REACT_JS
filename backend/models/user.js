import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: String,
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethods: {
        sms: { type: Boolean, default: false },
        email: { type: Boolean, default: false },
        authenticator: { type: Boolean, default: false },
        backup: { type: Boolean, default: false }
    },
    shippingAddress: {
        line1: String,
        city: String,
        state: String,
        zip: String,
        country: String,
    },
    addresses: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            line1: String,
            city: String,
            state: String,
            zip: String,
            country: String,
            isDefault: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    cart: [
        {
            productId: String,
            name: String,
            price: Number,
            image: String,
            quantity: Number,
        }
    ],
    wishlist: [
        {
            productId: String,
            name: String,
            price: Number,
            image: String,
            addedAt: { type: Date, default: Date.now }
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
