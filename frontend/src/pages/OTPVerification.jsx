import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OTPInput from "../components/OTPInput";
import "../styles/OTPVerification.css";

/**
 * OTPVerification Page
 * Handles OTP verification for signup, login, and password reset
 */
const OTPVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [expiryTime, setExpiryTime] = useState(600);
    const [otpData, setOtpData] = useState(null);

    // Get the state passed from previous page
    const state = location.state || {};
    const { email, phone, purpose = "signup", type = "email", formData = {} } = state;

    useEffect(() => {
        // Redirect if no email or phone provided
        if (!email && !phone) {
            navigate("/login", { replace: true });
        }
    }, [email, phone, navigate]);

    const handleOTPComplete = async (otpValue) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    phone,
                    otp: otpValue,
                    purpose,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "OTP verification failed");
            }

            setOtpData(data);
            setSuccess("OTP verified successfully!");

            // Handle navigation based on purpose
            setTimeout(() => {
                if (purpose === "signup") {
                    navigate("/otp-password", {
                        state: { email, phone, otp: otpValue, ...formData },
                        replace: true,
                    });
                } else if (purpose === "2fa" || purpose === "login") {
                    navigate("/", { replace: true });
                } else if (purpose === "password-reset") {
                    navigate("/reset-password", {
                        state: { email, otp: otpValue },
                        replace: true,
                    });
                }
            }, 1500);
        } catch (err) {
            setError(err.message || "Failed to verify OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/otp/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    phone,
                    purpose,
                    type,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to resend OTP");
            }

            setSuccess("OTP resent successfully!");
            setExpiryTime(data.expiresIn || 600);
            setError("");

            // Reset after 3 seconds
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    const getPurposeText = () => {
        switch (purpose) {
            case "signup":
                return "Create Account";
            case "login":
            case "2fa":
                return "Verify Login";
            case "password-reset":
                return "Reset Password";
            case "email-verification":
                return "Verify Email";
            case "phone-verification":
                return "Verify Phone";
            default:
                return "Verify OTP";
        }
    };

    const getContactInfo = () => {
        if (type === "sms" && phone) {
            return `${phone.substring(0, 3)}***${phone.substring(7)}`;
        }
        if (email) {
            return `${email.substring(0, 3)}***${email.substring(
                email.indexOf("@") - 2
            )}`;
        }
        if (phone) {
            return `${phone.substring(0, 3)}***${phone.substring(7)}`;
        }
        return type === "sms" ? "your phone" : "your email";
    };

    return (
        <div className="otp-verification-page">
            <div className="otp-verification-container">
                {/* Header */}
                <div className="otp-header">
                    <h1>{getPurposeText()}</h1>
                    <p>
                        We've sent a verification code to{" "}
                        <strong>{getContactInfo()}</strong>
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-error">
                        <span className="alert-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Success Alert */}
                {success && (
                    <div className="alert alert-success">
                        <span className="alert-icon">✓</span>
                        <span>{success}</span>
                    </div>
                )}

                {/* OTP Input */}
                <div className="otp-input-wrapper">
                    <OTPInput
                        length={6}
                        onComplete={handleOTPComplete}
                        disabled={loading}
                        showTimer={true}
                        expiryTime={expiryTime}
                        onResend={handleResendOTP}
                    />
                </div>

                {/* Instructions */}
                <div className="otp-instructions">
                    <h3>Didn't receive the code?</h3>
                    <ul>
                        <li>Check your spam or junk folder</li>
                        <li>Make sure you entered the correct email address</li>
                        <li>Click "Resend OTP" after the timer expires</li>
                    </ul>
                </div>

                {/* Helper Text */}
                <div className="otp-helper">
                    <button
                        className="link-button"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        ← Back
                    </button>
                    <p>
                        Enter the 6-digit code sent to your{" "}
                        {type === "email" ? "email" : "phone"}
                    </p>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                    </div>
                )}
            </div>

            {/* Security Info */}
            <div className="security-info">
                <div className="security-badge">
                    <span className="badge-icon">🔒</span>
                    <p>Your information is secure. We never share your details.</p>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;
