import React, { useEffect, useState } from 'react';
import { aiReturnAssistant, cancelOrder, requestReturn, getOrderRefund } from '../api';
import './AIRefundAssistant.css';

export default function AIRefundAssistant() {
    const [orderId, setOrderId] = useState('');
    const [message, setMessage] = useState('I want to request a return');
    const [response, setResponse] = useState(null);
    const [actionResult, setActionResult] = useState(null);
    const [refundInfo, setRefundInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [useOpenAI, setUseOpenAI] = useState(import.meta.env.VITE_USE_OPENAI === 'true');

    const loadRefundInfo = async (id) => {
        if (!id.trim()) return;
        try {
            const res = await getOrderRefund(id.trim());
            setRefundInfo(res.data.refund || null);
        } catch (err) {
            setRefundInfo(null);
        }
    };

    useEffect(() => {
        if (!orderId.trim()) {
            setRefundInfo(null);
            return;
        }
        loadRefundInfo(orderId);
    }, [orderId]);

    const ask = async (action = null) => {
        if (!orderId.trim()) return;
        setLoading(true);
        setResponse(null);
        setActionResult(null);
        try {
            const res = await aiReturnAssistant(orderId.trim(), message, action, { useOpenAI });
            setResponse(res.data);
        } catch (err) {
            setResponse({ error: err.response?.data?.error || err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelNow = async () => {
        if (!orderId.trim()) return;
        setLoading(true);
        setActionResult(null);
        setResponse(null);
        try {
            const res = await cancelOrder(orderId.trim());
            setActionResult({ type: 'success', message: res.data.message || 'Order cancelled successfully.' });
            await loadRefundInfo(orderId.trim());
        } catch (err) {
            setActionResult({ type: 'error', message: err.response?.data?.error || err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleReturnNow = async () => {
        if (!orderId.trim()) return;
        setLoading(true);
        setActionResult(null);
        setResponse(null);
        try {
            const res = await requestReturn(orderId.trim(), {
                reason: message || 'Customer requested return',
                condition: 'Good',
            });
            setActionResult({ type: 'success', message: res.data.message || 'Return request submitted.' });
            await loadRefundInfo(orderId.trim());
        } catch (err) {
            setActionResult({ type: 'error', message: err.response?.data?.error || err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-refund-assistant">
            <h4 className="ai-refund-assistant__heading">AI Return & Refund Assistant</h4>

            <div className="ai-refund-assistant__row">
                <input
                    className="ai-refund-assistant__input"
                    placeholder="Enter Order ID"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                />
                <button onClick={() => setOrderId('')} className="ai-refund-assistant__secondary-button">Clear</button>
            </div>

            <div className="ai-refund-assistant__field">
                <input
                    className="ai-refund-assistant__input"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />
            </div>

            <div className="ai-refund-assistant__actions">
                <label className="ai-refund-assistant__checkbox">
                    <input type="checkbox" checked={useOpenAI} onChange={e => setUseOpenAI(e.target.checked)} />
                    Use OpenAI
                </label>
                <button onClick={() => ask(null)} disabled={loading || !orderId} className="ai-refund-assistant__button">{loading ? '...' : 'Check Eligibility'}</button>
                <button onClick={() => { setMessage('Please cancel my order'); ask('confirm_cancel'); }} disabled={loading || !orderId} className="ai-refund-assistant__button">Cancel Order</button>
                <button onClick={() => { setMessage('I want to return this item'); ask('request_return'); }} disabled={loading || !orderId} className="ai-refund-assistant__button">Request Return</button>
                <button onClick={handleCancelNow} disabled={loading || !orderId} className="ai-refund-assistant__button">Cancel Now</button>
                <button onClick={handleReturnNow} disabled={loading || !orderId} className="ai-refund-assistant__button">Submit Return</button>
            </div>

            <div>
                {actionResult && (
                    <div className="ai-refund-assistant__status-message" style={{ color: actionResult.type === 'error' ? '#b12020' : '#1d5e20' }}>{actionResult.message}</div>
                )}
                {response && response.error && <div className="ai-refund-assistant__status-message" style={{ color: '#b12020' }}>{response.error}</div>}
                {response && response.summary && (
                    <div className="ai-refund-assistant__response-card">
                        <div className="ai-refund-assistant__summary-text">{response.summary}</div>
                        {response.cancelEligible !== undefined && (
                            <div className="ai-refund-assistant__metadata">
                                <div>Cancelable: <strong>{response.cancelEligible ? 'Yes' : 'No'}</strong></div>
                                <div>Returnable: <strong>{response.returnEligible ? 'Yes' : 'No'}</strong></div>
                                <div>Refund estimate: <strong>₹{response.refundEstimate}</strong></div>
                            </div>
                        )}
                        {refundInfo && (
                            <div className="ai-refund-assistant__metadata">
                                <div><strong>Refund status:</strong> {refundInfo.status || 'none'}</div>
                                {refundInfo.amount ? <div>Amount: ₹{refundInfo.amount}</div> : null}
                                {refundInfo.expectedDate ? <div>Expected: {new Date(refundInfo.expectedDate).toLocaleDateString()}</div> : null}
                            </div>
                        )}
                        {response.order && (
                            <details className="ai-refund-assistant__details">
                                <summary>Order details</summary>
                                <pre className="ai-refund-assistant__pre">{JSON.stringify(response.order, null, 2)}</pre>
                            </details>
                        )}
                        {response.answer && (
                            <div className="ai-refund-assistant__answer-box">{response.answer}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
