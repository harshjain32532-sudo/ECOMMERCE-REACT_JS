import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerWithOTP } from "../api.js";
import "../styles/RegisterOTP.css";

/**
 * RegisterOTP Page
 * User registration with OTP verification
 */
const RegisterOTP = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1); // Step 1: Register, Step 2: Verify OTP
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
        return phoneRegex.test(phone.replace(/\s/g, ""));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.name.trim()) {
            setError("Name is required");
            return;
        }

        if (!formData.email.trim()) {
            setError("Email is required");
            return;
        }

        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (formData.phone && !validatePhoneNumber(formData.phone)) {
            setError("Please enter a valid phone number");
            return;
        }

        setLoading(true);

        try {
            // Step 1: Send OTP
            const response = await registerWithOTP(
                formData.name,
                formData.email.toLowerCase(),
                formData.phone
            );

            // Move to OTP verification step
            setStep(2);
            navigate("/otp-verify", {
                state: {
                    email: formData.email.toLowerCase(),
                    phone: formData.phone,
                    purpose: "signup",
                    type: formData.phone ? "sms" : "email",
                    formData: {
                        name: formData.name,
                        phone: formData.phone,
                    },
                },
            });
        } catch (err) {
            setError(err.response?.data?.error || err.message || "Failed to send OTP");
            setLoading(false);
        }
    };

    return (
        <div className="register-otp-page">
            <div className="register-otp-container">
                {/* Header */}
                <div className="register-header">
                    <h1>Create Account</h1>
                    <p>Join us for exclusive deals and easy shopping</p>
                </div>

                {/* Step Indicator */}
                <div className="step-indicator">
                    <div className={`step ${step >= 1 ? "active" : ""}`}>
                        <span className="step-number">1</span>
                        <span className="step-label">Register</span>
                    </div>
                    <div className="step-divider"></div>
                    <div className={`step ${step >= 2 ? "active" : ""}`}>
                        <span className="step-number">2</span>
                        <span className="step-label">Verify OTP</span>
                    </div>
                    <div className="step-divider"></div>
                    <div className={`step ${step >= 3 ? "active" : ""}`}>
                        <span className="step-number">3</span>
                        <span className="step-label">Set Password</span>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-error">
                        <span className="alert-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleRegister} className="register-form">
                    {/* Name Input */}
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Full Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            disabled={loading}
                            className="form-input"
                            autoComplete="name"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            disabled={loading}
                            className="form-input"
                            autoComplete="email"
                        />
                        {formData.email && !validateEmail(formData.email) && (
                            <span className="form-error">Invalid email format</span>
                        )}
                    </div>

                    {/* Phone Input (Optional) */}
                    <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                            Phone Number <span className="optional">(Optional)</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            disabled={loading}
                            className="form-input"
                            autoComplete="tel"
                        />
                        {formData.phone && !validatePhoneNumber(formData.phone) && (
                            <span className="form-error">Invalid phone format</span>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="terms-checkbox">
                        <input type="checkbox" id="terms" required />
                        <label htmlFor="terms">
                            I agree to the{" "}
                            <Link to="/terms" className="link">
                                Terms & Conditions
                            </Link>{" "}
                            and{" "}
                            <Link to="/privacy" className="link">
                                Privacy Policy
                            </Link>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? "Sending OTP..." : "Continue to Verification"}
                    </button>

                    {/* Login Link */}
                    <div className="register-footer">
                        <p>
                            Already have an account?{" "}
                            <Link to="/login" className="link">
                                Login here
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Benefits */}
                <div className="registration-benefits">
                    <h3>Why register with us?</h3>
                    <ul>
                        <li>✓ Secure and verified checkout</li>
                        <li>✓ Track your orders in real-time</li>
                        <li>✓ Access exclusive deals and offers</li>
                        <li>✓ Quick repeat purchases</li>
                        <li>✓ Wishlist and saved items</li>
                    </ul>
                </div>
            </div>

            {/* Security Banner */}
            <div className="security-banner">
                <span className="banner-icon">🔒</span>
                <p>Your personal information is secure and encrypted.</p>
            </div>
        </div>
    );
};

export default RegisterOTP;
