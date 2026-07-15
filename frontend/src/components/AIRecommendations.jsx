import React, { useEffect, useState } from "react";
import { aiGetRecommendations } from "../api";

export default function AIRecommendations() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        aiGetRecommendations()
            .then(res => { if (mounted) setData(res.data); })
            .catch(() => { })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    if (loading) return <div>Loading recommendations...</div>;
    if (!data) return <div>No recommendations available.</div>;

    return (
        <div className="ai-recommendations">
            <h3>AI Recommendations</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {(data.similar || data.trending || data.browsing || []).slice(0, 6).map(p => (
                    <div key={p._id || p.productId} style={{ width: 160, border: '1px solid #eee', padding: 8 }}>
                        {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: 100, objectFit: 'cover' }} />}
                        <div style={{ fontSize: 14, marginTop: 6 }}>{p.name}</div>
                        <div style={{ color: '#888' }}>₹{p.price}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
