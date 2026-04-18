import { useState } from "react";

function ReturnPolicy({ productId, price = 0 }) {
    const [activeTab, setActiveTab] = useState("returns");

    const returnProcess = [
        {
            step: 1,
            title: "Initiate Return",
            desc: "Go to My Orders and click on Return within 7 days of delivery",
            icon: "📋",
        },
        {
            step: 2,
            title: "Select Reason",
            desc: "Choose the reason for return: Defective, Wrong Item, Change of Mind, etc.",
            icon: "🤔",
        },
        {
            step: 3,
            title: "Pack Item",
            desc: "Pack the item securely in original packaging if available",
            icon: "📦",
        },
        {
            step: 4,
            title: "Schedule Pickup",
            desc: "A pickup agent will collect the item from your address within 24-48 hours",
            icon: "🚚",
        },
        {
            step: 5,
            title: "Inspection",
            desc: "Item is inspected at our warehouse for authenticity and condition",
            icon: "🔍",
        },
        {
            step: 6,
            title: "Refund",
            desc: "Refund is processed to your original payment method within 5-7 business days",
            icon: "💰",
        },
    ];

    const returnConditions = [
        { condition: "Time Limit", detail: "7 days from delivery" },
        { condition: "Original Packaging", detail: "Strongly recommended but not mandatory" },
        { condition: "Product Condition", detail: "Unused and in original condition" },
        { condition: "Accessories", detail: "Must include all accessories, manuals, and warranty cards" },
        { condition: "Installation", detail: "If installed, professional re-installation charges may apply" },
        { condition: "Damages", detail: "Physical damage caused by customer handling won't be accepted" },
    ];

    const exchangeProcess = [
        { step: 1, icon: "🔄", title: "Submit Exchange Request", desc: "Choose a different size, color, or model" },
        { step: 2, icon: "🚚", title: "Arrange Pickup", desc: "Schedule pickup of the current item" },
        { step: 3, icon: "🏪", title: "New Item Shipped", desc: "Replacement ships immediately via priority delivery" },
        { step: 4, icon: "✅", title: "Item Received", desc: "New item arrives within 2-3 business days" },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>📋 Return & Exchange Policy</h2>
                <p style={styles.subtitle}>Easy returns within 7 days of delivery</p>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                {["returns", "exchange", "refund"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            ...styles.tab,
                            borderBottom: activeTab === tab ? "3px solid #2575fc" : "1px solid #ddd",
                            color: activeTab === tab ? "#2575fc" : "#666",
                        }}
                    >
                        {tab === "returns" && "↩️ Returns"}
                        {tab === "exchange" && "🔄 Exchange"}
                        {tab === "refund" && "💰 Refund"}
                    </button>
                ))}
            </div>

            {/* Returns Tab */}
            {activeTab === "returns" && (
                <div style={styles.tabContent}>
                    {/* Return Process Timeline */}
                    <h3 style={styles.sectionTitle}>How to Return</h3>
                    <div style={styles.timeline}>
                        {returnProcess.map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    ...styles.timelineItem,
                                    animation: `slideInLeft 0.4s ease ${idx * 0.05}s both`,
                                }}
                            >
                                {/* Connector Line */}
                                {idx < returnProcess.length - 1 && (
                                    <div style={styles.connector} />
                                )}

                                {/* Step Circle */}
                                <div style={styles.stepCircle}>
                                    <span style={styles.stepIcon}>{item.icon}</span>
                                    <div style={styles.stepNumber}>{item.step}</div>
                                </div>

                                {/* Step Content */}
                                <div style={styles.stepContent}>
                                    <h4 style={styles.stepTitle}>{item.title}</h4>
                                    <p style={styles.stepDesc}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Return Conditions */}
                    <h3 style={styles.sectionTitle}>Return Conditions</h3>
                    <div style={styles.conditionsGrid}>
                        {returnConditions.map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    ...styles.conditionCard,
                                    animation: `fadeIn 0.5s ease ${idx * 0.05}s both`,
                                }}
                            >
                                <h5 style={styles.conditionTitle}>{item.condition}</h5>
                                <p style={styles.conditionDetail}>{item.detail}</p>
                            </div>
                        ))}
                    </div>

                    {/* Non-Returnable Items */}
                    <div style={styles.warningBox}>
                        <h4 style={styles.warningTitle}>🚫 Non-Returnable Items</h4>
                        <ul style={styles.warningList}>
                            <li>Items damaged due to customer mishandling</li>
                            <li>Products beyond the 7-day return window</li>
                            <li>Items missing original packaging and accessories</li>
                            <li>Personal care products that have been opened</li>
                            <li>Digital products and service vouchers</li>
                            <li>Items with tampered serial numbers</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Exchange Tab */}
            {activeTab === "exchange" && (
                <div style={styles.tabContent}>
                    <h3 style={styles.sectionTitle}>Quick Exchange Process</h3>
                    <div style={styles.exchangeGrid}>
                        {exchangeProcess.map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    ...styles.exchangeCard,
                                    animation: `slideInUp 0.4s ease ${idx * 0.05}s both`,
                                }}
                            >
                                <div style={styles.exchangeIcon}>{item.icon}</div>
                                <h4 style={styles.exchangeTitle}>{item.title}</h4>
                                <p style={styles.exchangeDesc}>{item.desc}</p>
                                <div style={styles.stepNumber}>{item.step}</div>
                            </div>
                        ))}
                    </div>

                    {/* Exchange Benefits */}
                    <div style={styles.benefitsBox}>
                        <h4 style={styles.benefitsTitle}>✨ Exchange Benefits</h4>
                        <ul style={styles.benefitsList}>
                            <li>Free shipping on replacement item</li>
                            <li>No additional charges or restocking fees</li>
                            <li>Express delivery within 2-3 business days</li>
                            <li>Original return label provided</li>
                            <li>Track both return and replacement</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Refund Tab */}
            {activeTab === "refund" && (
                <div style={styles.tabContent}>
                    <h3 style={styles.sectionTitle}>Refund Information</h3>

                    <div style={styles.refundGrid}>
                        <div style={styles.refundCard}>
                            <h4 style={styles.refundTitle}>💳 Refund Timeline</h4>
                            <ul style={styles.refundList}>
                                <li>
                                    <strong>Days 1-5:</strong> Return pickup and item in transit
                                </li>
                                <li>
                                    <strong>Days 6-8:</strong> Item inspection and verification
                                </li>
                                <li>
                                    <strong>Days 9-14:</strong> Refund processed to original payment method
                                </li>
                            </ul>
                        </div>

                        <div style={styles.refundCard}>
                            <h4 style={styles.refundTitle}>💰 Refund Amount</h4>
                            <div style={styles.refundBreakdown}>
                                <div style={styles.breakdownRow}>
                                    <span>Product Price:</span>
                                    <span style={styles.amount}>₹{price}</span>
                                </div>
                                <div style={styles.breakdownRow}>
                                    <span>Original Shipping:</span>
                                    <span style={styles.amount}>₹0</span>
                                </div>
                                <div style={styles.breakdownRow}>
                                    <span>Discount Applied:</span>
                                    <span style={styles.amount}>-₹0</span>
                                </div>
                                <div style={{ ...styles.breakdownRow, ...styles.totalRow }}>
                                    <span>Total Refund:</span>
                                    <span style={styles.totalAmount}>₹{price}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Info */}
                    <div style={styles.infoBox}>
                        <h4 style={styles.infoTitle}>ℹ️ Refund Method</h4>
                        <p style={styles.infoText}>
                            Refunds are processed to your original payment method (Credit Card,
                            Debit Card, Net Banking, UPI, or Wallet).
                        </p>
                        <p style={styles.infoText}>
                            It may take 5-7 business days for the refund to reflect in your account
                            depending on your bank or payment provider.
                        </p>
                    </div>

                    {/* Partial Refund Scenarios */}
                    <div style={styles.scenariosBox}>
                        <h4 style={styles.scenariosTitle}>⚠️ Partial Refund Scenarios</h4>
                        <ul style={styles.scenariosList}>
                            <li>Missing accessories/packaging: Up to 20% deduction</li>
                            <li>Minor damages: Up to 30% deduction</li>
                            <li>Heavy usage marks: Up to 15% deduction</li>
                            <li>Open/used items: Up to 50% deduction</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* FAQ Section */}
            <div style={styles.faqSection}>
                <h3 style={styles.sectionTitle}>❓ Frequently Asked Questions</h3>

                <div style={styles.faqGrid}>
                    {[
                        {
                            q: "Can I return after 7 days?",
                            a: "Returns are not accepted after 7 days of delivery. Contact support for damaged items.",
                        },
                        {
                            q: "Do I need original packaging?",
                            a: "While recommended, it's not mandatory. However, items must be in original condition.",
                        },
                        {
                            q: "How do I track my return?",
                            a: "You'll receive a return tracking ID via SMS/Email. Track it using this ID.",
                        },
                        {
                            q: "What if item is damaged during return?",
                            a: "Use the provided return label. We're not responsible for damages if label is not used.",
                        },
                    ].map((faq, idx) => (
                        <div key={idx} style={styles.faqItem}>
                            <p style={styles.faqQuestion}>{faq.q}</p>
                            <p style={styles.faqAnswer}>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Support Contact */}
            <div style={styles.supportBox}>
                <h4 style={styles.supportTitle}>📞 Need Help?</h4>
                <p style={styles.supportText}>
                    Contact our customer support: <strong>support@ecommerce.com</strong> or call <strong>1800-1234-5678</strong>
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
        marginBottom: 25,
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
    tabs: {
        display: "flex",
        gap: 0,
        marginBottom: 25,
        borderBottom: "1px solid #ddd",
    },
    tab: {
        padding: "14px 20px",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        transition: "all 0.3s ease",
    },
    tabContent: {
        animation: "slideInDown 0.4s ease",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "25px 0 15px 0",
    },
    timeline: {
        position: "relative",
        marginBottom: 25,
    },
    timelineItem: {
        display: "grid",
        gridTemplateColumns: "80px 1fr",
        gap: 20,
        marginBottom: 20,
        position: "relative",
    },
    connector: {
        position: "absolute",
        left: 40,
        top: 80,
        width: 2,
        height: 80,
        background: "#2575fc",
    },
    stepCircle: {
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #2575fc 0%, #1e5dcc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: "0 4px 12px rgba(37, 117, 252, 0.3)",
    },
    stepIcon: {
        fontSize: 32,
        position: "absolute",
    },
    stepNumber: {
        position: "absolute",
        bottom: -8,
        right: -8,
        background: "white",
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        color: "#2575fc",
        fontSize: 11,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    stepContent: {
        paddingTop: 10,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 6px 0",
    },
    stepDesc: {
        fontSize: 12,
        color: "#666",
        margin: 0,
    },
    conditionsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 12,
        marginBottom: 25,
    },
    conditionCard: {
        background: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        border: "1px solid #f0f0f0",
    },
    conditionTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 6px 0",
    },
    conditionDetail: {
        fontSize: 11,
        color: "#666",
        margin: 0,
    },
    warningBox: {
        background: "#fff3cd",
        padding: 18,
        borderRadius: 8,
        border: "1px solid #ffc107",
        marginBottom: 25,
    },
    warningTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#8b7500",
        margin: "0 0 12px 0",
    },
    warningList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
    },
    exchangeGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
        marginBottom: 25,
    },
    exchangeCard: {
        background: "#f0f7ff",
        padding: 20,
        borderRadius: 8,
        border: "2px solid #2575fc",
        textAlign: "center",
        position: "relative",
    },
    exchangeIcon: {
        fontSize: 32,
        marginBottom: 10,
    },
    exchangeTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 8px 0",
    },
    exchangeDesc: {
        fontSize: 11,
        color: "#666",
        margin: 0,
    },
    benefitsBox: {
        background: "#d4edda",
        padding: 18,
        borderRadius: 8,
        border: "1px solid #27ae60",
    },
    benefitsTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#27ae60",
        margin: "0 0 12px 0",
    },
    benefitsList: {
        listStyle: "none",
        padding: "0 0 0 20px",
        margin: 0,
    },
    refundGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 15,
        marginBottom: 25,
    },
    refundCard: {
        background: "#f9f9f9",
        padding: 18,
        borderRadius: 8,
        border: "1px solid #f0f0f0",
    },
    refundTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 12px 0",
    },
    refundList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
    },
    refundBreakdown: {
        background: "white",
        padding: 12,
        borderRadius: 6,
    },
    breakdown Row: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        color: "#666",
        padding: "6px 0",
    },
    breakdownRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        color: "#666",
        padding: "6px 0",
    },
    amount: {
        fontWeight: 700,
    },
    totalRow: {
        borderTop: "2px solid #ddd",
        paddingTop: 8,
        marginTop: 8,
        fontSize: 12,
        fontWeight: 700,
    },
    totalAmount: {
        color: "#2575fc",
        fontWeight: 700,
    },
    infoBox: {
        background: "#e8f4f8",
        padding: 18,
        borderRadius: 8,
        border: "1px solid #b3e5fc",
        marginBottom: 25,
    },
    infoTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#0277bd",
        margin: "0 0 10px 0",
    },
    infoText: {
        fontSize: 11,
        color: "#0277bd",
        margin: "8px 0",
    },
    scenariosBox: {
        background: "#fff8e1",
        padding: 18,
        borderRadius: 8,
        border: "1px solid #ffe082",
    },
    scenariosTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#f57f17",
        margin: "0 0 12px 0",
    },
    scenariosList: {
        listStyle: "none",
        padding: "0 0 0 20px",
        margin: 0,
    },
    faqSection: {
        marginTop: 30,
        paddingTop: 25,
        borderTop: "2px solid #f0f0f0",
    },
    faqGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 15,
    },
    faqItem: {
        background: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        border: "1px solid #f0f0f0",
    },
    faqQuestion: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 8px 0",
    },
    faqAnswer: {
        fontSize: 11,
        color: "#666",
        margin: 0,
        lineHeight: 1.5,
    },
    supportBox: {
        background: "linear-gradient(135deg, #2575fc 0%, #1e5dcc 100%)",
        padding: 20,
        borderRadius: 8,
        textAlign: "center",
        marginTop: 25,
        color: "white",
    },
    supportTitle: {
        fontSize: 14,
        fontWeight: 700,
        margin: "0 0 10px 0",
    },
    supportText: {
        fontSize: 12,
        margin: 0,
    },
};

export default ReturnPolicy;
