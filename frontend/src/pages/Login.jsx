import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginAPI } from "../api.js";

function Login({ onLogin }) {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!credentials.email || !credentials.password) {
            setError("Please fill all fields");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await loginAPI(credentials.email, credentials.password);
            localStorage.setItem("token", res.data.token);
            const role = res.data.user?.role || "user";
            if (typeof onLogin === "function") onLogin(res.data.token, role);
            navigate(role === "admin" ? "/admin" : "/");
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1>Login</h1>
                {error && <div style={styles.error}>{error}</div>}
                <div style={styles.form}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={credentials.email}
                        onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                        style={styles.input}
                    />
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>
                <p style={styles.footer}>                    <Link to="/forgot-password" style={styles.link}>Forgot password?</Link>
                </p>
                <p style={styles.footer}>                    Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 80px)",
        background: "#f5f5f5",
    },
    card: {
        width: "100%",
        maxWidth: 400,
        padding: 32,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        marginTop: 24,
    },
    input: {
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 4,
        fontSize: 14,
    },
    button: {
        padding: 12,
        background: "#3498db",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 16,
        fontWeight: "bold",
    },
    error: {
        padding: 12,
        background: "#fadbd8",
        color: "#c0392b",
        borderRadius: 4,
        marginBottom: 16,
    },
    footer: {
        textAlign: "center",
        marginTop: 16,
        fontSize: 14,
        color: "#666",
    },
    link: {
        color: "#3498db",
        textDecoration: "none",
    },
};

export default Login;
