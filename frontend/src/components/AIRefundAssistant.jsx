import React, { useState } from 'react';
import { aiReturnAssistant } from '../api';

export default function AIRefundAssistant() {
    const [orderId, setOrderId] = useState('');
    const [message, setMessage] = useState('I want to request a return');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [useOpenAI, setUseOpenAI] = useState(import.meta.env.VITE_USE_OPENAI === 'true');

    const ask = async (action = null) => {
        if (!orderId.trim()) return;
        setLoading(true);
        setResponse(null);
        try {
            const res = await aiReturnAssistant(orderId.trim(), message, action, { useOpenAI });
            setResponse(res.data);
        } catch (err) {
            setResponse({ error: err.response?.data?.error || err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 6, maxWidth: 720 }}>
            <h4>AI Return & Refund Assistant</h4>

            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input placeholder="Enter Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} style={{ flex: 1 }} />
                <button onClick={() => setOrderId('')} style={{ padding: '6px 10px' }}>Clear</button>
            </div>

            <div style={{ marginBottom: 8 }}>
                <input value={message} onChange={e => setMessage(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" checked={useOpenAI} onChange={e => setUseOpenAI(e.target.checked)} /> Use OpenAI
                </label>
                <button onClick={() => ask(null)} disabled={loading || !orderId} style={{ padding: '6px 12px' }}>{loading ? '...' : 'Check Eligibility'}</button>
                <button onClick={() => { setMessage('Please cancel my order'); ask('confirm_cancel'); }} disabled={loading || !orderId} style={{ padding: '6px 12px' }}>Cancel Order</button>
                <button onClick={() => { setMessage('I want to return this item'); ask('request_return'); }} disabled={loading || !orderId} style={{ padding: '6px 12px' }}>Request Return</button>
            </div>

            <div>
                {response && response.error && <div style={{ color: 'red' }}>{response.error}</div>}
                {response && response.summary && (
                    <div style={{ background: '#f7f7f7', padding: 10, borderRadius: 6 }}>
                        <div style={{ marginBottom: 8 }}>{response.summary}</div>
                        {response.cancelEligible !== undefined && (
                            <div style={{ fontSize: 13, color: '#444' }}>
                                <div>Cancelable: {response.cancelEligible ? 'Yes' : 'No'}</div>
                                <div>Returnable: {response.returnEligible ? 'Yes' : 'No'}</div>
                                <div>Refund estimate: ₹{response.refundEstimate}</div>
                            </div>
                        )}
                        {response.order && (
                            <details>
                                <summary>Order details</summary>
                                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(response.order, null, 2)}</pre>
                            </details>
                        )}
                        {response.answer && (
                            <div style={{ marginTop: 8, background: '#fff', padding: 8, borderRadius: 4 }}>{response.answer}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
