import { useEffect, useState } from "react";
import { getEmailPreferences, updateEmailPreferences } from "../api.js";

export function EmailPreferences() {
    const [preferences, setPreferences] = useState({
        marketing: true,
        orderUpdates: true,
        promotions: true,
        reviews: false,
        newsletter: true,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const res = await getEmailPreferences();
            setPreferences(res.data);
        } catch (err) {
            setError("Failed to load preferences");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        try {
            setSuccess("");
            setError("");
            await updateEmailPreferences(preferences);
            setSuccess("✓ Email preferences updated successfully");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Failed to update preferences");
        }
    };

    if (loading) return <div style={styles.loading}>Loading preferences...</div>;

    return (
        <div style={styles.container}>
            <h1>📧 Email Preferences</h1>
            <p style={styles.subtitle}>Control which emails you want to receive from us</p>

            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <div style={styles.preferencesGrid}>
                <div style={styles.preferenceCard}>
                    <div style={styles.preferenceHeader}>
                        <h3>Order Updates</h3>
                        <input
                            type="checkbox"
                            checked={preferences.orderUpdates}
                            onChange={() => handleChange("orderUpdates")}
                            style={styles.checkbox}
                        />
                    </div>
                    <p style={styles.description}>
                        Get notifications about your orders, shipments, and deliveries
                    </p>
                </div>

                <div style={styles.preferenceCard}>
                    <div style={styles.preferenceHeader}>
                        <h3>Promotional Offers</h3>
                        <input
                            type="checkbox"
                            checked={preferences.promotions}
                            onChange={() => handleChange("promotions")}
                            style={styles.checkbox}
                        />
                    </div>
                    <p style={styles.description}>
                        Receive exclusive deals, flash sales, and special discounts
                    </p>
                </div>

                <div style={styles.preferenceCard}>
                    <div style={styles.preferenceHeader}>
                        <h3>Marketing Emails</h3>
                        <input
                            type="checkbox"
                            checked={preferences.marketing}
                            onChange={() => handleChange("marketing")}
                            style={styles.checkbox}
                        />
                    </div>
                    <p style={styles.description}>
                        Learn about new products, features, and company updates
                    </p>
                </div>

                <div style={styles.preferenceCard}>
                    <div style={styles.preferenceHeader}>
                        <h3>Newsletter</h3>
                        <input
                            type="checkbox"
                            checked={preferences.newsletter}
                            onChange={() => handleChange("newsletter")}
                            style={styles.checkbox}
                        />
                    </div>
                    <p style={styles.description}>
                        Weekly newsletter with curated content and recommendations
                    </p>
                </div>

                <div style={styles.preferenceCard}>
                    <div style={styles.preferenceHeader}>
                        <h3>Review Requests</h3>
                        <input
                            type="checkbox"
                            checked={preferences.reviews}
                            onChange={() => handleChange("reviews")}
                            style={styles.checkbox}
                        />
                    </div>
                    <p style={styles.description}>
                        Requests to review products you've purchased
                    </p>
                </div>
            </div>

            <button style={styles.saveButton} onClick={handleSave}>
                💾 Save Preferences
            </button>

            <div style={styles.infoBox}>
                <h4>ℹ️ Why We Send Emails</h4>
                <p>
                    We use these emails to keep you informed and provide you with relevant offers.
                    You can manage these preferences anytime, and we'll respect your choices.
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 900,
        margin: "0 auto",
        padding: 20,
    },
    loading: {
        textAlign: "center",
        padding: 40,
        color: "#666",
    },
    subtitle: {
        color: "#666",
        marginBottom: 30,
    },
    error: {
        padding: 12,
        marginBottom: 16,
        borderRadius: 4,
        background: "#fadbd8",
        color: "#c0392b",
    },
    success: {
        padding: 12,
        marginBottom: 16,
        borderRadius: 4,
        background: "#d4edda",
        color: "#155724",
    },
    preferencesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        marginBottom: 30,
    },
    preferenceCard: {
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
    },
    preferenceHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        cursor: "pointer",
    },
    description: {
        margin: 0,
        color: "#666",
        fontSize: 14,
        lineHeight: "1.5",
    },
    saveButton: {
        padding: "12px 24px",
        backgroundColor: "#27ae60",
        color: "white",
        border: "none",
        borderRadius: 4,
        fontSize: 16,
        fontWeight: "bold",
        cursor: "pointer",
        transition: "background 0.3s",
        marginBottom: 30,
    },
    infoBox: {
        padding: 16,
        backgroundColor: "#f0f7ff",
        borderLeft: "4px solid #3498db",
        borderRadius: 4,
    },
};

export default EmailPreferences;
