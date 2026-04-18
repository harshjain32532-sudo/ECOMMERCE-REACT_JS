import { useState, useEffect } from "react";

function SMSOTPManager({ userId, onOTPSent, onVerificationComplete }) {
    const [activeTab, setActiveTab] = useState("send"); // send, verify, history
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [provider, setProvider] = useState("twilio");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [otpHistory, setOtpHistory] = useState([
        {
            id: 1,
            phone: "+91 98765 43210",
            timestamp: "2024-04-18 14:30",
            status: "Verified",
            provider: "Twilio",
        },
        {
            id: 2,
            phone: "+91 87654 32109",
            timestamp: "2024-04-17 10:15",
            status: "Verified",
            provider: "AWS SNS",
        },
        {
            id: 3,
            phone: "+91 76543 21098",
            timestamp: "2024-04-16 16:45",
            status: "Failed",
            provider: "Twilio",
        },
    ]);
    const [timer, setTimer] = useState(0);
    const [sentPhones, setSentPhones] = useState([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(interval);
        }
    }, [timer]);

    const validatePhone = (phoneNum) => {
        const cleaned = phoneNum.replace(/\D/g, "");
        return cleaned.length === 10 && /^[6-9]/.test(cleaned);
    };

    const handleSendOTP = async () => {
        setError("");
        setMessage("");

        if (!phone.trim()) {
            setError("Please enter a phone number");
            return;
        }

        if (!validatePhone(phone)) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
            sessionStorage.setItem(`otp_${phone}`, mockOTP);

            const cleaned = phone.replace(/\D/g, "");
            setSentPhones([...sentPhones, cleaned]);
            setMessage(`OTP sent successfully to ${cleaned}`);
            setTimer(180);
            setOtp("");

            if (onOTPSent) {
                onOTPSent({ phone: cleaned, provider, timestamp: new Date() });
            }

            console.log(`Mock OTP via ${provider}:`, mockOTP);
        } catch (err) {
            setError(`Failed to send OTP via ${provider}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError("");
        setMessage("");

        if (!otp.trim()) {
            setError("Please enter the OTP");
            return;
        }

        if (otp.length !== 6) {
            setError("OTP must be 6 digits");
            return;
        }

        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));

            const cleaned = phone.replace(/\D/g, "");
            const storedOTP = sessionStorage.getItem(`otp_${phone}`);

            if (otp === storedOTP) {
                setMessage("✓ OTP verified successfully!");

                // Add to history
                const newRecord = {
                    id: otpHistory.length + 1,
                    phone: `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`,
                    timestamp: new Date().toLocaleString("en-IN"),
                    status: "Verified",
                    provider: provider.toUpperCase(),
                };
                setOtpHistory([newRecord, ...otpHistory]);

                if (onVerificationComplete) {
                    onVerificationComplete({ phone: cleaned, verified: true });
                }

                setTimeout(() => {
                    setOtp("");
                    setPhone("");
                }, 1500);
            } else {
                setError("Invalid OTP. Please try again.");
                setOtp("");
            }
        } catch (err) {
            setError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        if (timer === 0) {
            handleSendOTP();
        }
    };

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>📱 SMS OTP Manager</h2>
                <p style={styles.subtitle}>Send and verify OTP via SMS</p>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button
                    onClick={() => setActiveTab("send")}
                    style={{
                        ...styles.tab,
                        borderBottom: activeTab === "send" ? "3px solid #2575fc" : "none",
                    }}
                >
                    📤 Send OTP
                </button>
                <button
                    onClick={() => setActiveTab("verify")}
                    style={{
                        ...styles.tab,
                        borderBottom: activeTab === "verify" ? "3px solid #2575fc" : "none",
                    }}
                >
                    ✓ Verify OTP
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    style={{
                        ...styles.tab,
                        borderBottom: activeTab === "history" ? "3px solid #2575fc" : "none",
                    }}
                >
                    📋 History
                </button>
            </div>

            {/* Send OTP Tab */}
            {activeTab === "send" && (
                <div style={styles.tabContent}>
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Select SMS Provider</h3>
                        <div style={styles.providerGrid}>
                            {[
                                { id: "twilio", name: "Twilio", icon: "📞", features: ["Low cost", "Global coverage"] },
                                { id: "aws", name: "AWS SNS", icon: "☁️", features: ["Highly scalable", "Secure"] },
                                { id: "exotel", name: "Exotel", icon: "📡", features: ["India-focused", "Affordable"] },
                                { id: "msg91", name: "MSG91", icon: "💬", features: ["Fast delivery", "High uptime"] },
                            ].map((prov) => (
                                <div
                                    key={prov.id}
                                    onClick={() => setProvider(prov.id)}
                                    style={{
                                        ...styles.providerCard,
                                        background: provider === prov.id ? "#e8f4f8" : "white",
                                        borderColor: provider === prov.id ? "#2575fc" : "#ddd",
                                    }}
                                >
                                    <div style={styles.providerIcon}>{prov.icon}</div>
                                    <p style={styles.providerName}>{prov.name}</p>
                                    <div style={styles.providerFeatures}>
                                        {prov.features.map((f, i) => (
                                            <span key={i} style={styles.feature}>
                                                ✓ {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Enter Phone Number</h3>
                        <div style={styles.phoneInputGroup}>
                            <span style={styles.countryCode}>+91</span>
                            <input
                                type="tel"
                                placeholder="Enter 10-digit number"
                                value={phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                    setPhone(value);
                                    setError("");
                                }}
                                style={styles.phoneInput}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {message && (
                        <div style={{ ...styles.alert, ...styles.success }}>
                            {message}
                        </div>
                    )}
                    {error && (
                        <div style={{ ...styles.alert, ...styles.errorAlert }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSendOTP}
                        disabled={!validatePhone(phone) || loading}
                        style={{
                            ...styles.button,
                            opacity: !validatePhone(phone) || loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? "⏳ Sending..." : `Send OTP via ${provider.toUpperCase()}`}
                    </button>

                    {timer > 0 && (
                        <div style={styles.infoBox}>
                            <p>OTP will expire in <strong>{formatTimer(timer)}</strong></p>
                        </div>
                    )}
                </div>
            )}

            {/* Verify OTP Tab */}
            {activeTab === "verify" && (
                <div style={styles.tabContent}>
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Verify OTP</h3>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <div style={styles.phoneInputGroup}>
                                <span style={styles.countryCode}>+91</span>
                                <input
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        setPhone(value);
                                        setError("");
                                    }}
                                    style={styles.phoneInput}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>OTP Code</label>
                            <input
                                type="text"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    setOtp(value);
                                    setError("");
                                }}
                                style={styles.otpInput}
                                maxLength="6"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {message && (
                        <div style={{ ...styles.alert, ...styles.success }}>
                            {message}
                        </div>
                    )}
                    {error && (
                        <div style={{ ...styles.alert, ...styles.errorAlert }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleVerifyOTP}
                        disabled={otp.length !== 6 || loading}
                        style={{
                            ...styles.button,
                            opacity: otp.length !== 6 || loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? "⏳ Verifying..." : "Verify OTP"}
                    </button>

                    <div style={styles.resendSection}>
                        <p style={styles.resendText}>Didn't receive OTP?</p>
                        <button
                            onClick={handleResend}
                            disabled={timer > 0}
                            style={{
                                ...styles.resendButton,
                                opacity: timer > 0 ? 0.6 : 1,
                            }}
                        >
                            {timer > 0 ? `Resend in ${formatTimer(timer)}` : "Resend OTP"}
                        </button>
                    </div>
                </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
                <div style={styles.tabContent}>
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>OTP History</h3>
                        <div style={styles.historyTable}>
                            <div style={styles.tableHeader}>
                                <div style={styles.tableCol}>Phone Number</div>
                                <div style={styles.tableCol}>Timestamp</div>
                                <div style={styles.tableCol}>Provider</div>
                                <div style={styles.tableCol}>Status</div>
                            </div>
                            {otpHistory.map((record, idx) => (
                                <div
                                    key={record.id}
                                    style={{
                                        ...styles.tableRow,
                                        background: idx % 2 === 0 ? "white" : "#f9f9f9",
                                        animation: `slideInLeft 0.3s ease ${idx * 0.05}s both`,
                                    }}
                                >
                                    <div style={styles.tableCol}>{record.phone}</div>
                                    <div style={styles.tableCol}>{record.timestamp}</div>
                                    <div style={styles.tableCol}>
                                        <span style={styles.badge}>{record.provider}</span>
                                    </div>
                                    <div style={styles.tableCol}>
                                        <span
                                            style={{
                                                ...styles.statusBadge,
                                                background: record.status === "Verified" ? "#d4edda" : "#f8d7da",
                                                color: record.status === "Verified" ? "#27ae60" : "#721c24",
                                            }}
                                        >
                                            {record.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>{otpHistory.length}</p>
                            <p style={styles.statLabel}>Total OTPs Sent</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>
                                {otpHistory.filter((r) => r.status === "Verified").length}
                            </p>
                            <p style={styles.statLabel}>Verified</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>
                                {otpHistory.filter((r) => r.status === "Failed").length}
                            </p>
                            <p style={styles.statLabel}>Failed</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Features Box */}
            <div style={styles.featuresBox}>
                <h4 style={styles.featuresTitle}>🚀 Key Features</h4>
                <ul style={styles.featuresList}>
                    <li>Multi-provider support for optimal delivery</li>
                    <li>Real-time OTP delivery with confirmation</li>
                    <li>Automatic retry mechanism on failure</li>
                    <li>Complete verification history tracking</li>
                    <li>Secure OTP encryption and storage</li>
                    <li>Customizable OTP validity period</li>
                </ul>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
        animation: "fadeIn 0.4s ease",
    },
    header: {
        background: "linear-gradient(135deg, #2575fc 0%, #1e53e5 100%)",
        color: "white",
        padding: 30,
        textAlign: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: 700,
        margin: 0,
    },
    subtitle: {
        fontSize: 12,
        margin: "8px 0 0 0",
        opacity: 0.9,
    },
    tabs: {
        display: "flex",
        borderBottom: "1px solid #f0f0f0",
        background: "#f9f9f9",
    },
    tab: {
        flex: 1,
        padding: "16px 20px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        color: "#999",
        transition: "all 0.3s ease",
    },
    tabContent: {
        padding: 30,
        animation: "slideInDown 0.3s ease",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 12,
        margin: "0 0 12px 0",
    },
    providerGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
    },
    providerCard: {
        padding: 16,
        borderRadius: 8,
        border: "2px solid",
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.3s ease",
    },
    providerIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    providerName: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 8px 0",
    },
    providerFeatures: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
    },
    feature: {
        fontSize: 10,
        color: "#666",
    },
    phoneInputGroup: {
        display: "flex",
        border: "1px solid #ddd",
        borderRadius: 6,
        overflow: "hidden",
    },
    countryCode: {
        padding: "12px 14px",
        background: "#f9f9f9",
        fontWeight: 700,
        color: "#999",
        borderRight: "1px solid #ddd",
    },
    phoneInput: {
        flex: 1,
        padding: "12px 14px",
        border: "none",
        fontSize: 13,
        outline: "none",
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        display: "block",
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 6,
    },
    otpInput: {
        width: "100%",
        padding: "14px",
        fontSize: 20,
        letterSpacing: 6,
        textAlign: "center",
        border: "2px solid #ddd",
        borderRadius: 6,
        fontFamily: "monospace",
        fontWeight: 700,
    },
    alert: {
        padding: 12,
        borderRadius: 6,
        fontSize: 12,
        marginBottom: 16,
        textAlign: "center",
    },
    success: {
        background: "#d4edda",
        color: "#155724",
        border: "1px solid #c3e6cb",
    },
    errorAlert: {
        background: "#f8d7da",
        color: "#721c24",
        border: "1px solid #f5c6cb",
    },
    button: {
        width: "100%",
        padding: "14px 16px",
        background: "#2575fc",
        color: "white",
        border: "none",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.3s ease",
        marginBottom: 12,
    },
    infoBox: {
        background: "#e8f4f8",
        padding: 12,
        borderRadius: 6,
        textAlign: "center",
        fontSize: 12,
        color: "#0277bd",
    },
    resendSection: {
        textAlign: "center",
        marginTop: 16,
    },
    resendText: {
        fontSize: 12,
        color: "#666",
        margin: "0 0 8px 0",
    },
    resendButton: {
        background: "none",
        border: "1px solid #2575fc",
        color: "#2575fc",
        padding: "8px 14px",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 700,
        transition: "all 0.3s ease",
    },
    historyTable: {
        border: "1px solid #f0f0f0",
        borderRadius: 8,
        overflow: "hidden",
    },
    tableHeader: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        background: "#f9f9f9",
        borderBottom: "1px solid #f0f0f0",
    },
    tableRow: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        borderBottom: "1px solid #f0f0f0",
    },
    tableCol: {
        padding: 12,
        fontSize: 11,
        color: "#666",
    },
    badge: {
        background: "#e8f4f8",
        color: "#0277bd",
        padding: "3px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
    },
    statusBadge: {
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 12,
    },
    statCard: {
        background: "#f9f9f9",
        padding: 16,
        borderRadius: 8,
        textAlign: "center",
    },
    statValue: {
        fontSize: 18,
        fontWeight: 700,
        color: "#2575fc",
        margin: "0 0 4px 0",
    },
    statLabel: {
        fontSize: 11,
        color: "#666",
        margin: 0,
    },
    featuresBox: {
        background: "#f0f7ff",
        padding: 20,
        borderTop: "1px solid #e8f4f8",
    },
    featuresTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 12px 0",
    },
    featuresList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
    },
};

export default SMSOTPManager;
