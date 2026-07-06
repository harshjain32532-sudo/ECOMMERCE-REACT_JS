import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Cart.css";

function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartItems(cart);
        calculateSubtotal(cart);
    }, []);

    const calculateSubtotal = (items) => {
        const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        setSubtotal(total);
    };

    const removeItem = (productId) => {
        const updatedCart = cartItems.filter(item => item._id !== productId);
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        calculateSubtotal(updatedCart);
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeItem(productId);
            return;
        }
        const updatedCart = cartItems.map(item =>
            item._id === productId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        calculateSubtotal(updatedCart);
    };

    const handleCheckout = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to continue with checkout");
            navigate("/login");
            return;
        }
        navigate("/checkout");
    };

    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping;

    if (cartItems.length === 0) {
        return (
            <div className="cart-container">
                <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <h2>Your Cart is Empty</h2>
                    <p>Add some products to get started!</p>
                    <Link to="/" className="btn-continue-shopping">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h1 className="cart-title">Shopping Cart</h1>

            <div className="cart-layout">
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div key={item._id} className="cart-item">
                            <img src={item.image} alt={item.name} className="cart-item-image" />

                            <div className="cart-item-details">
                                <h3>{item.name}</h3>
                                <p className="item-sku">SKU: {item._id.substring(0, 8)}</p>
                                <p className="item-price">₹{item.price.toLocaleString()}</p>
                            </div>

                            <div className="quantity-control">
                                <button onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}>−</button>
                                <input
                                    type="number"
                                    value={item.quantity || 1}
                                    onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                                    min="1"
                                />
                                <button onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}>+</button>
                            </div>

                            <div className="item-total">
                                ₹{((item.price) * (item.quantity || 1)).toLocaleString()}
                            </div>

                            <button
                                className="btn-remove"
                                onClick={() => removeItem(item._id)}
                                title="Remove item"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h2>Order Summary</h2>

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

                    {shipping === 0 && (
                        <p className="shipping-info">Free shipping on orders above ₹500!</p>
                    )}

                    <div className="summary-row total">
                        <span>Total</span>
                        <span>₹{total.toLocaleString()}</span>
                    </div>

                    <button className="btn-checkout" onClick={handleCheckout}>
                        Proceed to Checkout
                    </button>

                    <Link to="/" className="btn-continue-shopping-link">
                        ← Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Cart;
