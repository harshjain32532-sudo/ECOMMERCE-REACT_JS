import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Payment from "../components/Payment.jsx";
import ShoppingAddress from "../components/ShoppingAddress.jsx";
import "../styles/Checkout.css";

function Checkout() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [step, setStep] = useState(1); // 1: Address, 2: Payment
    const [shippingAddress, setShippingAddress] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        if (cart.length === 0) {
            navigate("/cart");
            return;
        }
        setCartItems(cart);
        calculateSubtotal(cart);
    }, [navigate]);

    const calculateSubtotal = (items) => {
        const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        setSubtotal(total);
    };

    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping;

    const handleAddressSubmit = (address) => {
        setShippingAddress(address);
        setStep(2);
    };

    const handlePaymentSubmit = async (paymentData) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const orderData = {
                items: cartItems,
                shippingAddress,
                paymentMethod: paymentData.method,
                paymentDetails: paymentData.details,
                total,
                subtotal,
                tax,
                shipping,
            };

            const response = await fetch("http://localhost:5000/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                throw new Error("Order creation failed");
            }

            const result = await response.json();

            // Clear cart
            localStorage.setItem("cart", JSON.stringify([]));

            // Redirect to orders page
            navigate("/orders");
            alert("✅ Order placed successfully!");
        } catch (error) {
            console.error("Payment error:", error);
            alert("❌ Payment failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="checkout-container">
            <h1 className="checkout-title">Checkout</h1>

            {/* Step Indicator */}
            <div className="checkout-steps">
                <div className={`step ${step >= 1 ? "active" : ""}`}>
                    <div className="step-number">1</div>
                    <div className="step-label">Address</div>
                </div>
                <div className={`step ${step >= 2 ? "active" : ""}`}>
                    <div className="step-number">2</div>
                    <div className="step-label">Payment</div>
                </div>
            </div>

            <div className="checkout-layout">
                {/* Main Content */}
                <div className="checkout-main">
                    {step === 1 && (
                        <ShoppingAddress
                            onAddAddress={handleAddressSubmit}
                            addresses={shippingAddress ? [shippingAddress] : []}
                        />
                    )}
                    {step === 2 && (
                        <Payment
                            onPaymentSubmit={handlePaymentSubmit}
                            total={total}
                            isLoading={isLoading}
                        />
                    )}
                </div>

                {/* Order Summary Sidebar */}
                <div className="checkout-summary">
                    <h2>Order Summary</h2>

                    <div className="summary-items">
                        {cartItems.map((item) => (
                            <div key={item._id} className="summary-item">
                                <div className="item-info">
                                    <p className="item-name">{item.name}</p>
                                    <p className="item-qty">Qty: {item.quantity || 1}</p>
                                </div>
                                <p className="item-price">
                                    ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="summary-row">
                        <span>Tax (18%)</span>
                        <span>₹{tax.toLocaleString()}</span>
                    </div>

                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>
                            {shipping === 0 ? (
                                <span className="free-shipping">FREE</span>
                            ) : (
                                `₹${shipping.toLocaleString()}`
                            )}
                        </span>
                    </div>

                    <div className="summary-row total">
                        <span>Total</span>
                        <span>₹{total.toLocaleString()}</span>
                    </div>

                    {step === 1 && (
                        <button
                            className="btn-continue"
                            onClick={() => {
                                if (shippingAddress) {
                                    setStep(2);
                                } else {
                                    alert("Please fill in your address details");
                                }
                            }}
                        >
                            Continue to Payment →
                        </button>
                    )}

                    {step === 2 && (
                        <button
                            className="btn-back"
                            onClick={() => setStep(1)}
                        >
                            ← Back to Address
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Checkout;
