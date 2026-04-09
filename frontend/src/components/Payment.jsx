import { useState } from "react";

function Payment({ onPaymentSubmit, total, isLoading }) {
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [cardDetails, setCardDetails] = useState({
        cardholderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        billingAddress: "",
        billingCity: "",
        billingZip: "",
    });
    const [upiId, setUpiId] = useState("");
    const [errors, setErrors] = useState({});

    const validateCardNumber = (number) => {
        return /^\d{16}$/.test(number.replace(/\s/g, ""));
    };

    const validateCVV = (cvv) => {
        return /^\d{3,4}$/.test(cvv);
    };

    const validateExpiryDate = (date) => {
        return /^\d{2}\/\d{2}$/.test(date);
    };

    const validateUPI = (upi) => {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upi);
    };

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === "cardNumber") {
            formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
        } else if (name === "expiryDate") {
            formattedValue = value.replace(/\D/g, "");
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2, 4);
            }
        } else if (name === "cvv") {
            formattedValue = value.replace(/\D/g, "").slice(0, 4);
        }

        setCardDetails({ ...cardDetails, [name]: formattedValue });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (paymentMethod === "card") {
            if (!cardDetails.cardholderName.trim()) {
                newErrors.cardholderName = "Cardholder name is required";
            }
            if (!validateCardNumber(cardDetails.cardNumber)) {
                newErrors.cardNumber = "Card number must be 16 digits";
            }
            if (!validateExpiryDate(cardDetails.expiryDate)) {
                newErrors.expiryDate = "Format: MM/YY";
            }
            if (!validateCVV(cardDetails.cvv)) {
                newErrors.cvv = "CVV must be 3-4 digits";
            }
            if (!cardDetails.billingAddress.trim()) {
                newErrors.billingAddress = "Address is required";
            }
            if (!cardDetails.billingCity.trim()) {
                newErrors.billingCity = "City is required";
            }
            if (!cardDetails.billingZip.trim()) {
                newErrors.billingZip = "Zip code is required";
            }
        } else if (paymentMethod === "upi") {
            if (!validateUPI(upiId)) {
                newErrors.upiId = "Invalid UPI ID format";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onPaymentSubmit({
            method: paymentMethod,
            cardDetails: paymentMethod === "card" ? cardDetails : null,
            upiId: paymentMethod === "upi" ? upiId : null,
        });
    };

    return (
        <div style={styles.container}>
            <h2>💳 Payment Details</h2>

            <div style={styles.methodGroup}>
                <label style={styles.methodLabel}>
                    <input
                        type="radio"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <span>Credit/Debit Card</span>
                </label>
                <label style={styles.methodLabel}>
                    <input
                        type="radio"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <span>UPI</span>
                </label>
                <label style={styles.methodLabel}>
                    <input
                        type="radio"
                        value="wallet"
                        checked={paymentMethod === "wallet"}
                        onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <span>Digital Wallet</span>
                </label>
            </div>

            {paymentMethod === "card" && (
                <form style={styles.form}>
                    <div>
                        <label style={styles.label}>Cardholder Name</label>
                        <input
                            type="text"
                            name="cardholderName"
                            placeholder="John Doe"
                            value={cardDetails.cardholderName}
                            onChange={handleCardChange}
                            style={{ ...styles.input, borderColor: errors.cardholderName ? "#e74c3c" : "#ddd" }}
                        />
                        {errors.cardholderName && <span style={styles.error}>{errors.cardholderName}</span>}
                    </div>

                    <div>
                        <label style={styles.label}>Card Number</label>
                        <input
                            type="text"
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            value={cardDetails.cardNumber}
                            onChange={handleCardChange}
                            style={{ ...styles.input, borderColor: errors.cardNumber ? "#e74c3c" : "#ddd" }}
                        />
                        {errors.cardNumber && <span style={styles.error}>{errors.cardNumber}</span>}
                    </div>

                    <div style={styles.row}>
                        <div>
                            <label style={styles.label}>Expiry Date</label>
                            <input
                                type="text"
                                name="expiryDate"
                                placeholder="MM/YY"
                                maxLength="5"
                                value={cardDetails.expiryDate}
                                onChange={handleCardChange}
                                style={{ ...styles.input, borderColor: errors.expiryDate ? "#e74c3c" : "#ddd" }}
                            />
                            {errors.expiryDate && <span style={styles.error}>{errors.expiryDate}</span>}
                        </div>
                        <div>
                            <label style={styles.label}>CVV</label>
                            <input
                                type="text"
                                name="cvv"
                                placeholder="123"
                                maxLength="4"
                                value={cardDetails.cvv}
                                onChange={handleCardChange}
                                style={{ ...styles.input, borderColor: errors.cvv ? "#e74c3c" : "#ddd" }}
                            />
                            {errors.cvv && <span style={styles.error}>{errors.cvv}</span>}
                        </div>
                    </div>

                    <div>
                        <label style={styles.label}>Billing Address</label>
                        <textarea
                            name="billingAddress"
                            placeholder="123 Main Street"
                            value={cardDetails.billingAddress}
                            onChange={handleCardChange}
                            rows={2}
                            style={{ ...styles.input, borderColor: errors.billingAddress ? "#e74c3c" : "#ddd" }}
                        />
                        {errors.billingAddress && <span style={styles.error}>{errors.billingAddress}</span>}
                    </div>

                    <div style={styles.row}>
                        <div>
                            <label style={styles.label}>City</label>
                            <input
                                type="text"
                                name="billingCity"
                                placeholder="New York"
                                value={cardDetails.billingCity}
                                onChange={handleCardChange}
                                style={{ ...styles.input, borderColor: errors.billingCity ? "#e74c3c" : "#ddd" }}
                            />
                            {errors.billingCity && <span style={styles.error}>{errors.billingCity}</span>}
                        </div>
                        <div>
                            <label style={styles.label}>Zip Code</label>
                            <input
                                type="text"
                                name="billingZip"
                                placeholder="10001"
                                value={cardDetails.billingZip}
                                onChange={handleCardChange}
                                style={{ ...styles.input, borderColor: errors.billingZip ? "#e74c3c" : "#ddd" }}
                            />
                            {errors.billingZip && <span style={styles.error}>{errors.billingZip}</span>}
                        </div>
                    </div>
                </form>
            )}

            {paymentMethod === "upi" && (
                <div style={styles.form}>
                    <label style={styles.label}>UPI ID</label>
                    <input
                        type="text"
                        placeholder="username@bankname"
                        value={upiId}
                        onChange={e => {
                            setUpiId(e.target.value);
                            if (errors.upiId) setErrors({ ...errors, upiId: "" });
                        }}
                        style={{ ...styles.input, borderColor: errors.upiId ? "#e74c3c" : "#ddd" }}
                    />
                    {errors.upiId && <span style={styles.error}>{errors.upiId}</span>}
                </div>
            )}

            {paymentMethod === "wallet" && (
                <div style={styles.form}>
                    <p style={styles.walletInfo}>Select your preferred digital wallet:</p>
                    <div style={styles.walletOptions}>
                        <button style={styles.walletButton}>Google Pay</button>
                        <button style={styles.walletButton}>PayPal</button>
                        <button style={styles.walletButton}>Apple Pay</button>
                    </div>
                </div>
            )}

            <div style={styles.totalContainer}>
                <span>Total Amount:</span>
                <span style={styles.totalAmount}>₹{total}</span>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{ ...styles.submitButton, opacity: isLoading ? 0.6 : 1 }}
            >
                {isLoading ? "Processing..." : "Pay Now"}
            </button>
        </div>
    );
}

