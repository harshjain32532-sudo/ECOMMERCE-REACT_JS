import { useState } from "react";

function GiftCard({ giftCards = [], onPurchaseGiftCard, onShowGiftCard }) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: 500,
        recipientName: "",
        recipientEmail: "",
        message: "",
        senderName: "",
        deliveryDate: new Date().toISOString().split('T')[0],
    });

    const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePurchase = () => {
        if (formData.recipientName && formData.recipientEmail && formData.senderName) {
            onPurchaseGiftCard(formData);
            alert(`Gift Card of ₹${formData.amount} sent successfully!`);
            setFormData({
                amount: 500,
                recipientName: "",
                recipientEmail: "",
                message: "",
                senderName: "",
                deliveryDate: new Date().toISOString().split('T')[0],
            });
            setShowForm(false);
        } else {
            alert("Please fill all required fields");
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h2 style={styles.title}>🎁 Gift Cards</h2>
                <p style={styles.subtitle}>Send the gift of choice to loved ones</p>
            </div>

            {/* CTA Buttons */}
            <div style={styles.ctaButtons}>
                <button
                    onClick={() => setShowForm(true)}
                    style={styles.buyBtn}
                >
                    + Buy Gift Card
                </button>
                <button
                    onClick={() => onShowGiftCard()}
                    style={styles.viewBtn}
                >
                    👁️ View My Gift Cards
                </button>
            </div>

            {/* Predefined Gift Cards */}
            <div style={styles.predefinedSection}>
                <h3 style={styles.sectionTitle}>Popular Amounts</h3>
                <div style={styles.amountsGrid}>
                    {predefinedAmounts.map((amount, idx) => (
                        <div
                            key={idx}
                            style={{
                                ...styles.amountCard,
                                animation: `slideInUp 0.4s ease ${idx * 0.05}s both`,
                            }}
                        >
                            <div style={styles.amountDisplay}>₹{amount}</div>
                            <button
                                onClick={() => {
                                    setFormData({ ...formData, amount });
                                    setShowForm(true);
                                }}
                                style={styles.quickBuyBtn}
                            >
                                Quick Buy
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Purchase Form */}
            {showForm && (
                <div style={styles.formContainer}>
                    <h3 style={styles.formTitle}>📝 Create Gift Card</h3>

                    <div style={styles.form}>
                        {/* Amount Input */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Gift Card Amount *</label>
                            <div style={styles.amountInputGroup}>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    min="100"
                                    max="100000"
                                    style={styles.input}
                                />
                                <span style={styles.currencyLabel}>₹</span>
                            </div>
                            <small style={styles.hint}>Min ₹100 - Max ₹100,000</small>
                        </div>

                        {/* Recipient Details */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Recipient Name *</label>
                            <input
                                type="text"
                                name="recipientName"
                                value={formData.recipientName}
                                onChange={handleInputChange}
                                placeholder="John Doe"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Recipient Email *</label>
                            <input
                                type="email"
                                name="recipientEmail"
                                value={formData.recipientEmail}
                                onChange={handleInputChange}
                                placeholder="john@example.com"
                                style={styles.input}
                            />
                        </div>

                        {/* Sender Details */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Your Name *</label>
                            <input
                                type="text"
                                name="senderName"
                                value={formData.senderName}
                                onChange={handleInputChange}
                                placeholder="Your Name"
                                style={styles.input}
                            />
                        </div>

                        {/* Message */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Personal Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Add a special message (optional)"
                                style={styles.textarea}
                                rows="3"
                                maxLength="200"
                            />
                            <small style={styles.hint}>{formData.message.length}/200</small>
                        </div>

                        {/* Delivery Date */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Delivery Date</label>
                            <input
                                type="date"
                                name="deliveryDate"
                                value={formData.deliveryDate}
                                onChange={handleInputChange}
                                style={styles.input}
                            />
                        </div>

                        {/* Summary */}
                        <div style={styles.summary}>
                            <div style={styles.summaryRow}>
                                <span>Gift Card Value</span>
                                <span style={styles.summaryValue}>₹{formData.amount}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span>Processing Fee</span>
                                <span style={styles.summaryValue}>Free</span>
                            </div>
                            <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
                                <span>Total Amount</span>
                                <span style={styles.totalValue}>₹{formData.amount}</span>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div style={styles.formActions}>
                            <button
                                onClick={handlePurchase}
                                style={styles.purchaseBtn}
                            >
                                🎁 Purchase Gift Card
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                style={styles.cancelFormBtn}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Cards */}
            <div style={styles.infoSection}>
                <h3 style={styles.sectionTitle}>Why Buy Gift Cards?</h3>
                <div style={styles.infoBenefits}>
                    {[
                        { icon: "💳", title: "Instant Delivery", desc: "via Email" },
                        { icon: "🔒", title: "Secure & Safe", desc: "SSL Protected" },
                        { icon: "♾️", title: "No Expiry", desc: "Lifetime validity" },
                        { icon: "📱", title: "Easy to Use", desc: "Apply at checkout" },
                    ].map((benefit, idx) => (
                        <div
                            key={idx}
                            style={{
                                ...styles.benefitCard,
                                animation: `fadeIn 0.5s ease ${idx * 0.1}s both`,
                            }}
                        >
                            <div style={styles.benefitIcon}>{benefit.icon}</div>
                            <p style={styles.benefitTitle}>{benefit.title}</p>
                            <p style={styles.benefitDesc}>{benefit.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* T&C */}
            <div style={styles.termsSection}>
                <p style={styles.termsText}>
                    ✓ Gift cards are non-refundable and cannot be exchanged for cash
                </p>
                <p style={styles.termsText}>
                    ✓ Valid for purchases on our platform only
                </p>
                <p style={styles.termsText}>
                    ✓ Can be used for multiple purchases until balance is zero
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "linear-gradient(135deg, #fff5f7 0%, #ffe6e6 100%)",
        padding: 30,
        borderRadius: 12,
        marginBottom: 30,
        animation: "fadeIn 0.5s ease",
    },
    header: {
        textAlign: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: "#e74c3c",
        margin: "0 0 8px 0",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        margin: 0,
    },
    ctaButtons: {
        display: "flex",
        gap: 12,
        marginBottom: 25,
        justifyContent: "center",
    },
    buyBtn: {
        padding: "14px 28px",
        background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 14,
        transition: "all 0.3s ease",
    },
    viewBtn: {
        padding: "14px 28px",
        background: "white",
        color: "#e74c3c",
        border: "2px solid #e74c3c",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 14,
        transition: "all 0.3s ease",
    },
    predefinedSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 15,
        margin: "0 0 15px 0",
    },
    amountsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
    },
    amountCard: {
        background: "white",
        padding: 20,
        borderRadius: 10,
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
    },
    amountDisplay: {
        fontSize: 24,
        fontWeight: 700,
        color: "#e74c3c",
        marginBottom: 12,
    },
    quickBuyBtn: {
        width: "100%",
        padding: "10px 12px",
        background: "#e74c3c",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 12,
        transition: "all 0.3s ease",
    },
    formContainer: {
        background: "white",
        padding: 25,
        borderRadius: 10,
        marginBottom: 25,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        animation: "slideInDown 0.4s ease",
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 20,
        margin: "0 0 20px 0",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 15,
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: 600,
        color: "#2c3e50",
    },
    input: {
        padding: "12px 14px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 13,
        color: "#333",
    },
    amountInputGroup: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    currencyLabel: {
        position: "absolute",
        right: 12,
        fontSize: 14,
        fontWeight: 700,
        color: "#999",
    },
    hint: {
        fontSize: 11,
        color: "#999",
    },
    textarea: {
        padding: "12px 14px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 13,
        color: "#333",
        fontFamily: "inherit",
        resize: "vertical",
    },
    summary: {
        background: "#f9f9f9",
        padding: 15,
        borderRadius: 6,
        marginTop: 10,
    },
    summaryRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13,
        color: "#666",
        marginBottom: 8,
    },
    summaryValue: {
        fontWeight: 600,
        color: "#2c3e50",
    },
    totalRow: {
        borderTop: "2px solid #ddd",
        paddingTop: 10,
        marginTop: 10,
        marginBottom: 0,
        fontSize: 14,
        fontWeight: 700,
    },
    totalValue: {
        color: "#e74c3c",
        fontSize: 16,
    },
    formActions: {
        display: "flex",
        gap: 12,
        marginTop: 15,
    },
    purchaseBtn: {
        flex: 1,
        padding: "14px 16px",
        background: "#e74c3c",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        transition: "all 0.3s ease",
    },
    cancelFormBtn: {
        flex: 1,
        padding: "14px 16px",
        background: "#f0f0f0",
        color: "#666",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    infoSection: {
        marginBottom: 25,
    },
    infoBenefits: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 15,
    },
    benefitCard: {
        background: "white",
        padding: 20,
        borderRadius: 10,
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    benefitIcon: {
        fontSize: 28,
        marginBottom: 10,
    },
    benefitTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 4px 0",
    },
    benefitDesc: {
        fontSize: 12,
        color: "#666",
        margin: 0,
    },
    termsSection: {
        background: "rgba(255,255,255,0.7)",
        padding: 15,
        borderRadius: 8,
        borderLeft: "4px solid #e74c3c",
    },
    termsText: {
        fontSize: 12,
        color: "#666",
        margin: "8px 0",
    },
};

export default GiftCard;
