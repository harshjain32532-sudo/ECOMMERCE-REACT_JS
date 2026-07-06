import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, login } from "../api.js";
import "../styles/Auth.css";

function Register({ onLogin }) {
    const [credentials, setCredentials] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/register", { replace: true });
    }, [navigate]);

    const handleRegister = async () => {
        if (!credentials.name || !credentials.email || !credentials.password || !credentials.confirmPassword) {
            setError("Please fill all fields");
            return;
        }

        if (credentials.password !== credentials.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (credentials.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await register(credentials.name, credentials.email, credentials.password);
            if (typeof onLogin === "function") {
                const loginRes = await login(credentials.email, credentials.password);
                localStorage.setItem("token", loginRes.data.token);
                if (loginRes.data.role) {
                    localStorage.setItem("role", loginRes.data.role);
                }
                localStorage.setItem("email", loginRes.data.user?.email || credentials.email);
                onLogin(loginRes.data.token, loginRes.data.role || "user");
                setSuccess("Account created and signed in successfully! Redirecting...");
                setTimeout(() => navigate("/"), 2000);
                return;
            }
            setSuccess("Account created successfully! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleRegister();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Create Account</h1>
                        <p>Join EmberCart today</p>
                    </div>

                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={credentials.name}
                                onChange={e => setCredentials({ ...credentials, name: e.target.value })}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={credentials.email}
                                onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="At least 6 characters"
                                value={credentials.password}
                                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                value={credentials.confirmPassword}
                                onChange={e => setCredentials({ ...credentials, confirmPassword: e.target.value })}
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
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Sign in</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
