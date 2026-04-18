import { useState } from "react";

function CouponOffer({ coupons = [], appliedCoupon = null, onApplyCoupon, cartTotal = 0 }) {
    const [showCoupons, setShowCoupons] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleApplyCoupon = (coupon) => {
        if (coupon.minAmount && cartTotal < coupon.minAmount) {
            setErrorMessage(`Minimum cart value ₹${coupon.minAmount} required`);
            return;
        }
        onApplyCoupon(coupon);
        setSuccessMessage(`Coupon ${coupon.code} applied successfully!`);
        setCouponCode("");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleManualApply = () => {
        const found = coupons.find(c => c.code === couponCode);
        if (found) {
            handleApplyCoupon(found);
        } else {
            setErrorMessage("Invalid coupon code");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const calculateSavings = (coupon) => {
        if (coupon.discountType === "percentage") {
            return Math.floor((cartTotal * coupon.discountValue) / 100);
        }
        return Math.min(coupon.discountValue, cartTotal);
    };

    return (
        <div style={styles.container}>
            {/* Applied Coupon Display */}
            {appliedCoupon && (
                <div style={styles.appliedCoupon}>
                    <div style={styles.appliedBadge}>
                        <span style={styles.checkmark}>✓</span>
                        <span>Coupon Applied!</span>
                    </div>
                    <div style={styles.appliedDetails}>
                        <p style={styles.couponName}>{appliedCoupon.title}</p>
                        <p style={styles.savingsText}>
                            You save ₹{calculateSavings(appliedCoupon)} • Code: {appliedCoupon.code}
                        </p>
                    </div>
                    <button
                        onClick={() => onApplyCoupon(null)}
                        style={styles.removeBtn}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Manual Coupon Input */}
            <div style={styles.manualInput}>
                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setErrorMessage("");
                        }}
                        placeholder="Enter coupon code"
                        style={styles.input}
                    />
                    <button
                        onClick={handleManualApply}
                        style={styles.applyBtn}
                    >
                        Apply
                    </button>
                </div>
                {errorMessage && (
                    <p style={styles.errorMsg}>{errorMessage}</p>
                )}
                {successMessage && (
                    <p style={styles.successMsg}>{successMessage}</p>
                )}
            </div>

            {/* View Coupons Button */}
            <button
                onClick={() => setShowCoupons(!showCoupons)}
                style={styles.viewCouponsBtn}
            >
                {showCoupons ? "Hide Offers" : "🎟️ View All Offers"}
            </button>

            {/* Coupons List */}
            {showCoupons && (
                <div style={styles.couponsList}>
                    <h3 style={styles.listTitle}>Available Coupons & Offers</h3>
                    {coupons.length > 0 ? (
                        <div style={styles.couponsGrid}>
                            {coupons.map((coupon, idx) => {
                                const isSavingsEligible = !coupon.minAmount || cartTotal >= coupon.minAmount;
                                const savings = calculateSavings(coupon);

                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            ...styles.couponCard,
                                            opacity: isSavingsEligible ? 1 : 0.6,
                                            animation: `slideInLeft 0.4s ease ${idx * 0.05}s both`,
                                        }}
                                    >
                                        {/* Discount Badge */}
                                        <div style={styles.discountBadge}>
                                            <span style={styles.discountValue}>
                                                {coupon.discountType === "percentage"
                                                    ? `${coupon.discountValue}%`
                                                    : `₹${coupon.discountValue}`}
                                            </span>
                                            <span style={styles.discountLabel}>OFF</span>
                                        </div>

                                        {/* Coupon Details */}
                                        <div style={styles.couponDetails}>
                                            <h4 style={styles.couponTitle}>{coupon.title}</h4>
                                            <p style={styles.couponDescription}>{coupon.description}</p>

                                            {coupon.minAmount && (
                                                <p style={styles.couponCondition}>
                                                    Min. ₹{coupon.minAmount}
                                                </p>
                                            )}

                                            {coupon.expiryDate && (
                                                <p style={styles.couponExpiry}>
                                                    Expires: {coupon.expiryDate}
                                                </p>
                                            )}

                                            {isSavingsEligible && savings > 0 && (
                                                <p style={styles.potentialSavings}>
                                                    Save ₹{savings} on this order
                                                </p>
                                            )}

                                            {!isSavingsEligible && (
                                                <p style={styles.ineligible}>
                                                    Add ₹{coupon.minAmount - cartTotal} more to apply
                                                </p>
                                            )}
                                        </div>

                                        {/* Code Display */}
                                        <div style={styles.codeDisplay}>
                                            <code style={styles.code}>{coupon.code}</code>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => handleApplyCoupon(coupon)}
                                            disabled={!isSavingsEligible}
                                            style={{
                                                ...styles.selectCouponBtn,
                                                opacity: isSavingsEligible ? 1 : 0.5,
                                                cursor: isSavingsEligible ? "pointer" : "not-allowed",
                                            }}
                                        >
                                            {appliedCoupon?.code === coupon.code ? "✓ Applied" : "Apply"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={styles.noCoupons}>
                            <p>No coupons available</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        animation: "fadeIn 0.4s ease",
    },
    appliedCoupon: {
        background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
        padding: 15,
        borderRadius: 8,
        border: "2px solid #27ae60",
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 15,
        animation: "slideInDown 0.4s ease",
    },
    appliedBadge: {
        background: "#27ae60",
        color: "white",
        padding: "8px 12px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: 6,
    },
    checkmark: {
        fontSize: 16,
    },
    appliedDetails: {
        flex: 1,
    },
    couponName: {
        fontSize: 13,
        fontWeight: 700,
        color: "#27ae60",
        margin: 0,
    },
    savingsText: {
        fontSize: 12,
        color: "#666",
        margin: "4px 0 0 0",
    },
    removeBtn: {
        background: "rgba(255,255,255,0.7)",
        border: "none",
        borderRadius: "50%",
        width: 28,
        height: 28,
        cursor: "pointer",
        fontSize: 16,
        transition: "all 0.3s ease",
    },
    manualInput: {
        marginBottom: 15,
    },
    inputGroup: {
        display: "flex",
        gap: 8,
        marginBottom: 8,
    },
    input: {
        flex: 1,
        padding: "12px 14px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 13,
        color: "#333",
        textTransform: "uppercase",
    },
    applyBtn: {
        padding: "12px 20px",
        background: "#2575fc",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    errorMsg: {
        fontSize: 12,
        color: "#e74c3c",
        margin: 0,
        fontWeight: 600,
    },
    successMsg: {
        fontSize: 12,
        color: "#27ae60",
        margin: 0,
        fontWeight: 600,
    },
    viewCouponsBtn: {
        width: "100%",
        padding: "12px 16px",
        background: "#fff3cd",
        border: "1px solid #ffc107",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        color: "#8b7500",
        transition: "all 0.3s ease",
        fontSize: 13,
    },
    couponsList: {
        marginTop: 20,
        paddingTop: 20,
        borderTop: "1px solid #f0f0f0",
        animation: "slideInDown 0.4s ease",
    },
    listTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 15px 0",
    },
    couponsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 12,
    },
    couponCard: {
        background: "#f9f9f9",
        border: "2px solid #ffc107",
        borderRadius: 10,
        padding: 12,
        position: "relative",
        transition: "all 0.3s ease",
    },
    discountBadge: {
        position: "absolute",
        top: -12,
        right: 12,
        background: "#ffc107",
        color: "#8b7500",
        padding: "6px 12px",
        borderRadius: 6,
        textAlign: "center",
        fontWeight: 700,
        display: "flex",
        flexDirection: "column",
    },
    discountValue: {
        fontSize: 14,
    },
    discountLabel: {
        fontSize: 10,
    },
    couponDetails: {
        marginBottom: 12,
    },
    couponTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 4px 0",
    },
    couponDescription: {
        fontSize: 11,
        color: "#666",
        margin: "4px 0",
    },
    couponCondition: {
        fontSize: 11,
        color: "#999",
        margin: "4px 0",
        fontStyle: "italic",
    },
    couponExpiry: {
        fontSize: 10,
        color: "#e74c3c",
        margin: "4px 0",
        fontWeight: 600,
    },
    potentialSavings: {
        fontSize: 12,
        color: "#27ae60",
        margin: "6px 0",
        fontWeight: 700,
    },
    ineligible: {
        fontSize: 11,
        color: "#e74c3c",
        margin: "6px 0",
        fontWeight: 600,
    },
    codeDisplay: {
        background: "white",
        padding: 8,
        borderRadius: 6,
        marginBottom: 10,
        textAlign: "center",
        border: "1px dashed #ddd",
    },
    code: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2575fc",
        letterSpacing: 1,
    },
    selectCouponBtn: {
        width: "100%",
        padding: "10px 12px",
        background: "#2575fc",
        color: "white",
        border: "none",
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 12,
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
    noCoupons: {
        textAlign: "center",
        padding: 20,
        color: "#999",
    },
};

export default CouponOffer;
