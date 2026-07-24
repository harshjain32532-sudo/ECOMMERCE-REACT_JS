import express from "express";
import {
    createAndSendOTP,
    verifyOTP,
    resendOTP,
} from "../services/otpService.js";

const router = express.Router();

/**
 * POST /otp/send
 * Send OTP to email or phone
 */
router.post("/send", async (req, res) => {
    try {
        const { email, phone, purpose = "signup", type = "email" } = req.body;

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                error: "Email or phone number is required"
            });
        }

        if (!["email", "sms"].includes(type)) {
            return res.status(400).json({
                success: false,
                error: "Type must be 'email' or 'sms'"
            });
        }

        const result = await createAndSendOTP({
            email,
            phone,
            purpose,
            type,
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get("User-Agent"),
            },
        });

        res.json(result);
    } catch (error) {
        console.error("Error sending OTP:", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to send OTP"
        });
    }
});

/**
 * POST /otp/verify
 * Verify OTP
 */
router.post("/verify", async (req, res) => {
    try {
        const { email, phone, otp, purpose } = req.body;

        if (!otp) {
            return res.status(400).json({
                success: false,
                error: "OTP is required"
            });
        }

        if (!purpose) {
            return res.status(400).json({
                success: false,
                error: "Purpose is required"
            });
        }

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                error: "Email or phone number is required"
            });
        }

        const result = await verifyOTP({
            email,
            phone,
            otp,
            purpose,
        });

        res.json(result);
    } catch (error) {
        console.error("Error verifying OTP:", error.message);
        const statusCode = error.message.includes("Too many") ? 429 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message || "Failed to verify OTP"
        });
    }
});

/**
 * POST /otp/resend
 * Resend OTP
 */
router.post("/resend", async (req, res) => {
    try {
        const { email, phone, purpose = "signup", type = "email" } = req.body;

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                error: "Email or phone number is required"
            });
        }

        if (!["email", "sms"].includes(type)) {
            return res.status(400).json({
                success: false,
                error: "Type must be 'email' or 'sms'"
            });
        }

        const result = await resendOTP({
            email,
            phone,
            purpose,
            type,
        });

        res.json(result);
    } catch (error) {
        console.error("Error resending OTP:", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to resend OTP"
        });
    }
});

export default router;
