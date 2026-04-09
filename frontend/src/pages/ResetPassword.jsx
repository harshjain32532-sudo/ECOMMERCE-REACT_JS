import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api.js";

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

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1>Reset Password</h1>
                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}
                <div style={styles.form}>
                    <input
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        style={styles.input}
                    />
                    <button
                        onClick={handleReset}
                        disabled={loading}
                        style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? "Resetting..." : "Reset password"}
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
        background: "#27ae60",
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
};

export default ResetPassword;
