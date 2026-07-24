import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

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
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log('Admin user already exists');
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Admin role updated for existing user');
            } else {
                console.log('✅ Admin user already has admin role');
            }
            process.exit(0);
        }

        // Create new admin user
        const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        const adminUser = new User({
            name: 'Admin',
            email: ADMIN_EMAIL,
            password: hash,
            role: 'admin'
        });
        await adminUser.save();
        console.log('✅ Admin user created successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();
