import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import OTP from "../models/otp.js";
import { createAndSendOTP, verifyOTP } from "../services/otpService.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

/**
 * Middleware to verify JWT token
 */
export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "No token provided"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "Invalid or expired token"
        });
    }
};

/**
 * POST /auth/register
 * Register user with OTP verification
 * Step 1: Send OTP to email
 */
router.post("/register", async (req, res) => {
    try {
        const { email, name, phone } = req.body;

        if (!email || !name) {
            return res.status(400).json({
                success: false,
                error: "Email and name are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "User already exists with this email"
            });
        }

        // Send OTP via SMS when phone provided, otherwise email
        const otpType = phone ? "sms" : "email";
        const result = await createAndSendOTP({
            email,
            phone,
            purpose: "signup",
            type: otpType,
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get("User-Agent"),
                name,
            },
        });

        res.json({
            success: true,
            message: otpType === "sms"
                ? "OTP sent to your phone. Please verify to complete registration."
                : "OTP sent to your email. Please verify to complete registration.",
            expiresIn: result.expiresIn,
            otpId: result.otpId,
        });
    } catch (error) {
        console.error("Error in registration:", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Registration failed"
        });
    }
});

/**
 * POST /auth/verify-otp-signup
 * Verify OTP and create account
 * Step 2: Verify OTP and set password
 */
router.post("/verify-otp-signup", async (req, res) => {
    try {
        const { email, otp, password, name, phone } = req.body;

        if (!email || !otp || !password || !name) {
            return res.status(400).json({
                success: false,
                error: "Email, OTP, password, and name are required"
            });
        }

        // Verify OTP
        const otpResult = await verifyOTP({
            email,
            otp,
            purpose: "signup",
        });

        if (!otpResult.success) {
            return res.status(400).json(otpResult);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            email: email.toLowerCase(),
            name,
            phone,
            password: hashedPassword,
            emailVerified: true, // Email is verified via OTP
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.json({
            success: true,
            message: "Account created successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error("Error in OTP verification:", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "OTP verification failed"
        });
    }
});

/**
 * POST /auth/login
 * Login with email/password
 * Optional: Send OTP for 2FA if enabled
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password, otpRequired = false } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled || otpRequired) {
            // Send OTP for 2FA
            const otpResult = await createAndSendOTP({
                email: user.email,
                phone: user.phone,
                purpose: "2fa",
                type: user.twoFactorMethods.email ? "email" : "sms",
                metadata: {
                    ipAddress: req.ip,
                    userAgent: req.get("User-Agent"),
                    userId: user._id,
                },
            });

            return res.json({
                success: true,
                message: "OTP sent for 2FA verification",
                requires2FA: true,
                expiresIn: otpResult.expiresIn,
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error("Error in login:", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Login failed"
        });
    }
});

/**
 * POST /auth/verify-otp-login
 * Verify 2FA OTP and login
 */
router.post("/verify-otp-login", async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: "Email and OTP are required"
            });
        }

        // Verify OTP
        const otpResult = await verifyOTP({
            email,
            otp,
            purpose: "2fa",
        });

        if (!otpResult.success) {
            return res.status(400).json(otpResult);
        }

        // Get user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "User not found"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.json({
            success: true,
            message: "Login successful after 2FA verification",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error("Error in 2FA verification:", error.message);
        const statusCode = error.message.includes("Too many") ? 429 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message || "2FA verification failed"
        });
    }
});

/**
 * POST /auth/forgot-password
 * Request password reset via OTP
 */
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email is required"
            });
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if user exists
            return res.json({
                success: true,
                message: "If an account exists with this email, an OTP has been sent",
            });
        }

        // Send OTP
        const result = await createAndSendOTP({
            email,
            purpose: "password-reset",
            type: "email",
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get("User-Agent"),
                userId: user._id,
            },
        });

        res.json({
            success: true,
            message: "OTP sent to your email for password reset",
            expiresIn: result.expiresIn,
        });
    } catch (error) {
        console.error("Error in forgot password:", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to process password reset"
        });
    }
});

/**
 * POST /auth/reset-password
 * Reset password using OTP
 */
router.post("/reset-password", async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({
                success: false,
                error: "Email, OTP, and new password are required"
            });
        }

        // Verify OTP
        const otpResult = await verifyOTP({
            email,
            otp,
            purpose: "password-reset",
        });

        if (!otpResult.success) {
            return res.status(400).json(otpResult);
        }

        // Update user password
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.updateOne(
            { email: email.toLowerCase() },
            { password: hashedPassword }
        );

        res.json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        console.error("Error in password reset:", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Password reset failed"
        });
    }
});

/**
 * GET /auth/profile
 * Get current user profile (requires authentication)
 */
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch profile"
        });
    }
});

export default router;
