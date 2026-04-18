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
        minHeight: "100vh",
        animation: "fadeIn 0.6s ease",
    },
    message: {
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
        background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
        color: "#155724",
        border: "2px solid #28a745",
        animation: "slideInDown 0.4s ease",
        fontWeight: 500,
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
        padding: 18,
        border: "2px solid #e0e0e0",
        borderRadius: 12,
        alignItems: "flex-start",
        background: "white",
        box- shadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    animation: "fadeIn 0.5s ease",
},
    image: {
        width: 100,
        height: 100,
        objectFit: "cover",
        borderRadius: 10,
        background: "#f2f4ff",
        transition: "transform 0.3s ease",
    },
    details: {
        flex: 1,
    },
    quantity: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        margin: "8px 0",
        background: "#f5f5f5",
        borderRadius: 8,
        padding: "8px 4px",
        width: "fit-content",
    },
    smallButton: {
        width: 36,
        height: 36,
        border: "2px solid #ddd",
        borderRadius: 6,
        background: "white",
        cursor: "pointer",
        fontSize: 16,
        fontWeight: "bold",
        transition: "all 0.2s ease",
        color: "#2575fc",
    },
    removeButton: {
        padding: "10px 16px",
        background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(231, 76, 60, 0.2)",
    },
    summary: {
        border: "2px solid #e0e0e0",
        borderRadius: 12,
        padding: 24,
        height: "fit-content",
        top: 80,
        position: "sticky",
        background: "white",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
        animation: "slideInRight 0.6s ease 0.2s both",
    },
    summaryRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 14,
        fontSize: 14,
        color: "#666",
        transition: "all 0.3s ease",
    },
    summaryTotal: {
        display: "flex",
        justifyContent: "space-between",
        padding: "14px 0",
        borderTop: "2px solid #e0e0e0",
        borderBottom: "2px solid #e0e0e0",
        marginBottom: 16,
        fontWeight: "bold",
        fontSize: 18,
        color: "#2c3e50",
    },
    checkoutButton: {
        width: "100%",
        padding: 14,
        background: "linear-gradient(135deg, #27ae60 0%, #229954 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontSize: 16,
        fontWeight: "bold",
        transition: "all 0.3s ease",
        boxShadow: "0 8px 16px rgba(39, 174, 96, 0.3)",
    },
};

export default Cart;
