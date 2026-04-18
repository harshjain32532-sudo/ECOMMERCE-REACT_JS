import { useState } from "react";

function EMIOption({ price = 0, onSelectEMI }) {
    const [selectedEMI, setSelectedEMI] = useState(null);

    const emiOptions = [
        { months: 3, interestRate: 0, fee: 0 },
        { months: 6, interestRate: 5, fee: Math.floor(price * 0.015) },
        { months: 9, interestRate: 7, fee: Math.floor(price * 0.02) },
        { months: 12, interestRate: 9, fee: Math.floor(price * 0.025) },
    ];

    const calculateEMI = (principal, ratePerMonth, months) => {
        if (ratePerMonth === 0) return principal / months;
        const rate = ratePerMonth / 100;
        return (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    };

    const getEMIDetails = (option) => {
        const monthly = calculateEMI(price + option.fee, option.interestRate / 100 / 12, option.months);
        return {
            monthlyAmount: Math.ceil(monthly),
            totalAmount: Math.ceil(monthly * option.months),
            totalInterest: Math.ceil(monthly * option.months - price),
            fee: option.fee,
        };
    };

    const handleSelectEMI = (option) => {
        setSelectedEMI(option);
        const details = getEMIDetails(option);
        onSelectEMI({
            ...option,
            ...details,
        });
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>💳 EMI Options</h3>
            <p style={styles.subtitle}>Split your purchase into easy monthly installments</p>

            <div style={styles.emiGrid}>
                {/* No EMI Option */}
                <div
                    onClick={() => handleSelectEMI(null)}
                    style={{
                        ...styles.emiCard,
                        background: selectedEMI === null ? "#e8f4f8" : "white",
                        borderColor: selectedEMI === null ? "#2575fc" : "#ddd",
                        borderWidth: selectedEMI === null ? "2px" : "1px",
                        animation: "slideInUp 0.3s ease",
                    }}
                >
                    <div style={styles.selectedBadge}>
                        {selectedEMI === null && <span style={styles.checkmark}>✓</span>}
                    </div>
                    <h4 style={styles.cardTitle}>Pay Now</h4>
                    <p style={styles.cardPrice}>₹{price.toLocaleString()}</p>
                    <p style={styles.cardDetail}>No EMI charges</p>
                </div>

                {/* EMI Options */}
                {emiOptions.map((option, idx) => {
                    const details = getEMIDetails(option);
                    const isSelected = selectedEMI?.months === option.months;

                    return (
                        <div
                            key={idx}
                            onClick={() => handleSelectEMI(option)}
                            style={{
                                ...styles.emiCard,
                                background: isSelected ? "#e8f4f8" : "white",
                                borderColor: isSelected ? "#2575fc" : "#ddd",
                                borderWidth: isSelected ? "2px" : "1px",
                                animation: `slideInUp 0.4s ease ${(idx + 1) * 0.05}s both`,
                            }}
                        >
                            {/* Popular Badge */}
                            {option.months === 3 && (
                                <div style={styles.popularBadge}>Popular</div>
                            )}

                            {/* Selected Check */}
                            <div style={styles.selectedBadge}>
                                {isSelected && <span style={styles.checkmark}>✓</span>}
                            </div>

                            <h4 style={styles.cardTitle}>{option.months} Months</h4>

                            <div style={styles.monthlyAmount}>
                                ₹{details.monthlyAmount.toLocaleString()}
                            </div>

                            <p style={styles.monthlyLabel}>per month</p>

                            {/* Breakdown */}
                            <div style={styles.breakdown}>
                                <div style={styles.breakdownRow}>
                                    <span style={styles.breakdownLabel}>Total Amount:</span>
                                    <span style={styles.breakdownValue}>
                                        ₹{details.totalAmount.toLocaleString()}
                                    </span>
                                </div>
                                {details.totalInterest > 0 && (
                                    <div style={styles.breakdownRow}>
                                        <span style={styles.breakdownLabel}>Interest:</span>
                                        <span style={styles.interestValue}>
                                            ₹{details.totalInterest.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {option.fee > 0 && (
                                    <div style={styles.breakdownRow}>
                                        <span style={styles.breakdownLabel}>Processing Fee:</span>
                                        <span style={styles.feeValue}>
                                            ₹{option.fee.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Rate Display */}
                            {option.interestRate > 0 && (
                                <p style={styles.rateInfo}>
                                    @ {option.interestRate}% p.a.
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Eligible Banks */}
            <div style={styles.banksSection}>
                <h4 style={styles.banksTitle}>🏦 Eligible Banks</h4>
                <div style={styles.banksList}>
                    {[
                        { name: "HDFC Bank", logo: "🏦" },
                        { name: "ICICI Bank", logo: "🏦" },
                        { name: "Axis Bank", logo: "🏦" },
                        { name: "SBI", logo: "🏦" },
                        { name: "Kotak Bank", logo: "🏦" },
                        { name: "Yes Bank", logo: "🏦" },
                    ].map((bank, idx) => (
                        <div key={idx} style={styles.bankItem}>
                            <span style={styles.bankLogo}>{bank.logo}</span>
                            <span style={styles.bankName}>{bank.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Terms & Conditions */}
            <div style={styles.termsBox}>
                <h4 style={styles.termsTitle}>📋 Important Terms</h4>
                <ul style={styles.termsList}>
                    <li style={styles.termItem}>EMI plans are offered by authorized banks</li>
                    <li style={styles.termItem}>Fees and interest are non-refundable</li>
                    <li style={styles.termItem}>Subject to bank approval</li>
                    <li style={styles.termItem}>Product must be insured during EMI tenure</li>
                    <li style={styles.termItem}>Early payment of EMI is allowed without penalty</li>
                </ul>
            </div>

            {/* Current Selection Info */}
            {selectedEMI && (
                <div style={styles.selectionBox}>
                    <p style={styles.selectionText}>
                        ✓ Your EMI of <strong>₹{getEMIDetails(selectedEMI).monthlyAmount.toLocaleString()}</strong> for {selectedEMI.months} months has been selected
                    </p>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        padding: 25,
        borderRadius: 10,
        marginBottom: 25,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        animation: "fadeIn 0.4s ease",
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 6,
        margin: "0 0 6px 0",
    },
    subtitle: {
        fontSize: 12,
        color: "#999",
        margin: "0 0 20px 0",
    },
    emiGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 15,
        marginBottom: 25,
    },
    emiCard: {
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: 18,
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.3s ease",
        position: "relative",
        background: "white",
    },
    popularBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        background: "#2575fc",
        color: "white",
        padding: "4px 10px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
    },
    selectedBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        background: "#2575fc",
        color: "white",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
        minWidth: 0,
    },
    checkmark: {
        fontSize: 14,
        fontWeight: 700,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "24px 0 8px 0",
    },
    cardPrice: {
        fontSize: 10,
        color: "#999",
        margin: "4px 0",
    },
    cardDetail: {
        fontSize: 11,
        color: "#666",
        margin: "4px 0",
    },
    monthlyAmount: {
        fontSize: 20,
        fontWeight: 700,
        color: "#2575fc",
        margin: "8px 0 4px 0",
    },
    monthlyLabel: {
        fontSize: 11,
        color: "#999",
        margin: 0,
    },
    breakdown: {
        background: "#f9f9f9",
        padding: 10,
        borderRadius: 6,
        margin: "12px 0",
        textAlign: "left",
    },
    breakdownRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        color: "#666",
        margin: "4px 0",
        padding: "2px 0",
    },
    breakdownLabel: {
        fontWeight: 600,
    },
    breakdownValue: {
        color: "#2c3e50",
        fontWeight: 700,
    },
    interestValue: {
        color: "#e74c3c",
        fontWeight: 700,
    },
    feeValue: {
        color: "#f39c12",
        fontWeight: 700,
    },
    rateInfo: {
        fontSize: 10,
        color: "#2575fc",
        fontWeight: 600,
        margin: "8px 0 0 0",
    },
    banksSection: {
        background: "#f9f9f9",
        padding: 18,
        borderRadius: 10,
        marginBottom: 20,
    },
    banksTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 12px 0",
    },
    banksList: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 8,
    },
    bankItem: {
        background: "white",
        padding: 10,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: "1px solid #e0e0e0",
    },
    bankLogo: {
        fontSize: 16,
    },
    bankName: {
        fontSize: 11,
        fontWeight: 600,
        color: "#099268",
    },
    termsBox: {
        background: "#e8f4f8",
        padding: 15,
        borderRadius: 8,
        borderLeft: "4px solid #2575fc",
        marginBottom: 15,
    },
    termsTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 10px 0",
    },
    termsList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
    },
    termItem: {
        fontSize: 11,
        color: "#555",
        padding: "4px 0 4px 20px",
        position: "relative",
    },
    selectionBox: {
        background: "#d4edda",
        padding: 12,
        borderRadius: 6,
        border: "1px solid #27ae60",
        textAlign: "center",
        animation: "slideInUp 0.4s ease",
    },
    selectionText: {
        fontSize: 12,
        color: "#27ae60",
        fontWeight: 600,
        margin: 0,
    },
};

export default EMIOption;
