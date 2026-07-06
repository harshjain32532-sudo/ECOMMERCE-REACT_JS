import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as apiLogin } from "../api.js";
import "../styles/Auth.css";

function Login({ onLogin }) {
    const [d, setD] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            setError("");
            setLoading(true);
            const res = await apiLogin(d.email, d.password);
            localStorage.setItem("token", res.data.token);
            if (res.data.role) {
                localStorage.setItem("role", res.data.role);
            }
            localStorage.setItem("email", res.data.user?.email || d.email);
            if (typeof onLogin === "function") {
                onLogin(res.data.token, res.data.role || "user");
            }
            alert("Logged in successfully");
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your account</p>
                    </div>

                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={d.email}
                                onChange={e => setD({ ...d, email: e.target.value })}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={d.password}
                                onChange={e => setD({ ...d, password: e.target.value })}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Don't have an account? <Link to="/register">Create one</Link></p>
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Login;
