import React, { useState } from "react";
import { aiChat, aiChatOpenAI } from "../api";

export default function AIChatbot() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const [useOpenAI, setUseOpenAI] = useState(import.meta.env.VITE_USE_OPENAI === 'true');

    const send = async () => {
        if (!input.trim()) return;
        const userMsg = { from: 'user', text: input };
        setMessages(m => [...m, userMsg]);
        setInput("");
        setLoading(true);
        try {
            const res = useOpenAI ? await aiChatOpenAI(input, messages.filter(m => m.from === 'user' || m.from === 'bot').map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }))) : await aiChat(input);
            const bot = res.data;
            if (bot.type === 'products') {
                setMessages(m => [...m, { from: 'bot', text: bot.text, products: bot.products }]);
            } else {
                // OpenAI returns { answer } while legacy returns { text }
                const text = bot.text || bot.answer || (bot.raw && bot.raw.choices && bot.raw.choices[0] && bot.raw.choices[0].message && bot.raw.choices[0].message.content) || 'Sorry, no reply.';
                setMessages(m => [...m, { from: 'bot', text }]);
            }
        } catch (err) {
            setMessages(m => [...m, { from: 'bot', text: 'Sorry, something went wrong.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, maxWidth: 480 }}>
            <div style={{ height: 240, overflow: 'auto', marginBottom: 8 }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ margin: 6 }}>
                        <div style={{ fontSize: 12, color: m.from === 'user' ? '#333' : '#0066cc' }}>{m.from === 'user' ? 'You' : 'Assistant'}</div>
                        <div style={{ background: m.from === 'user' ? '#f3f3f3' : '#e8f3ff', padding: 8, borderRadius: 4 }}>{m.text}</div>
                        {m.products && m.products.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                {m.products.map(p => (
                                    <div key={p.id} style={{ width: 120, border: '1px solid #eee', padding: 6 }}>
                                        {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: 70, objectFit: 'cover' }} />}
                                        <div style={{ fontSize: 12 }}>{p.name}</div>
                                        <div style={{ color: '#666' }}>₹{p.price}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: '#555' }}>
                    <input type="checkbox" checked={useOpenAI} onChange={e => setUseOpenAI(e.target.checked)} style={{ marginRight: 6 }} /> Use OpenAI
                </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about products, shipping, returns..." style={{ flex: 1 }} />
                <button onClick={send} disabled={loading} style={{ padding: '6px 12px' }}>{loading ? '...' : 'Send'}</button>
            </div>
        </div>
    );
}
