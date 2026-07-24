import React, { useState, useRef, useEffect } from "react";
import "../styles/OTPInput.css";

/**
 * OTPInput Component
 * Reusable component for OTP input with auto-focus between fields
 */
const OTPInput = ({
    length = 6,
    onComplete,
    disabled = false,
    showTimer = true,
    expiryTime = 600,
    onResend
}) => {
    const [otp, setOtp] = useState(Array(length).fill(""));
    const [timeLeft, setTimeLeft] = useState(expiryTime);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!showTimer) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [showTimer]);

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/[^0-9]/g, "");

        if (value.length > 1) {
            // Handle paste
            const pastedOtp = value.slice(0, length).split("");
            const newOtp = [...otp];
            pastedOtp.forEach((digit, i) => {
                if (i + index < length) {
                    newOtp[i + index] = digit;
                }
            });
            setOtp(newOtp);

            // Focus on the last filled input
            const lastFilledIndex = Math.min(index + pastedOtp.length - 1, length - 1);
            inputRefs.current[lastFilledIndex]?.focus();

            // Check if all fields are filled
            if (newOtp.every((digit) => digit !== "")) {
                onComplete(newOtp.join(""));
            }
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check if all fields are filled
        if (newOtp.every((digit) => digit !== "")) {
            onComplete(newOtp.join(""));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const isExpired = timeLeft === 0;

    return (
        <div className="otp-input-container">
            <div className="otp-inputs">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        disabled={disabled}
                        className={`otp-input ${digit ? "filled" : ""} ${disabled ? "disabled" : ""}`}
                        placeholder="•"
                        autoComplete="off"
                    />
                ))}
            </div>

            {showTimer && (
                <div className={`otp-timer ${isExpired ? "expired" : ""}`}>
                    <span className="timer-label">Time remaining:</span>
                    <span className="timer-value">{formatTime(timeLeft)}</span>
                </div>
            )}

            {isExpired && onResend && (
                <button
                    className="resend-button"
                    onClick={onResend}
                    type="button"
                >
                    Resend OTP
                </button>
            )}
        </div>
    );
};

export default OTPInput;
