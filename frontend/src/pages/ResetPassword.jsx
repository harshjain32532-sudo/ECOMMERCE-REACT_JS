import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { resetPassword } from "../api.js";
import "../styles/Auth.css";

function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            setError("Please fill all fields");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await resetPassword(token, password);
            setSuccess("Your password has been reset. Redirecting to login...");
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            setError(err.response?.data?.error || "Unable to reset password");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleReset();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Reset Password</h1>
                        <p>Create your new password</p>
                    </div>

                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleReset(); }}>
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? "Resetting Password..." : "Reset Password"}
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

export default ResetPassword;
