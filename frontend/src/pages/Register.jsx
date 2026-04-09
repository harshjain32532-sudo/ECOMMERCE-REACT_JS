import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api.js";

function Register() {
    const [credentials, setCredentials] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

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
            setSuccess("Account created successfully! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1>Register</h1>
                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}
                <div style={styles.form}>
                    <input
                        type="text"
                        placeholder="Full name"
                        value={credentials.name}
                        onChange={e => setCredentials({ ...credentials, name: e.target.value })}
                        style={styles.input}
                    />
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={credentials.confirmPassword}
                        onChange={e => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                        style={styles.input}
                    />
                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </div>
                <p style={styles.footer}>
                    Already have an account? <Link to="/login" style={styles.link}>Login</Link>
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
        background: "#27ae60",
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
    success: {
        padding: 12,
        background: "#d4edda",
        color: "#155724",
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
        color: "#27ae60",
        textDecoration: "none",
    },
};

export default Register;
