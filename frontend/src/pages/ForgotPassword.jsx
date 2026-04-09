import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api.js";

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

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1>Forgot Password</h1>
                {error && <div style={styles.error}>{error}</div>}
                {message && <div style={styles.success}>{message}</div>}
                {resetUrl && (
                    <div style={styles.linkBox}>
                        <p style={styles.linkLabel}>Reset link:</p>
                        <a href={resetUrl} target="_blank" rel="noreferrer" style={styles.link}>
                            {resetUrl}
                        </a>
                    </div>
                )}
                <div style={styles.form}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={styles.input}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? "Sending..." : "Send reset link"}
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        style={styles.secondaryButton}
                    >
                        Back to login
                    </button>
                </div>
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
    secondaryButton: {
        padding: 12,
        background: "#ecf0f1",
        color: "#333",
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
    linkBox: {
        padding: 12,
        background: "#e9f7ef",
        border: "1px solid #c3e6cb",
        borderRadius: 4,
        marginBottom: 16,
        wordBreak: "break-word",
    },
    linkLabel: {
        margin: 0,
        fontSize: 14,
        color: "#155724",
        fontWeight: 600,
    },
    link: {
        display: "block",
        marginTop: 6,
        color: "#0b6e45",
        textDecoration: "underline",
        fontSize: 14,
    },
};

export default ForgotPassword;
