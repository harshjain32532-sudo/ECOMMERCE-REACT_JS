import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/OTPPasswordSetup.css";

/**
 * OTPPasswordSetup Page
 * After OTP verification during signup, user sets their password
 */
const OTPPasswordSetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const state = location.state || {};
    const { email, name, phone } = state;

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        if (!email && !redirecting) {
            setRedirecting(true);
            navigate("/register", { replace: true });
        }
    }, [email, navigate, redirecting]);

    if (!email) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];

        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters`);
        }
        if (!hasUpperCase) {
            errors.push("Include at least one uppercase letter");
        }
        if (!hasLowerCase) {
            errors.push("Include at least one lowercase letter");
        }
        if (!hasNumbers) {
            errors.push("Include at least one number");
        }
        if (!hasSpecialChar) {
            errors.push("Include at least one special character");
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.password || !formData.confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            setError(passwordErrors.join(". "));
            return;
        }

        setLoading(true);

        try {
            const data = await verifySignupOTP(
                email,
                state.otp,
                formData.password,
                name,
                phone
            );

            // Store token
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            setSuccess("Account created successfully!");

            setTimeout(() => {
                navigate("/", { replace: true });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return null;

        const errors = validatePassword(password);
        const strength = 5 - errors.length;

        if (strength <= 1) return { level: "weak", color: "#e74c3c" };
        if (strength <= 2) return { level: "fair", color: "#f39c12" };
        if (strength <= 3) return { level: "good", color: "#f1c40f" };
        if (strength <= 4) return { level: "strong", color: "#27ae60" };
        return { level: "very strong", color: "#27ae60" };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="password-setup-page">
            <div className="password-setup-container">
                {/* Header */}
                <div className="setup-header">
                    <h1>Set Your Password</h1>
                    <p>Create a strong password to secure your account</p>
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="setup-form">
                    {/* Email Display */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            disabled
                            className="form-input disabled"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password <span className="required">*</span>
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter a strong password"
                                disabled={loading}
                                className="form-input"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="password-strength">
                                <div
                                    className="strength-bar"
                                    style={{
                                        width: `${(5 - validatePassword(formData.password).length) * 20}%`,
                                        backgroundColor: passwordStrength?.color || "#ccc",
                                    }}
                                ></div>
                            </div>
                        )}

                        {/* Password Requirements */}
                        <div className="password-requirements">
                            <p className="requirements-title">Password must contain:</p>
                            <ul>
                                <li className={formData.password.length >= 8 ? "valid" : "invalid"}>
                                    At least 8 characters
                                </li>
                                <li className={/[A-Z]/.test(formData.password) ? "valid" : "invalid"}>
                                    One uppercase letter
                                </li>
                                <li className={/[a-z]/.test(formData.password) ? "valid" : "invalid"}>
                                    One lowercase letter
                                </li>
                                <li className={/\d/.test(formData.password) ? "valid" : "invalid"}>
                                    One number
                                </li>
                                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "valid" : "invalid"}>
                                    One special character
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password <span className="required">*</span>
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                disabled={loading}
                                className="form-input"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex="-1"
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {/* Password Match Indicator */}
                        {formData.confirmPassword && (
                            <div className={`password-match ${formData.password === formData.confirmPassword ? "match" : "mismatch"}`}>
                                {formData.password === formData.confirmPassword
                                    ? "✓ Passwords match"
                                    : "✗ Passwords do not match"}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                    {/* Helper Links */}
                    <div className="setup-helper">
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => navigate("/register")}
                            disabled={loading}
                        >
                            ← Back to Registration
                        </button>
                    </div>
                </form>

                {/* Security Info */}
                <div className="security-tips">
                    <h3>🔒 Password Security Tips</h3>
                    <ul>
                        <li>Use a unique password you haven't used elsewhere</li>
                        <li>Don't share your password with anyone</li>
                        <li>Enable two-factor authentication for extra security</li>
                        <li>Change your password regularly</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OTPPasswordSetup;
