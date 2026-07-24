import nodemailer from "nodemailer";
import twilio from "twilio";
import OTP from "../models/otp.js";

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASSWORD || "",
    },
});

/**
 * Generate a random OTP
 * @param {number} length - OTP length (default: 6)
 * @returns {string} Random OTP
 */
export const generateOTP = (length = 6) => {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1)))
        .toString();
};

/**
 * Send OTP via Email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP to send
 * @param {string} purpose - Purpose of OTP (signup, login, password-reset, etc.)
 * @returns {Promise<boolean>} Success status
 */
export const sendOTPviaEmail = async (email, otp, purpose = "signup") => {
    try {
        const templates = {
            signup: {
                subject: "Verify Your Email - Welcome to Our Store!",
                title: "Email Verification",
                message: "Welcome! Please verify your email address by entering the OTP below.",
            },
            login: {
                subject: "Your OTP for Secure Login",
                title: "Login Verification",
                message: "For security, please verify your login with this one-time password.",
            },
            "password-reset": {
                subject: "Reset Your Password - OTP Verification",
                title: "Password Reset",
                message: "Click the link or use the OTP below to reset your password.",
            },
            "email-verification": {
                subject: "Verify Your Email Address",
                title: "Email Verification",
                message: "Please verify your email address using this OTP.",
            },
            "phone-verification": {
                subject: "Verify Your Phone Number",
                title: "Phone Verification",
                message: "Please verify your phone number using this OTP.",
            },
            "2fa": {
                subject: "Two-Factor Authentication OTP",
                title: "Two-Factor Authentication",
                message: "Enter this OTP to complete your login.",
            },
        };

        const template = templates[purpose] || templates.signup;

        const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${template.title}</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px 20px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        ${template.message}
                    </p>
                    
                    <!-- OTP Box -->
                    <div style="background-color: #f9f9f9; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                        <p style="color: #666; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                            Your One-Time Password
                        </p>
                        <h2 style="color: #667eea; font-size: 36px; letter-spacing: 4px; margin: 10px 0; font-family: 'Courier New', monospace; font-weight: bold;">
                            ${otp}
                        </h2>
                    </div>
                    
                    <!-- Details -->
                    <div style="background-color: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <p style="color: #555; font-size: 14px; margin: 5px 0;">
                            <strong>⏱️ Valid for:</strong> 10 minutes
                        </p>
                        <p style="color: #555; font-size: 14px; margin: 5px 0;">
                            <strong>🔒 Security:</strong> Never share this OTP with anyone
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <p style="color: #999; font-size: 12px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        If you didn't request this OTP, please ignore this email or contact our support team immediately.
                    </p>
                </div>
                
                <!-- Bottom Bar -->
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        © 2024 Our Store. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
        `;

        await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: template.subject,
            html: htmlContent,
        });

        console.log(`OTP sent successfully to ${email} for ${purpose}`);
        return true;
    } catch (error) {
        console.error("Error sending OTP email:", error.message);
        throw new Error("Failed to send OTP email");
    }
};

/**
 * Send OTP via SMS (Twilio integration)
 * @param {string} phone - Recipient phone number
 * @param {string} otp - OTP to send
 * @returns {Promise<boolean>} Success status
 */
export const sendOTPviaSMS = async (phone, otp) => {
    try {
        const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
            throw new Error("Twilio SMS is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your .env file.");
        }

        const client = twilio(twilioAccountSid, twilioAuthToken);
        const messageBody = `Your OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP.`;

        await client.messages.create({
            body: messageBody,
            from: twilioPhoneNumber,
            to: phone,
        });

        console.log(`SMS OTP sent to ${phone}: ${otp}`);
        return true;
    } catch (error) {
        console.error("Error sending OTP SMS:", error.message);
        throw new Error("Failed to send OTP SMS");
    }
};

/**
 * Create and send OTP
 * @param {Object} options - OTP options
 * @param {string} options.email - Email address
 * @param {string} options.phone - Phone number
 * @param {string} options.purpose - Purpose of OTP
 * @param {string} options.type - Type of OTP (email or sms)
 * @param {Object} options.metadata - Additional metadata
 * @returns {Promise<Object>} OTP record
 */
export const createAndSendOTP = async ({
    email,
    phone,
    purpose = "signup",
    type = "email",
    metadata = {},
}) => {
    try {
        // Generate OTP
        const otp = generateOTP();

        // Create OTP record in database
        const otpRecord = new OTP({
            email: email?.toLowerCase() || undefined,
            phone,
            otp,
            type,
            purpose,
            metadata,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        await otpRecord.save();

        // Send OTP via appropriate channel
        if (type === "email" && email) {
            await sendOTPviaEmail(email, otp, purpose);
        } else if (type === "sms" && phone) {
            await sendOTPviaSMS(phone, otp);
        }

        return {
            success: true,
            message: `OTP sent successfully via ${type}`,
            expiresIn: 600, // 10 minutes in seconds
            otpId: otpRecord._id, // Return OTP ID for verification
        };
    } catch (error) {
        console.error("Error creating and sending OTP:", error.message);
        console.error(error.stack);
        throw error;
    }
};

/**
 * Verify OTP
 * @param {Object} options - Verification options
 * @param {string} options.email - Email address
 * @param {string} options.phone - Phone number
 * @param {string} options.otp - OTP to verify
 * @param {string} options.purpose - Purpose of OTP
 * @returns {Promise<Object>} Verification result
 */
export const verifyOTP = async ({ email, phone, otp, purpose }) => {
    try {
        const query = {
            isVerified: false,
            expiresAt: { $gt: new Date() }, // Not expired
            purpose,
            attempts: { $lt: 5 }, // Less than 5 attempts
        };

        if (email) {
            query.email = email.toLowerCase();
        } else if (phone) {
            query.phone = phone;
        } else {
            throw new Error("Email or phone number is required");
        }

        const otpRecord = await OTP.findOne(query).sort({ createdAt: -1 });

        if (!otpRecord) {
            throw new Error("OTP not found or expired");
        }

        // Check if OTP matches
        if (otpRecord.otp !== otp.toString()) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            if (otpRecord.attempts >= 5) {
                throw new Error("Too many failed attempts. Request a new OTP.");
            }

            throw new Error("Invalid OTP");
        }

        // Mark OTP as verified
        otpRecord.isVerified = true;
        otpRecord.verifiedAt = new Date();
        await otpRecord.save();

        return {
            success: true,
            message: "OTP verified successfully",
            otpRecord,
        };
    } catch (error) {
        console.error("Error verifying OTP:", error.message);
        throw error;
    }
};

/**
 * Resend OTP
 * @param {Object} options - Resend options
 * @param {string} options.email - Email address
 * @param {string} options.phone - Phone number
 * @param {string} options.purpose - Purpose of OTP
 * @param {string} options.type - Type of OTP (email or sms)
 * @returns {Promise<Object>} Resend result
 */
export const resendOTP = async ({ email, phone, purpose, type = "email" }) => {
    try {
        // Delete previous OTPs for this email/phone
        if (email) {
            await OTP.deleteMany({
                email: email.toLowerCase(),
                purpose,
                isVerified: false,
            });
        } else if (phone) {
            await OTP.deleteMany({
                phone,
                purpose,
                isVerified: false,
            });
        }

        // Create and send new OTP
        return await createAndSendOTP({
            email,
            phone,
            purpose,
            type,
        });
    } catch (error) {
        console.error("Error resending OTP:", error.message);
        throw error;
    }
};

/**
 * Clean up expired OTPs
 * @returns {Promise<number>} Number of deleted OTPs
 */
export const cleanupExpiredOTPs = async () => {
    try {
        const result = await OTP.deleteMany({
            expiresAt: { $lt: new Date() },
        });
        console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
        return result.deletedCount;
    } catch (error) {
        console.error("Error cleaning up expired OTPs:", error.message);
        throw error;
    }
};
