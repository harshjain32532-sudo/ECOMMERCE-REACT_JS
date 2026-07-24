import React, { useState, useEffect } from 'react';
import './PaymentManagement.css';

const PaymentManagement = () => {
    const [activeTab, setActiveTab] = useState('methods');
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [wallet, setWallet] = useState({ balance: 0 });
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [paymentForm, setPaymentForm] = useState({});

    useEffect(() => {
        loadPaymentData();
    }, [activeTab]);

    const loadPaymentData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'methods') {
                const res = await fetch('/api/payment/payment-methods');
                const data = await res.json();
                setPaymentMethods(data.paymentMethods || []);
            } else if (activeTab === 'wallet') {
                const res = await fetch('/api/payment/wallet');
                const data = await res.json();
                setWallet(data.wallet || {});
            } else if (activeTab === 'history') {
                const res = await fetch('/api/payment/payment-history');
                const data = await res.json();
                setPaymentHistory(data.payments || []);
            }
        } catch (error) {
            console.error('Error loading payment data:', error);
        }
        setLoading(false);
    };

    const handleAddPaymentMethod = async () => {
        try {
            const res = await fetch('/api/payment/payment-methods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentForm)
            });
            if (res.ok) {
                setShowAddPayment(false);
                setPaymentForm({});
                loadPaymentData();
            }
        } catch (error) {
            console.error('Error adding payment method:', error);
        }
    };

    return (
        <div className="payment-management">
            <div className="payment-header">
                <h1>💳 Payment Management</h1>
            </div>

            <div className="payment-tabs">
                <button
                    className={`tab-btn ${activeTab === 'methods' ? 'active' : ''}`}
                    onClick={() => setActiveTab('methods')}
                >
                    Payment Methods
                </button>
                <button
                    className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wallet')}
                >
                    💰 Wallet
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    📋 History
                </button>
            </div>

            <div className="payment-content">
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        {activeTab === 'methods' && (
                            <div className="payment-methods-section">
                                <div className="section-header">
                                    <h2>Your Payment Methods</h2>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowAddPayment(true)}
                                    >
                                        + Add New Payment Method
                                    </button>
                                </div>

                                {paymentMethods.length === 0 ? (
                                    <div className="empty-state">
                                        <p>No payment methods added yet</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowAddPayment(true)}
                                        >
                                            Add Payment Method
                                        </button>
                                    </div>
                                ) : (
                                    <div className="methods-grid">
                                        {paymentMethods.map((method, idx) => (
                                            <div key={idx} className={`payment-card method-${method.type}`}>
                                                <div className="card-header">
                                                    <span className="card-type">
                                                        {method.type === 'credit_card' && '💳 Credit Card'}
                                                        {method.type === 'debit_card' && '🏦 Debit Card'}
                                                        {method.type === 'upi' && '📱 UPI'}
                                                        {method.type === 'wallet' && '💰 Wallet'}
                                                    </span>
                                                    {method.isDefault && (
                                                        <span className="default-badge">Default</span>
                                                    )}
                                                </div>

                                                {method.type === 'credit_card' || method.type === 'debit_card' ? (
                                                    <div className="card-details">
                                                        <p className="card-number">
                                                            {method.cardNumber} • {method.cardBrand}
                                                        </p>
                                                        <p className="cardholder">{method.cardholderName}</p>
                                                        <p className="expiry">
                                                            Expires: {method.expiryMonth}/{method.expiryYear}
                                                        </p>
                                                    </div>
                                                ) : method.type === 'upi' ? (
                                                    <div className="upi-details">
                                                        <p className="upi-id">{method.upiId}</p>
                                                    </div>
                                                ) : (
                                                    <div className="wallet-details">
                                                        <p className="wallet-balance">
                                                            Balance: ₹{method.walletBalance}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="card-actions">
                                                    {!method.isDefault && (
                                                        <button className="btn btn-sm btn-secondary">
                                                            Make Default
                                                        </button>
                                                    )}
                                                    <button className="btn btn-sm btn-danger">
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'wallet' && (
                            <div className="wallet-section">
                                <div className="wallet-balance-card">
                                    <h2>Wallet Balance</h2>
                                    <p className="balance-amount">₹{wallet.balance?.toLocaleString()}</p>
                                    <p className="wallet-currency">Indian Rupees (INR)</p>
                                </div>

                                <div className="wallet-actions">
                                    <button className="btn btn-primary">+ Add Money to Wallet</button>
                                    <button className="btn btn-secondary">Withdraw Money</button>
                                </div>

                                {wallet.transactions && wallet.transactions.length > 0 && (
                                    <div className="wallet-transactions">
                                        <h3>Recent Transactions</h3>
                                        {wallet.transactions.map((txn, idx) => (
                                            <div key={idx} className="transaction-item">
                                                <div className="txn-info">
                                                    <p className="txn-description">{txn.description}</p>
                                                    <p className="txn-date">
                                                        {new Date(txn.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className={`txn-amount txn-${txn.type}`}>
                                                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="payment-history-section">
                                <h2>Payment History</h2>
                                {paymentHistory.length === 0 ? (
                                    <div className="empty-state">
                                        <p>No payment history</p>
                                    </div>
                                ) : (
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Order ID</th>
                                                <th>Amount</th>
                                                <th>Payment Method</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paymentHistory.map((payment, idx) => (
                                                <tr key={idx}>
                                                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                                                    <td className="order-id">#{payment.orderId}</td>
                                                    <td className="amount">₹{payment.amount}</td>
                                                    <td>{payment.paymentMethod}</td>
                                                    <td>
                                                        <span className={`status status-${payment.status}`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-sm btn-secondary">View</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Payment Method Modal */}
            {showAddPayment && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add Payment Method</h2>

                        <div className="payment-type-selector">
                            <button
                                className={`type-btn ${paymentForm.type === 'card' ? 'active' : ''}`}
                                onClick={() => setPaymentForm({ ...paymentForm, type: 'card' })}
                            >
                                💳 Card
                            </button>
                            <button
                                className={`type-btn ${paymentForm.type === 'upi' ? 'active' : ''}`}
                                onClick={() => setPaymentForm({ ...paymentForm, type: 'upi' })}
                            >
                                📱 UPI
                            </button>
                            <button
                                className={`type-btn ${paymentForm.type === 'wallet' ? 'active' : ''}`}
                                onClick={() => setPaymentForm({ ...paymentForm, type: 'wallet' })}
                            >
                                💰 Wallet
                            </button>
                        </div>

                        <form className="payment-form">
                            {paymentForm.type === 'card' && (
                                <>
                                    <input placeholder="Cardholder Name" />
                                    <input placeholder="Card Number" />
                                    <div className="form-row">
                                        <input placeholder="MM" style={{ width: '40%' }} />
                                        <input placeholder="YY" style={{ width: '40%' }} />
                                        <input placeholder="CVV" style={{ width: '20%' }} />
                                    </div>
                                </>
                            )}

                            {paymentForm.type === 'upi' && (
                                <input placeholder="UPI ID (username@bank)" />
                            )}

                            {paymentForm.type === 'wallet' && (
                                <input type="number" placeholder="Initial Balance" />
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAddPayment(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAddPaymentMethod}
                                >
                                    Add Payment Method
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;
