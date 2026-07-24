import React, { useState } from 'react';
import { aiImageSearch, aiSearchAdvanced } from '../api';

export default function AIImageSearch() {
    const [file, setFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');

    const upload = async () => {
        if (!file) return;
        setLoading(true);
        setResults(null);
        try {
            const res = await aiImageSearch(file);
            setResults(res.data);
        } catch (err) {
            setResults({ error: err.response?.data?.error || err.message });
        } finally {
            setLoading(false);
        }
    };

    const searchNL = async () => {
        if (!query.trim()) return;
        setLoading(true); setResults(null);
        try {
            const res = await aiSearchAdvanced(query, { typo: true, useOpenAI: true });
            setResults(res.data);
        } catch (err) {
            setResults({ error: err.response?.data?.error || err.message });
        } finally { setLoading(false); }
    };

    return (
        <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 6, maxWidth: 720 }}>
            <h4>AI Image & Natural Language Search</h4>

            <div style={{ marginBottom: 8 }}>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files && e.target.files[0])} />
                <button onClick={upload} disabled={!file || loading} style={{ marginLeft: 8 }}>{loading ? '...' : 'Search by image'}</button>
            </div>

            <div style={{ margin: '8px 0' }}>
                <input placeholder="Try voice-style search: 'show me budget headphones under 3000'" value={query} onChange={e => setQuery(e.target.value)} style={{ width: '80%' }} />
                <button onClick={searchNL} disabled={!query || loading} style={{ marginLeft: 8 }}>{loading ? '...' : 'Search (NL)'}</button>
            </div>

            <div>
                {results && results.error && <div style={{ color: 'red' }}>{results.error}</div>}
                {results && results.products && (
                    <div style={{ marginBottom: 8, padding: 10, background: '#f8f7f3', borderRadius: 8 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{results.insight || results.aiHints?.summary || 'AI insight ready'}</div>
                        <div style={{ color: '#77614c', fontSize: 13 }}>{results.aiHints?.reviewSummary || 'Review-focused summary will appear here.'}</div>
                    </div>
                )}
                {results && Array.isArray(results) && (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {results.map(p => (
                            <div key={p._id || p.productId} style={{ width: 160, border: '1px solid #eee', padding: 8 }}>
                                {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: 100, objectFit: 'cover' }} />}
                                <div style={{ fontSize: 14 }}>{p.name}</div>
                                <div style={{ color: '#888' }}>₹{p.price}</div>
                                {p._similarity !== undefined && <div style={{ fontSize: 12 }}>sim: {p._similarity}</div>}
                                {p._score !== undefined && <div style={{ fontSize: 12 }}>score: {Math.round(p._score * 100) / 100}</div>}
                            </div>
                        ))}
                    </div>
                )}
                {results && results.products && (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                        {results.products.map((p) => (
                            <div key={p._id || p.productId} style={{ width: 160, border: '1px solid #eee', padding: 8 }}>
                                {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: 100, objectFit: 'cover' }} />}
                                <div style={{ fontSize: 14 }}>{p.name}</div>
                                <div style={{ color: '#888' }}>₹{p.price}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
