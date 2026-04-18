import { useState, useEffect } from "react";

function OTPVerification({ onVerifyOTP, onClose, phoneNumber = null }) {
    const [step, setStep] = useState("phone"); // phone, otp, success
    const [phone, setPhone] = useState(phoneNumber || "");
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [verificationAttempts, setVerificationAttempts] = useState(0);
    const [maskedPhone, setMaskedPhone] = useState("");

    // Timer effect
    useEffect(() => {
        if (timer > 0) {
            const interval = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(interval);
        }
    }, [timer]);

    const validatePhoneNumber = (phoneNum) => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phoneNum.replace(/\D/g, ""));
    };

    const maskPhoneNumber = (phoneNum) => {
        const cleaned = phoneNum.replace(/\D/g, "");
        return `${cleaned.slice(0, 2)}${"*".repeat(5)}${cleaned.slice(7)}`;
    };

    const handleSendOTP = async () => {
        setError("");
        setMessage("");

        if (!phone.trim()) {
            setError("Please enter a phone number");
            return;
        }

        if (!validatePhoneNumber(phone)) {
            setError("Please enter a valid 10-digit Indian phone number");
            return;
        }

        setLoading(true);
        try {
            // Simulate OTP sending API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Mock API response
            const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
            sessionStorage.setItem("otpCode", mockOTP);

            const masked = maskPhoneNumber(phone);
            setMaskedPhone(masked);
            setOtpSent(true);
            setStep("otp");
            setTimer(180); // 3 minutes
            setMessage(`OTP sent to ${masked}`);
            setVerificationAttempts(0);
            setOtp("");

            // Log for development (remove in production)
            console.log("Mock OTP:", mockOTP);
        } catch (err) {
            setError("Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError("");
        setMessage("");

        if (!otp.trim()) {
            setError("Please enter the OTP");
            return;
        }

        if (otp.length !== 6) {
            setError("OTP must be 6 digits");
            return;
        }

        if (verificationAttempts >= 3) {
            setError("Maximum verification attempts exceeded. Please request a new OTP");
            setOtp("");
            return;
        }

        setLoading(true);
        try {
            // Simulate OTP verification API call
            await new Promise((resolve) => setTimeout(resolve, 1200));

            const storedOTP = sessionStorage.getItem("otpCode");

            if (otp === storedOTP) {
                setStep("success");
                setMessage("✓ Phone number verified successfully!");
                if (onVerifyOTP) {
                    onVerifyOTP({ phone, verified: true });
                }

                // Auto close after 2 seconds
                setTimeout(() => {
                    if (onClose) onClose();
                }, 2000);
            } else {
                const attempts = verificationAttempts + 1;
                setVerificationAttempts(attempts);
                setError(`Invalid OTP. ${3 - attempts} attempts remaining`);
                setOtp("");
            }
        } catch (err) {
            setError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = () => {
        if (timer === 0) {
            setError("");
            setOtp("");
            setVerificationAttempts(0);
            handleSendOTP();
        }
    };

    const handleChangePhone = () => {
        setStep("phone");
        setOtp("");
        setError("");
        setMessage("");
        setOtpSent(false);
        setVerificationAttempts(0);
    };

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        {step === "phone" && "📱 Verify Phone Number"}
                        {step === "otp" && "🔐 Enter OTP"}
                        {step === "success" && "✅ Phone Verified"}
                    </h2>
                    {step !== "success" && (
                        <button onClick={onClose} style={styles.closeBtn}>
                            ✕
                        </button>
                    )}
                </div>

                {/* Phone Number Step */}
                {step === "phone" && (
                    <div style={styles.stepContent}>
                        <div style={styles.description}>
                            Enter your phone number to receive a verification OTP
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <div style={styles.inputGroup}>
                                <span style={styles.countryCode}>+91</span>
                                <input
                                    type="tel"
                                    placeholder="Enter 10-digit phone number"
                                    value={phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        setPhone(value);
                                        setError("");
                                    }}
                                    style={styles.input}
                                    maxLength="10"
                                    disabled={loading}
                                />
                            </div>
                            {phone && (
                                <p style={styles.phoneInfo}>
                                    {validatePhoneNumber(phone)
                                        ? "✓ Valid phone number"
                                        : "✗ Invalid phone number"}
                                </p>
                            )}
                        </div>

                        {message && (
                            <div style={{ ...styles.message, background: "#d4edda", color: "#155724" }}>
                                {message}
                            </div>
                        )}
                        {error && (
                            <div style={{ ...styles.message, background: "#f8d7da", color: "#721c24" }}>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleSendOTP}
                            disabled={!validatePhoneNumber(phone) || loading}
                            style={{
                                ...styles.button,
                                opacity: !validatePhoneNumber(phone) || loading ? 0.6 : 1,
                            }}
                        >
                            {loading ? "⏳ Sending..." : "Send OTP"}
                        </button>

                        <div style={styles.infoBox}>
                            <p style={styles.infoText}>
                                💡 We'll send a 6-digit OTP to your phone number for verification
                            </p>
                        </div>
                    </div>
                )}

                {/* OTP Entry Step */}
                {step === "otp" && (
                    <div style={styles.stepContent}>
                        <div style={styles.description}>
                            Enter the 6-digit OTP sent to <strong>{maskedPhone}</strong>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>OTP Code</label>
                            <input
                                type="text"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    setOtp(value);
                                    setError("");
                                }}
                                style={styles.otpInput}
                                maxLength="6"
                                disabled={loading}
                            />
                            <p style={styles.otpHint}>
                                Enter the 6-digit code you received
                            </p>
                        </div>

                        <div style={styles.timerBox}>
                            {timer > 0 ? (
                                <span style={styles.timerText}>
                                    OTP expires in <strong>{formatTimer(timer)}</strong>
                                </span>
                            ) : (
                                <span style={styles.expiredText}>OTP Expired</span>
                            )}
                        </div>

                        {message && (
                            <div style={{ ...styles.message, background: "#d4edda", color: "#155724" }}>
                                {message}
                            </div>
                        )}
                        {error && (
                            <div style={{ ...styles.message, background: "#f8d7da", color: "#721c24" }}>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleVerifyOTP}
                            disabled={otp.length !== 6 || loading}
                            style={{
                                ...styles.button,
                                opacity: otp.length !== 6 || loading ? 0.6 : 1,
                            }}
                        >
                            {loading ? "⏳ Verifying..." : "Verify OTP"}
                        </button>

                        <div style={styles.resendSection}>
                            <p style={styles.resendText}>Didn't receive the OTP?</p>
                            <button
                                onClick={handleResendOTP}
                                disabled={timer > 0 || loading}
                                style={{
                                    ...styles.resendButton,
                                    opacity: timer > 0 || loading ? 0.6 : 1,
                                }}
                            >
                                {timer > 0 ? `Resend in ${formatTimer(timer)}` : "Resend OTP"}
                            </button>
                        </div>

                        <button
                            onClick={handleChangePhone}
                            style={styles.changePhoneBtn}
                        >
                            Change Phone Number
                        </button>

                        <div style={styles.infoBox}>
                            <p style={styles.infoText}>
                                🔒 Your OTP is confidential and will only be used for verification
                            </p>
                        </div>
                    </div>
                )}

                {/* Success Step */}
                {step === "success" && (
                    <div style={styles.successContent}>
                        <div style={styles.successIcon}>✓</div>
                        <h3 style={styles.successTitle}>Phone Verified!</h3>
                        <p style={styles.successMessage}>
                            Your phone number {maskedPhone} has been successfully verified
                        </p>

                        <div style={styles.successDetails}>
                            <div style={styles.detailRow}>
                                <span>Phone Number:</span>
                                <strong>{maskedPhone}</strong>
                            </div>
                            <div style={styles.detailRow}>
                                <span>Status:</span>
                                <strong style={{ color: "#27ae60" }}>✓ Verified</strong>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            style={{ ...styles.button, background: "#27ae60" }}
                        >
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
    },
    modal: {
        background: "white",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        maxWidth: 450,
        width: "90%",
        maxHeight: "90vh",
        overflow: "auto",
        animation: "slideInUp 0.4s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 24px 20px",
        borderBottom: "1px solid #f0f0f0",
    },
    title: {
        fontSize: 18,
        fontWeight: 700,
        color: "#2c3e50",
        margin: 0,
    },
    closeBtn: {
        width: 32,
        height: 32,
        border: "none",
        background: "#f0f0f0",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 18,
        color: "#999",
        transition: "all 0.3s ease",
    },
    stepContent: {
        padding: 24,
        animation: "slideInDown 0.3s ease",
    },
    successContent: {
        padding: 40,
        textAlign: "center",
        animation: "slideInDown 0.3s ease",
    },
    description: {
        fontSize: 13,
        color: "#666",
        marginBottom: 24,
        lineHeight: 1.5,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        display: "block",
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 8,
    },
    inputGroup: {
        display: "flex",
        alignItems: "center",
        border: "1px solid #ddd",
        borderRadius: 6,
        overflow: "hidden",
    },
    countryCode: {
        padding: "12px 14px",
        background: "#f9f9f9",
        fontSize: 13,
        fontWeight: 700,
        color: "#999",
        borderRight: "1px solid #ddd",
    },
    input: {
        flex: 1,
        padding: "12px 14px",
        border: "none",
        fontSize: 14,
        outline: "none",
    },
    otpInput: {
        width: "100%",
        padding: "16px 14px",
        fontSize: 24,
        letterSpacing: 8,
        textAlign: "center",
        border: "2px solid #ddd",
        borderRadius: 6,
        fontWeight: 700,
        fontFamily: "monospace",
    },
    phoneInfo: {
        fontSize: 11,
        marginTop: 6,
        color: "#999",
        margin: "6px 0 0 0",
    },
    otpHint: {
        fontSize: 11,
        color: "#999",
        marginTop: 6,
        margin: "6px 0 0 0",
    },
    message: {
        padding: 12,
        borderRadius: 6,
        fontSize: 12,
        marginBottom: 16,
        textAlign: "center",
        animation: "slideInDown 0.3s ease",
    },
    button: {
        width: "100%",
        padding: "14px 16px",
        background: "#2575fc",
        color: "white",
        border: "none",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.3s ease",
        marginBottom: 12,
    },
    timerBox: {
        background: "#e8f4f8",
        padding: 12,
        borderRadius: 6,
        textAlign: "center",
        marginBottom: 16,
        border: "1px solid #b3e5fc",
    },
    timerText: {
        fontSize: 12,
        color: "#0277bd",
    },
    expiredText: {
        fontSize: 12,
        color: "#d32f2f",
        fontWeight: 700,
    },
    resendSection: {
        textAlign: "center",
        marginTop: 16,
        marginBottom: 16,
    },
    resendText: {
        fontSize: 12,
        color: "#666",
        margin: "0 0 8px 0",
    },
    resendButton: {
        background: "none",
        border: "1px solid #2575fc",
        color: "#2575fc",
        padding: "8px 12px",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 700,
        transition: "all 0.3s ease",
    },
    changePhoneBtn: {
        width: "100%",
        padding: "12px 16px",
        background: "#f0f0f0",
        color: "#666",
        border: "none",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
    infoBox: {
        background: "#e8f4f8",
        padding: 12,
        borderRadius: 6,
        marginTop: 16,
        border: "1px solid #b3e5fc",
    },
    infoText: {
        fontSize: 11,
        color: "#0277bd",
        margin: 0,
    },
    successIcon: {
        width: 60,
        height: 60,
        background: "#27ae60",
        color: "white",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
        margin: "0 auto 16px",
        animation: "pulse 0.4s ease",
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 8px 0",
    },
    successMessage: {
        fontSize: 13,
        color: "#666",
        marginBottom: 24,
        lineHeight: 1.5,
    },
    successDetails: {
        background: "#f9f9f9",
        padding: 16,
        borderRadius: 6,
        marginBottom: 24,
    },
    detailRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
    },
};

export default OTPVerification;
