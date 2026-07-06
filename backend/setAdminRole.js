const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: String,
    phoneVerified: { type: Boolean, default: false },
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
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

(async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/ecommerce');
        const result = await User.updateOne(
            { email: 'admin@test.com' },
            { $set: { role: 'admin' } }
        );
        console.log('✅ Admin role updated:', result);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();
