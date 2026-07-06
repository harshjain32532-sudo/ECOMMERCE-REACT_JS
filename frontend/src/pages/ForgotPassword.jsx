import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../api.js";
import "../styles/Auth.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [resetUrl, setResetUrl] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!email) {
            setError("Please enter your email address");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");
        setResetUrl("");

        try {
            const res = await forgotPassword(email);
            setMessage(res.data.message || "If that email exists, a reset link has been sent.");
            if (res.data.resetUrl) {
                setResetUrl(res.data.resetUrl);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Could not send reset link");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Forgot Password?</h1>
                        <p>We'll help you reset your password</p>
                    </div>

                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {message && <div className="success-message">{message}</div>}

                        {resetUrl && (
                            <div className="reset-link-box">
                                <p className="reset-link-label">Reset Link:</p>
                                <a href={resetUrl} target="_blank" rel="noreferrer" className="reset-link-url">
                                    {resetUrl}
                                </a>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p><Link to="/login">← Back to Login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