const styles = {
    container: {
        background: "#f9f9f9",
        padding: 24,
        borderRadius: 8,
        marginBottom: 24,
    },
    methodGroup: {
        display: "flex",
        gap: 24,
        marginBottom: 24,
    },
    methodLabel: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontSize: 14,
    },
    form: {
        display: "grid",
        gap: 16,
        marginBottom: 24,
    },
    label: {
        display: "block",
        marginBottom: 8,
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    input: {
        width: "100%",
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 4,
        fontSize: 14,
        boxSizing: "border-box",
    },
    row: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
    },
    error: {
        color: "#e74c3c",
        fontSize: 12,
        marginTop: 4,
        display: "block",
    },
    walletInfo: {
        marginBottom: 12,
        color: "#666",
    },
    walletOptions: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
    },
    walletButton: {
        padding: 16,
        background: "#fff",
        border: "2px solid #ddd",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: "bold",
        transition: "all 0.3s",
    },
    totalContainer: {
        display: "flex",
        justifyContent: "space-between",
        padding: 16,
        background: "#fff",
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 16,
        fontWeight: "bold",
    },
    totalAmount: {
        color: "#27ae60",
    },
    submitButton: {
        width: "100%",
        padding: 16,
        background: "#27ae60",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 16,
        fontWeight: "bold",
    },
};

export default Payment;
