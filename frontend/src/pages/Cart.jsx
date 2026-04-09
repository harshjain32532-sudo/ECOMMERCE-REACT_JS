import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../api.js";
import Payment from "../components/Payment.jsx";

function Cart({ cart, removeFromCart, updateQuantity }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showPayment, setShowPayment] = useState(false);
    const navigate = useNavigate();

    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    const handleCheckout = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        if (cart.length === 0) {
            setMessage("Cart is empty");
            return;
        }

        setShowPayment(true);
    };

    const handlePaymentSubmit = async (paymentData) => {
        setLoading(true);
        try {
            await createOrder({
                items: cart,
                total: total,
                payment: paymentData,
            });
            setMessage("Order placed successfully! 🎉");
            setTimeout(() => {
                localStorage.removeItem("cart");
                navigate("/orders");
                window.location.reload();
            }, 2000);
        } catch (err) {
            setMessage("Failed to place order: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1>🛒 Shopping Cart</h1>

            {message && <div style={styles.message}>{message}</div>}

            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : showPayment ? (
                <Payment
                    total={total}
                    onPaymentSubmit={handlePaymentSubmit}
                    isLoading={loading}
                />
            ) : (
                <div style={styles.content}>
                    <div style={styles.items}>
                        {cart.map(p => (
                            <div key={p._id} style={styles.cartItem}>
                                {p.image && (
                                    <img src={p.image} alt={p.name} style={styles.image} />
                                )}
                                <div style={styles.details}>
                                    <h3>{p.name}</h3>
                                    <p>₹{p.price}</p>
                                    <div style={styles.quantity}>
                                        <button
                                            onClick={() => updateQuantity(p._id, (p.quantity || 1) - 1)}
                                            style={styles.smallButton}
                                        >
                                            -
                                        </button>
                                        <span>{p.quantity || 1}</span>
                                        <button
                                            onClick={() => updateQuantity(p._id, (p.quantity || 1) + 1)}
                                            style={styles.smallButton}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p>Subtotal: ₹{p.price * (p.quantity || 1)}</p>
                                </div>
                                <button
                                    onClick={() => removeFromCart(p._id)}
                                    style={styles.removeButton}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={styles.summary}>
                        <h2>Order Summary</h2>
                        <div style={styles.summaryRow}>
                            <span>Items ({cart.length})</span>
                            <span>₹{total}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div style={styles.summaryTotal}>
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            style={{
                                ...styles.checkoutButton,
                                opacity: loading ? 0.6 : 1,
                            }}
                        >
                            {loading ? "Processing..." : "Proceed to Payment"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: 20,
    },
    message: {
        padding: 12,
        marginBottom: 16,
        borderRadius: 4,
        background: "#d4edda",
        color: "#155724",
    },
    content: {
        display: "grid",
        gridTemplateColumns: "1fr 350px",
        gap: 24,
        marginTop: 20,
    },
    items: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },
    cartItem: {
        display: "flex",
        gap: 16,
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 8,
        alignItems: "flex-start",
    },
    image: {
        width: 100,
        height: 100,
        objectFit: "cover",
        borderRadius: 4,
    },
    details: {
        flex: 1,
    },
    quantity: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        margin: "8px 0",
    },
    smallButton: {
        width: 30,
        height: 30,
        border: "1px solid #ddd",
        borderRadius: 4,
        cursor: "pointer",
    },
    removeButton: {
        padding: "8px 12px",
        background: "#e74c3c",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
    },
    summary: {
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 20,
        height: "fit-content",
        top: 20,
        position: "sticky",
    },
    summaryRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 12,
        fontSize: 14,
    },
    summaryTotal: {
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderTop: "2px solid #ddd",
        borderBottom: "2px solid #ddd",
        marginBottom: 16,
        fontWeight: "bold",
        fontSize: 16,
    },
    checkoutButton: {
        width: "100%",
        padding: 12,
        background: "#27ae60",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 16,
        fontWeight: "bold",
    },
};

export default Cart;
