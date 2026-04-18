import { useState } from "react";

function NotificationPreferences({ onSave }) {
    const [preferences, setPreferences] = useState({
        orderUpdates: true,
        promotions: true,
        newArrivals: false,
        wishlistItems: true,
        priceDrops: true,
        reviews: false,
        newsLetter: true,
        sms: false,
        pushNotifications: true,
        email: true,
    });

    const handleToggle = (key) => {
        setPreferences({
            ...preferences,
            [key]: !preferences[key],
        });
    };

    const handleSave = () => {
        onSave(preferences);
        alert("Notification preferences saved successfully!");
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>🔔 Notification Preferences</h2>
                <p style={styles.subtitle}>Choose what notifications you want to receive</p>
            </div>

            {/* Channel Selection */}
            <div style={styles.channelSection}>
                <h3 style={styles.sectionTitle}>Notification Channels</h3>

                <div style={styles.channelGrid}>
                    <label style={styles.channelLabel}>
                        <input
                            type="checkbox"
                            checked={preferences.email}
                            onChange={() => handleToggle("email")}
                            style={styles.checkbox}
                        />
                        <span style={styles.channelName}>📧 Email</span>
                    </label>

                    <label style={styles.channelLabel}>
                        <input
                            type="checkbox"
                            checked={preferences.sms}
                            onChange={() => handleToggle("sms")}
                            style={styles.checkbox}
                        />
                        <span style={styles.channelName}>📱 SMS</span>
                    </label>

                    <label style={styles.channelLabel}>
                        <input
                            type="checkbox"
                            checked={preferences.pushNotifications}
                            onChange={() => handleToggle("pushNotifications")}
                            style={styles.checkbox}
                        />
                        <span style={styles.channelName}>🔔 Push</span>
                    </label>
                </div>
            </div>

            {/* Notification Types */}
            <div style={styles.preferencesSection}>
                <h3 style={styles.sectionTitle}>Notification Types</h3>

                {[
                    {
                        key: "orderUpdates",
                        icon: "📦",
                        title: "Order Updates",
                        desc: "Get updates about your orders, shipments, and deliveries",
                    },
                    {
                        key: "promotions",
                        icon: "🎉",
                        title: "Promotions & Offers",
                        desc: "Receive special discounts, deals, and exclusive offers",
                    },
                    {
                        key: "newArrivals",
                        icon: "✨",
                        title: "New Arrivals",
                        desc: "Get notified about new products in your favorite categories",
                    },
                    {
                        key: "wishlistItems",
                        icon: "❤️",
                        title: "Wishlist Items",
                        desc: "Get alerts when items in your wishlist go on sale",
                    },
                    {
                        key: "priceDrops",
                        icon: "📉",
                        title: "Price Drops",
                        desc: "Be notified when products you viewed have price reductions",
                    },
                    {
                        key: "reviews",
                        icon: "⭐",
                        title: "Reviews & Ratings",
                        desc: "Get reminders to review products you purchased",
                    },
                    {
                        key: "newsLetter",
                        icon: "📰",
                        title: "Weekly Newsletter",
                        desc: "Receive our curated weekly newsletter with trending products",
                    },
                ].map((item, idx) => (
                    <div
                        key={idx}
                        style={{
                            ...styles.preferenceItem,
                            animation: `slideInLeft 0.4s ease ${idx * 0.05}s both`,
                        }}
                    >
                        <div style={styles.preferenceInfo}>
                            <div style={styles.preferenceHeader}>
                                <span style={styles.preferenceIcon}>{item.icon}</span>
                                <h4 style={styles.preferenceName}>{item.title}</h4>
                            </div>
                            <p style={styles.preferenceDesc}>{item.desc}</p>
                        </div>

                        <label style={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={preferences[item.key]}
                                onChange={() => handleToggle(item.key)}
                                style={styles.checkbox}
                            />
                            <span
                                style={{
                                    ...styles.toggleSwitch,
                                    background: preferences[item.key] ? "#27ae60" : "#ddd",
                                }}
                            >
                                <span
                                    style={{
                                        ...styles.toggleDot,
                                        transform: preferences[item.key]
                                            ? "translateX(24px)"
                                            : "translateX(0)",
                                    }}
                                />
                            </span>
                        </label>
                    </div>
                ))}
            </div>

            {/* Frequency Settings */}
            <div style={styles.frequencySection}>
                <h3 style={styles.sectionTitle}>Notification Frequency</h3>

                <div style={styles.frequencyOptions}>
                    {[
                        { value: "instant", label: "Instant", desc: "Get notified immediately" },
                        { value: "daily", label: "Daily Digest", desc: "Once per day (evening)" },
                        { value: "weekly", label: "Weekly Digest", desc: "Once per week (Sunday)" },
                    ].map((option, idx) => (
                        <label
                            key={idx}
                            style={{
                                ...styles.frequencyOption,
                                background: preferences.frequency === option.value ? "#e8f4f8" : "white",
                                borderColor: preferences.frequency === option.value ? "#2575fc" : "#ddd",
                            }}
                        >
                            <input
                                type="radio"
                                name="frequency"
                                value={option.value}
                                onChange={(e) =>
                                    setPreferences({
                                        ...preferences,
                                        frequency: e.target.value,
                                    })
                                }
                                style={styles.radio}
                            />
                            <div>
                                <p style={styles.frequencyLabel}>{option.label}</p>
                                <p style={styles.frequencyDesc}>{option.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Quiet Hours */}
            <div style={styles.quietHoursSection}>
                <h3 style={styles.sectionTitle}>⏰ Quiet Hours</h3>
                <p style={styles.quietHoursDesc}>
                    Don't receive notifications between these hours
                </p>

                <div style={styles.quietHoursInputs}>
                    <div style={styles.timeInput}>
                        <label style={styles.label}>From</label>
                        <input
                            type="time"
                            defaultValue="22:00"
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.timeInput}>
                        <label style={styles.label}>To</label>
                        <input
                            type="time"
                            defaultValue="08:00"
                            style={styles.input}
                        />
                    </div>

                    <label style={styles.quietLabel}>
                        <input
                            type="checkbox"
                            defaultChecked
                            style={styles.checkbox}
                        />
                        <span>Enable Quiet Hours</span>
                    </label>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actions}>
                <button onClick={handleSave} style={styles.saveBtn}>
                    💾 Save Preferences
                </button>
                <button
                    onClick={() => {
                        setPreferences({
                            orderUpdates: true,
                            promotions: true,
                            newArrivals: false,
                            wishlistItems: true,
                            priceDrops: true,
                            reviews: false,
                            newsLetter: true,
                            sms: false,
                            pushNotifications: true,
                            email: true,
                            frequency: "instant",
                        });
                    }}
                    style={styles.resetBtn}
                >
                    Reset to Default
                </button>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
                <p style={styles.infoText}>
                    💡 You can update these preferences anytime. We respect your privacy and will never share your contact information.
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        padding: 30,
        borderRadius: 12,
        marginBottom: 30,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        animation: "fadeIn 0.4s ease",
    },
    header: {
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: "2px solid #f0f0f0",
    },
    title: {
        fontSize: 20,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 6px 0",
    },
    subtitle: {
        fontSize: 12,
        color: "#999",
        margin: 0,
    },
    channelSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 15px 0",
    },
    channelGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
    },
    channelLabel: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 15,
        background: "#f9f9f9",
        borderRadius: 8,
        border: "1px solid #f0f0f0",
        cursor: "pointer",
    },
    checkbox: {
        width: 18,
        height: 18,
        cursor: "pointer",
        accentColor: "#2575fc",
    },
    radio: {
        width: 18,
        height: 18,
        cursor: "pointer",
        accentColor: "#2575fc",
        marginRight: 10,
    },
    channelName: {
        fontSize: 13,
        fontWeight: 600,
        color: "#2c3e50",
    },
    preferencesSection: {
        marginBottom: 25,
    },
    preferenceItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        background: "#f9f9f9",
        borderRadius: 8,
        border: "1px solid #f0f0f0",
        marginBottom: 12,
        transition: "all 0.3s ease",
    },
    preferenceInfo: {
        flex: 1,
    },
    preferenceHeader: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        marginBottom: 6,
    },
    preferenceIcon: {
        fontSize: 18,
    },
    preferenceName: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        margin: 0,
    },
    preferenceDesc: {
        fontSize: 11,
        color: "#999",
        margin: "4px 0 0 28px",
    },
    toggleLabel: {
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
    },
    toggleSwitch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        padding: "2px 4px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        marginLeft: 10,
    },
    toggleDot: {
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "white",
        transition: "transform 0.3s ease",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    },
    frequencySection: {
        marginBottom: 25,
        background: "#f9f9f9",
        padding: 20,
        borderRadius: 8,
    },
    frequencyOptions: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
    },
    frequencyOption: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 15,
        borderRadius: 8,
        border: "1px solid #ddd",
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
    frequencyLabel: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 4px 0",
    },
    frequencyDesc: {
        fontSize: 11,
        color: "#999",
        margin: 0,
    },
    quietHoursSection: {
        background: "#e8f4f8",
        padding: 20,
        borderRadius: 8,
        border: "1px solid #b3e5fc",
        marginBottom: 25,
    },
    quietHoursDesc: {
        fontSize: 12,
        color: "#0277bd",
        margin: "0 0 15px 0",
    },
    quietHoursInputs: {
        display: "flex",
        gap: 15,
        alignItems: "flex-end",
        flexWrap: "wrap",
    },
    timeInput: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: 600,
        color: "#2c3e50",
    },
    input: {
        padding: "10px 12px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 12,
    },
    quietLabel: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        fontWeight: 600,
        color: "#2c3e50",
        cursor: "pointer",
    },
    actions: {
        display: "flex",
        gap: 12,
        marginBottom: 20,
    },
    saveBtn: {
        flex: 1,
        padding: "14px 16px",
        background: "#27ae60",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        transition: "all 0.3s ease",
    },
    resetBtn: {
        flex: 1,
        padding: "14px 16px",
        background: "#f0f0f0",
        color: "#666",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        transition: "all 0.3s ease",
    },
    infoBox: {
        background: "#fff3cd",
        padding: 12,
        borderRadius: 6,
        border: "1px solid #ffc107",
        textAlign: "center",
    },
    infoText: {
        fontSize: 11,
        color: "#8b7500",
        margin: 0,
        fontWeight: 600,
    },
};

export default NotificationPreferences;
