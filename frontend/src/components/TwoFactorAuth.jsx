import { useState } from "react";

function TwoFactorAuth({ userId = "USER123", onEnable, onDisable }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [methods, setMethods] = useState({
        sms: true,
        email: false,
        authenticator: false,
        backup: true,
    });
    const [showQR, setShowQR] = useState(false);
    const [backupCodes, setBackupCodes] = useState([
        "A7K3M2L9Q1B5",
        "X9W1E2R3T4Y7",
        "C5V3B2N1M9Q8",
        "P7L5K3J2H1G9",
        "F6D8S7A9Q1W2",
        "Z3X5C7V2B1N4",
    ]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    const allMethodsEnabled = Object.values(methods).some((v) => v);

    const handleToggleMethod = async (method) => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setMethods({ ...methods, [method]: !methods[method] });
            setMessage(`✓ 2FA ${method} ${!methods[method] ? "enabled" : "disabled"}`);

            if (!methods[method] && onEnable) {
                onEnable({ method, timestamp: new Date() });
            } else if (methods[method] && onDisable) {
                onDisable({ method });
            }

            setTimeout(() => setMessage(""), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleRegenerateBackupCodes = async () => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const newCodes = Array.from({ length: 6 }, () => {
                return Array.from({ length: 12 }, () =>
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
                ).join("");
            });
            setBackupCodes(newCodes);
            setMessage("✓ Backup codes regenerated");
            setTimeout(() => setMessage(""), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadBackupCodes = () => {
        const content = `Two-Factor Authentication Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join("\n")}`;
        const blob = new Blob([content], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "2fa-backup-codes.txt";
        a.click();
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>🔐 Two-Factor Authentication</h2>
                    <p style={styles.subtitle}>Enhance your account security with 2FA</p>
                </div>
                <div style={styles.statusBadge}>
                    {allMethodsEnabled ? (
                        <span style={styles.enabledBadge}>✓ ENABLED</span>
                    ) : (
                        <span style={styles.disabledBadge}>✗ DISABLED</span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button
                    onClick={() => setActiveTab("overview")}
                    style={{
                        ...styles.tabButton,
                        borderBottom: activeTab === "overview" ? "3px solid #2575fc" : "none",
                        color: activeTab === "overview" ? "#2575fc" : "#999",
                    }}
                >
                    📊 Overview
                </button>
                <button
                    onClick={() => setActiveTab("methods")}
                    style={{
                        ...styles.tabButton,
                        borderBottom: activeTab === "methods" ? "3px solid #2575fc" : "none",
                        color: activeTab === "methods" ? "#2575fc" : "#999",
                    }}
                >
                    🔧 Methods
                </button>
                <button
                    onClick={() => setActiveTab("backup")}
                    style={{
                        ...styles.tabButton,
                        borderBottom: activeTab === "backup" ? "3px solid #2575fc" : "none",
                        color: activeTab === "backup" ? "#2575fc" : "#999",
                    }}
                >
                    💾 Backup Codes
                </button>
                <button
                    onClick={() => setActiveTab("activity")}
                    style={{
                        ...styles.tabButton,
                        borderBottom: activeTab === "activity" ? "3px solid #2575fc" : "none",
                        color: activeTab === "activity" ? "#2575fc" : "#999",
                    }}
                >
                    📱 Activity
                </button>
            </div>

            {message && (
                <div style={{ ...styles.alert, background: "#d4edda", color: "#155724" }}>
                    {message}
                </div>
            )}

            {/* Overview Tab */}
            {activeTab === "overview" && (
                <div style={styles.tabContent}>
                    <div style={styles.infoBox}>
                        <h3 style={styles.infoTitle}>ℹ️ What is Two-Factor Authentication?</h3>
                        <p style={styles.infoText}>
                            Two-Factor Authentication adds an extra layer of security to your account. Even if someone has
                            your password, they cannot access your account without the second verification method.
                        </p>
                    </div>

                    <div style={styles.benefitsGrid}>
                        <div style={styles.benefitCard}>
                            <div style={styles.benefitIcon}>🛡️</div>
                            <h4 style={styles.benefitTitle}>Enhanced Security</h4>
                            <p style={styles.benefitText}>Protect your account from unauthorized access</p>
                        </div>
                        <div style={styles.benefitCard}>
                            <div style={styles.benefitIcon}>🔑</div>
                            <h4 style={styles.benefitTitle}>Multiple Methods</h4>
                            <p style={styles.benefitText}>Choose from SMS, Email, or Authenticator App</p>
                        </div>
                        <div style={styles.benefitCard}>
                            <div style={styles.benefitIcon}>🆘</div>
                            <h4 style={styles.benefitTitle}>Backup Codes</h4>
                            <p style={styles.benefitText}>Emergency access if you lose your device</p>
                        </div>
                        <div style={styles.benefitCard}>
                            <div style={styles.benefitIcon}>⚡</div>
                            <h4 style={styles.benefitTitle}>Quick Setup</h4>
                            <p style={styles.benefitText}>Easy to configure and manage</p>
                        </div>
                    </div>

                    <div style={styles.statusGrid}>
                        <div style={styles.statusCard}>
                            <p style={styles.statusLabel}>Current Security Status</p>
                            <p style={styles.statusValue}>
                                {Object.values(methods).filter((v) => v).length} of 4 Methods Enabled
                            </p>
                        </div>
                        <div style={styles.statusCard}>
                            <p style={styles.statusLabel}>Last Verified</p>
                            <p style={styles.statusValue}>Today at 2:30 PM</p>
                        </div>
                        <div style={styles.statusCard}>
                            <p style={styles.statusLabel}>Trusted Devices</p>
                            <p style={styles.statusValue}>3 Devices</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Methods Tab */}
            {activeTab === "methods" && (
                <div style={styles.tabContent}>
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Available 2FA Methods</h3>

                        {/* SMS Method */}
                        <div style={styles.methodCard}>
                            <div style={styles.methodHeader}>
                                <div>
                                    <h4 style={styles.methodTitle}>📱 SMS (Text Message)</h4>
                                    <p style={styles.methodDesc}>Receive OTP via SMS</p>
                                </div>
                                <div
                                    onClick={() => handleToggleMethod("sms")}
                                    style={{
                                        ...styles.toggle,
                                        background: methods.sms ? "#27ae60" : "#ddd",
                                    }}
                                >
                                    <div
                                        style={{
                                            ...styles.toggleCircle,
                                            transform: methods.sms ? "translateX(20px)" : "translateX(0)",
                                        }}
                                    />
                                </div>
                            </div>
                            {methods.sms && (
                                <div style={styles.methodDetails}>
                                    <p>✓ Linked to: +91 98765 43210</p>
                                    <p>✓ Last used: Today at 10:15 AM</p>
                                </div>
                            )}
                        </div>

                        {/* Email Method */}
                        <div style={styles.methodCard}>
                            <div style={styles.methodHeader}>
                                <div>
                                    <h4 style={styles.methodTitle}>✉️ Email Verification</h4>
                                    <p style={styles.methodDesc}>Receive verification codes via email</p>
                                </div>
                                <div
                                    onClick={() => handleToggleMethod("email")}
                                    style={{
                                        ...styles.toggle,
                                        background: methods.email ? "#27ae60" : "#ddd",
                                    }}
                                >
                                    <div
                                        style={{
                                            ...styles.toggleCircle,
                                            transform: methods.email ? "translateX(20px)" : "translateX(0)",
                                        }}
                                    />
                                </div>
                            </div>
                            {methods.email && (
                                <div style={styles.methodDetails}>
                                    <p>✓ Linked to: user@example.com</p>
                                    <p>✓ Last used: Yesterday at 3:45 PM</p>
                                </div>
                            )}
                        </div>

                        {/* Authenticator App */}
                        <div style={styles.methodCard}>
                            <div style={styles.methodHeader}>
                                <div>
                                    <h4 style={styles.methodTitle}>🔐 Authenticator App</h4>
                                    <p style={styles.methodDesc}>Use Google Authenticator or Authy</p>
                                </div>
                                <div
                                    onClick={() => {
                                        if (!methods.authenticator) {
                                            setShowQR(true);
                                        }
                                        handleToggleMethod("authenticator");
                                    }}
                                    style={{
                                        ...styles.toggle,
                                        background: methods.authenticator ? "#27ae60" : "#ddd",
                                    }}
                                >
                                    <div
                                        style={{
                                            ...styles.toggleCircle,
                                            transform: methods.authenticator ? "translateX(20px)" : "translateX(0)",
                                        }}
                                    />
                                </div>
                            </div>
                            {methods.authenticator && (
                                <div style={styles.methodDetails}>
                                    <p>✓ Active authenticator app set up</p>
                                    <p>✓ Last used: 5 minutes ago</p>
                                </div>
                            )}
                        </div>

                        {/* Backup Codes */}
                        <div style={styles.methodCard}>
                            <div style={styles.methodHeader}>
                                <div>
                                    <h4 style={styles.methodTitle}>💾 Backup Codes</h4>
                                    <p style={styles.methodDesc}>Emergency access codes for recovery</p>
                                </div>
                                <div
                                    onClick={() => handleToggleMethod("backup")}
                                    style={{
                                        ...styles.toggle,
                                        background: methods.backup ? "#27ae60" : "#ddd",
                                    }}
                                >
                                    <div
                                        style={{
                                            ...styles.toggleCircle,
                                            transform: methods.backup ? "translateX(20px)" : "translateX(0)",
                                        }}
                                    />
                                </div>
                            </div>
                            {methods.backup && (
                                <div style={styles.methodDetails}>
                                    <p>✓ {backupCodes.length} backup codes available</p>
                                    <p>✓ Keep these codes in a safe place</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Backup Codes Tab */}
            {activeTab === "backup" && (
                <div style={styles.tabContent}>
                    <div style={styles.warningBox}>
                        <p style={styles.warningText}>
                            ⚠️ Store these backup codes in a safe place. You can use them to recover your account if you lose
                            access to your 2FA devices.
                        </p>
                    </div>

                    {!showBackupCodes ? (
                        <button onClick={() => setShowBackupCodes(true)} style={styles.revealButton}>
                            👁️ Show Backup Codes
                        </button>
                    ) : (
                        <>
                            <div style={styles.codesGrid}>
                                {backupCodes.map((code, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleCopyCode(code)}
                                        style={{
                                            ...styles.codeBlock,
                                            background: copiedCode === code ? "#d4edda" : "#f9f9f9",
                                        }}
                                    >
                                        <code style={styles.code}>{code}</code>
                                        <span style={styles.copyIcon}>
                                            {copiedCode === code ? "✓" : "📋"}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.codeActions}>
                                <button onClick={handleDownloadBackupCodes} style={styles.actionButton}>
                                    📥 Download Codes
                                </button>
                                <button
                                    onClick={handleRegenerateBackupCodes}
                                    disabled={loading}
                                    style={styles.actionButton}
                                >
                                    {loading ? "🔄 Regenerating..." : "🔄 Regenerate Codes"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
                <div style={styles.tabContent}>
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Recent 2FA Activity</h3>
                        <div style={styles.activityList}>
                            {[
                                {
                                    type: "sms",
                                    action: "OTP Sent",
                                    details: "Sent to +91 98765 43210",
                                    time: "Today 2:30 PM",
                                },
                                {
                                    type: "authenticator",
                                    action: "Verification Success",
                                    details: "Authenticator app verified",
                                    time: "Today 1:15 PM",
                                },
                                {
                                    type: "email",
                                    action: "Code Sent",
                                    details: "Sent to user@example.com",
                                    time: "Yesterday 10:45 AM",
                                },
                                {
                                    type: "backup",
                                    action: "Backup Code Used",
                                    details: "One backup code consumed",
                                    time: "April 15, 2024",
                                },
                            ].map((activity, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        ...styles.activityItem,
                                        background: idx % 2 === 0 ? "#f9f9f9" : "white",
                                    }}
                                >
                                    <div style={styles.activityIcon}>
                                        {activity.type === "sms" && "📱"}
                                        {activity.type === "email" && "✉️"}
                                        {activity.type === "authenticator" && "🔐"}
                                        {activity.type === "backup" && "💾"}
                                    </div>
                                    <div style={styles.activityContent}>
                                        <p style={styles.activityAction}>{activity.action}</p>
                                        <p style={styles.activityDetails}>{activity.details}</p>
                                    </div>
                                    <p style={styles.activityTime}>{activity.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Modal for Authenticator */}
            {showQR && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <button
                            onClick={() => setShowQR(false)}
                            style={styles.modalClose}
                        >
                            ✕
                        </button>
                        <h3 style={styles.modalTitle}>Set Up Authenticator App</h3>
                        <div style={styles.qrContainer}>
                            <div style={styles.qrPlaceholder}>
                                📱 [QR Code Here]<br />
                                <span style={styles.qrCode}>JBSWY3DPEBLW64TMMQ======</span>
                            </div>
                        </div>
                        <p style={styles.setupSteps}>
                            1. Download Google Authenticator or Authy<br />
                            2. Scan this QR code or enter the code manually<br />
                            3. Enter the 6-digit code to verify
                        </p>
                        <button onClick={() => setShowQR(false)} style={styles.doneButton}>
                            ✓ Done
                        </button>
                    </div>
                </div>
            )}
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
        marginBottom: 30,
    },
    header: {
        background: "linear-gradient(135deg, #2575fc 0%, #1e53e5 100%)",
        color: "white",
        padding: 30,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
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
    statusBadge: {
        fontSize: 11,
    },
    enabledBadge: {
        background: "#27ae60",
        color: "white",
        padding: "8px 16px",
        borderRadius: 20,
        fontWeight: 700,
    },
    disabledBadge: {
        background: "#e74c3c",
        color: "white",
        padding: "8px 16px",
        borderRadius: 20,
        fontWeight: 700,
    },
    tabs: {
        display: "flex",
        borderBottom: "1px solid #f0f0f0",
        background: "#f9f9f9",
        overflowX: "auto",
    },
    tabButton: {
        flex: "0 0 auto",
        padding: "16px 20px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    tabContent: {
        padding: 30,
        animation: "slideInDown 0.3s ease",
    },
    alert: {
        margin: "20px 30px 0px 30px",
        padding: 12,
        borderRadius: 6,
        fontSize: 12,
        textAlign: "center",
        fontWeight: 600,
        animation: "slideInDown 0.3s ease",
    },
    infoBox: {
        background: "#e8f4f8",
        padding: 20,
        borderRadius: 8,
        marginBottom: 24,
        border: "1px solid #b3e5fc",
    },
    infoTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#0277bd",
        margin: "0 0 8px 0",
    },
    infoText: {
        fontSize: 12,
        color: "#0277bd",
        lineHeight: 1.6,
        margin: 0,
    },
    benefitsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 15,
        marginBottom: 24,
    },
    benefitCard: {
        background: "#f9f9f9",
        padding: 20,
        borderRadius: 8,
        textAlign: "center",
        border: "1px solid #f0f0f0",
    },
    benefitIcon: {
        fontSize: 28,
        marginBottom: 10,
    },
    benefitTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 6px 0",
    },
    benefitText: {
        fontSize: 11,
        color: "#666",
        margin: 0,
    },
    statusGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 15,
    },
    statusCard: {
        background: "linear-gradient(135deg, #e8f4f8 0%, #e8f4f8 100%)",
        padding: 16,
        borderRadius: 8,
        border: "1px solid #b3e5fc",
    },
    statusLabel: {
        fontSize: 11,
        color: "#0277bd",
        margin: "0 0 6px 0",
    },
    statusValue: {
        fontSize: 16,
        fontWeight: 700,
        color: "#2575fc",
        margin: 0,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 16,
        margin: "0 0 16px 0",
    },
    methodCard: {
        background: "#f9f9f9",
        padding: 20,
        borderRadius: 8,
        marginBottom: 12,
        border: "1px solid #f0f0f0",
    },
    methodHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    methodTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 4px 0",
    },
    methodDesc: {
        fontSize: 11,
        color: "#999",
        margin: 0,
    },
    toggle: {
        width: 44,
        height: 24,
        borderRadius: 12,
        cursor: "pointer",
        position: "relative",
        transition: "all 0.3s ease",
    },
    toggleCircle: {
        width: 20,
        height: 20,
        background: "white",
        borderRadius: "50%",
        position: "absolute",
        top: 2,
        left: 2,
        transition: "all 0.3s ease",
    },
    methodDetails: {
        marginTop: 12,
        paddingTop: 12,
        borderTop: "1px solid #f0f0f0",
    },
    warningBox: {
        background: "#fff3cd",
        border: "1px solid #ffc107",
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    warningText: {
        fontSize: 12,
        color: "#856404",
        margin: 0,
        lineHeight: 1.6,
    },
    revealButton: {
        width: "100%",
        padding: "12px 16px",
        background: "#2575fc",
        color: "white",
        border: "none",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        marginBottom: 20,
    },
    codesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
        marginBottom: 20,
    },
    codeBlock: {
        padding: 12,
        borderRadius: 6,
        border: "1px solid #ddd",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.3s ease",
    },
    code: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        fontFamily: "monospace",
    },
    copyIcon: {
        fontSize: 13,
    },
    codeActions: {
        display: "flex",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        padding: "12px 16px",
        background: "#f0f0f0",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
    activityList: {
        background: "white",
        borderRadius: 8,
        border: "1px solid #f0f0f0",
        overflow: "hidden",
    },
    activityItem: {
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid #f0f0f0",
    },
    activityIcon: {
        fontSize: 20,
        minWidth: 24,
    },
    activityContent: {
        flex: 1,
    },
    activityAction: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 4px 0",
    },
    activityDetails: {
        fontSize: 11,
        color: "#999",
        margin: 0,
    },
    activityTime: {
        fontSize: 10,
        color: "#999",
        margin: 0,
    },
    modal: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modalContent: {
        background: "white",
        borderRadius: 12,
        padding: 30,
        maxWidth: 400,
        width: "90%",
        position: "relative",
        animation: "slideInUp 0.4s ease",
    },
    modalClose: {
        position: "absolute",
        top: 12,
        right: 12,
        border: "none",
        background: "#f0f0f0",
        width: 32,
        height: 32,
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 16,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 20px 0",
        textAlign: "center",
    },
    qrContainer: {
        textAlign: "center",
        marginBottom: 20,
    },
    qrPlaceholder: {
        background: "#f0f0f0",
        padding: 30,
        borderRadius: 8,
        fontSize: 48,
        color: "#999",
    },
    qrCode: {
        fontSize: 10,
        display: "block",
        marginTop: 10,
        fontFamily: "monospace",
    },
    setupSteps: {
        fontSize: 11,
        color: "#666",
        lineHeight: 1.8,
        marginBottom: 20,
        textAlign: "center",
    },
    doneButton: {
        width: "100%",
        padding: "12px 16px",
        background: "#27ae60",
        color: "white",
        border: "none",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
    },
};

export default TwoFactorAuth;
