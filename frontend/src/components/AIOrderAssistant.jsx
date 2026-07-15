import React, { useState } from 'react';
import { aiOrderAssistant } from '../api';

export default function AIOrderAssistant() {
    const [orderId, setOrderId] = useState('');
    const [question, setQuestion] = useState('What is the status of my order?');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const ask = async () => {
        if (!orderId.trim()) return;
        setLoading(true);
        setResponse(null);
        try {
            const res = await aiOrderAssistant(orderId.trim(), question);
            setResponse(res.data);
        } catch (err) {
            setResponse({ error: err.response?.data?.error || err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 6, maxWidth: 640 }}>
            <h4>AI Order Tracking Assistant</h4>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input placeholder="Enter Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} style={{ flex: 1 }} />
                <button onClick={() => setOrderId('')} style={{ padding: '6px 10px' }}>Clear</button>
            </div>
            <div style={{ marginBottom: 8 }}>
                <input value={question} onChange={e => setQuestion(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={ask} disabled={loading || !orderId} style={{ padding: '6px 12px' }}>{loading ? '...' : 'Ask'}</button>
                <button onClick={() => { setQuestion('Where is my order?'); }} style={{ padding: '6px 12px' }}>Where is my order?</button>
                <button onClick={() => { setQuestion('Can I cancel this order?'); }} style={{ padding: '6px 12px' }}>Cancellation</button>
            </div>

            <div>
                {response && response.error && <div style={{ color: 'red' }}>{response.error}</div>}
                {response && response.summary && (
                    <div style={{ background: '#f7f7f7', padding: 10, borderRadius: 6 }}>
                        <div style={{ marginBottom: 8 }}>{response.summary}</div>
                        {response.order && (
                            <details>
                                <summary>Order details</summary>
                                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(response.order, null, 2)}</pre>
                            </details>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
