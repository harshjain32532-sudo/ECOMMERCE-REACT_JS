import { useEffect, useState } from "react";
import AIRecommendations from "./AIRecommendations.jsx";
import AIChatbot from "./AIChatbot.jsx";
import AIImageSearch from "./AIImageSearch.jsx";
import AIOrderAssistant from "./AIOrderAssistant.jsx";

export default function AIAssistantHub() {
    const [insights, setInsights] = useState({
        sales: null,
        inventory: null,
        fraud: null,
        pricing: null,
        behavior: null,
        tags: null,
    });
    const [contentState, setContentState] = useState({
        description: "",
        email: null,
        bundle: null,
    });
    const [form, setForm] = useState({
        productName: "Aurora Smart Lamp",
        category: "Home",
        features: "Ambient glow, app control, voice assistant",
        segment: "repeat",
        bundleProducts: "Wireless Headphones, Portable Charger",
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const load = async () => {
            try {
                const [salesRes, inventoryRes, fraudRes, pricingRes, behaviorRes, tagsRes] = await Promise.all([
                    fetch("http://localhost:5000/ai/sales-predict?days=7", { headers }),
                    fetch("http://localhost:5000/ai/inventory-forecast?days=30", { headers }),
                    fetch("http://localhost:5000/ai/fraud-detection", { headers }),
                    fetch("http://localhost:5000/ai/dynamic-pricing", { headers }),
                    fetch("http://localhost:5000/ai/customer-behavior", { headers }),
                    fetch("http://localhost:5000/ai/smart-tags?apply=false", { headers }),
                ]);

                const [sales, inventory, fraud, pricing, behavior, tags] = await Promise.all([
                    salesRes.json().catch(() => null),
                    inventoryRes.json().catch(() => null),
                    fraudRes.json().catch(() => null),
                    pricingRes.json().catch(() => null),
                    behaviorRes.json().catch(() => null),
                    tagsRes.json().catch(() => null),
                ]);

                setInsights({ sales, inventory, fraud, pricing, behavior, tags });
            } catch (error) {
                console.error("Failed to load AI insights", error);
            }
        };

        load();
    }, []);

    const generateContent = async (type) => {
        const token = localStorage.getItem("token");
        const headers = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        try {
            if (type === "description") {
                const res = await fetch("http://localhost:5000/ai/product-description", {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        productName: form.productName,
                        category: form.category,
                        features: form.features.split(",").map((item) => item.trim()).filter(Boolean),
                    }),
                });
                const data = await res.json();
                setContentState((prev) => ({ ...prev, description: data.generatedDescription || "" }));
            }

            if (type === "email") {
                const res = await fetch("http://localhost:5000/ai/email-recommendations", {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        customerSegment: form.segment,
                        products: form.bundleProducts.split(",").map((item) => ({ name: item.trim() })).filter(Boolean),
                    }),
                });
                const data = await res.json();
                setContentState((prev) => ({ ...prev, email: data }));
            }

            if (type === "bundle") {
                const res = await fetch("http://localhost:5000/ai/frequently-bought-together", {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        productId: form.productName,
                        products: form.bundleProducts.split(",").map((item) => ({ name: item.trim() })).filter(Boolean),
                    }),
                });
                const data = await res.json();
                setContentState((prev) => ({ ...prev, bundle: data }));
            }
        } catch (error) {
            console.error("Failed to generate AI content", error);
        }
    };

    const insightCards = [
        {
            title: "AI Sales Prediction",
            value: insights.sales?.projectedRevenue ? `₹${insights.sales.projectedRevenue.toLocaleString()}` : "Live forecast",
            detail: insights.sales?.confidence ? `${insights.sales.confidence} confidence` : "Projected next-week revenue",
        },
        {
            title: "AI Inventory Forecasting",
            value: insights.inventory?.summary?.reordersNeeded ? `${insights.inventory.summary.reordersNeeded} reorder(s)` : "Balanced",
            detail: insights.inventory?.summary?.productsAnalyzed ? `${insights.inventory.summary.productsAnalyzed} products analyzed` : "Demand-driven restock planning",
        },
        {
            title: "AI Fraud Detection",
            value: insights.fraud?.summary?.suspiciousOrders ? `${insights.fraud.summary.suspiciousOrders} alerts` : "Clear",
            detail: insights.fraud?.summary?.highestRisk ? `Highest risk: ${insights.fraud.summary.highestRisk.riskScore}%` : "Risk scoring for orders",
        },
        {
            title: "AI Dynamic Pricing",
            value: insights.pricing?.summary?.priceActions ? `${insights.pricing.summary.priceActions} suggestions` : "No action",
            detail: insights.pricing?.suggestions?.[0]?.reason || "Real-time price tuning suggestions",
        },
        {
            title: "AI Customer Behavior Analysis",
            value: insights.behavior?.summary?.repeatCustomers ? `${insights.behavior.summary.repeatCustomers} repeat buyers` : "Insights",
            detail: insights.behavior?.summary?.atRiskCustomers ? `${insights.behavior.summary.atRiskCustomers} at-risk customers` : "Customer journey segmentation",
        },
        {
            title: "AI Smart Product Tags",
            value: insights.tags?.summary?.productsAnalyzed ? `${insights.tags.summary.productsAnalyzed} products` : "Ready",
            detail: insights.tags?.summary?.applied ? "Tags applied to catalog" : "Tag suggestions generated",
        },
    ];

    return (
        <div style={styles.page}>
            <div style={styles.hero}>
                <div style={styles.badge}>AI Commerce Suite</div>
                <h1 style={styles.title}>Smart shopping experiences powered by AI</h1>
                <p style={styles.subtitle}>Get personalized recommendations, 24/7 support, image-based discovery, voice-friendly search, review summaries, and a tailored home experience.</p>
            </div>

            <div style={styles.insightGrid}>
                {insightCards.map((card) => (
                    <div key={card.title} style={styles.insightCard}>
                        <div style={styles.insightTitle}>{card.title}</div>
                        <div style={styles.insightValue}>{card.value}</div>
                        <div style={styles.insightDetail}>{card.detail}</div>
                    </div>
                ))}
            </div>

            <div style={styles.toolsGrid}>
                <section style={styles.toolCard}>
                    <h3 style={styles.toolTitle}>AI Product Description Generator</h3>
                    <input value={form.productName} onChange={(e) => setForm((prev) => ({ ...prev, productName: e.target.value }))} style={styles.input} placeholder="Product name" />
                    <input value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} style={styles.input} placeholder="Category" />
                    <input value={form.features} onChange={(e) => setForm((prev) => ({ ...prev, features: e.target.value }))} style={styles.input} placeholder="Features (comma separated)" />
                    <button style={styles.actionButton} onClick={() => generateContent("description")}>Generate Description</button>
                    {contentState.description ? <p style={styles.toolText}>{contentState.description}</p> : null}
                </section>

                <section style={styles.toolCard}>
                    <h3 style={styles.toolTitle}>AI Email Recommendation System</h3>
                    <select value={form.segment} onChange={(e) => setForm((prev) => ({ ...prev, segment: e.target.value }))} style={styles.input}>
                        <option value="repeat">Repeat Customer</option>
                        <option value="new">New Customer</option>
                        <option value="at-risk">At-Risk Customer</option>
                    </select>
                    <input value={form.bundleProducts} onChange={(e) => setForm((prev) => ({ ...prev, bundleProducts: e.target.value }))} style={styles.input} placeholder="Products (comma separated)" />
                    <button style={styles.actionButton} onClick={() => generateContent("email")}>Create Email</button>
                    {contentState.email ? <div style={styles.toolText}><strong>{contentState.email.subject}</strong><br />{contentState.email.body}</div> : null}
                </section>

                <section style={styles.toolCard}>
                    <h3 style={styles.toolTitle}>AI Frequently Bought Together Suggestions</h3>
                    <input value={form.bundleProducts} onChange={(e) => setForm((prev) => ({ ...prev, bundleProducts: e.target.value }))} style={styles.input} placeholder="Suggested products" />
                    <button style={styles.actionButton} onClick={() => generateContent("bundle")}>Suggest Bundles</button>
                    {contentState.bundle ? <ul style={styles.list}>{contentState.bundle.suggestions.map((item, index) => <li key={`${item.name}-${index}`} style={styles.listItem}>{item.name} — {item.reason}</li>)}</ul> : null}
                </section>
            </div>

            <div style={styles.grid}>
                <section style={styles.card}><AIRecommendations /></section>
                <section style={styles.card}><AIChatbot /></section>
                <section style={styles.card}><AIImageSearch /></section>
                <section style={styles.card}><AIOrderAssistant /></section>
            </div>
        </div>
    );
}

const styles = {
    page: { padding: 24, background: "linear-gradient(135deg, #f8efe6 0%, #fffaf4 100%)", minHeight: "100vh" },
    hero: { maxWidth: 980, margin: "0 auto 24px", background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" },
    badge: { display: "inline-block", padding: "7px 10px", borderRadius: 999, background: "#f5e0c8", color: "#8b4a14", fontWeight: 800, marginBottom: 12 },
    title: { fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: "#2f241c" },
    subtitle: { margin: 0, color: "#74573c", lineHeight: 1.6 },
    insightGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, maxWidth: 1200, margin: "0 auto 18px" },
    insightCard: { background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 12px 24px rgba(0,0,0,0.05)" },
    insightTitle: { fontSize: 13, fontWeight: 800, color: "#8b4a14", marginBottom: 6 },
    insightValue: { fontSize: 20, fontWeight: 800, color: "#2f241c", marginBottom: 4 },
    insightDetail: { fontSize: 13, color: "#74573c" },
    toolsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, maxWidth: 1200, margin: "0 auto 18px" },
    toolCard: { background: "#fff", borderRadius: 20, padding: 16, boxShadow: "0 16px 30px rgba(0,0,0,0.05)" },
    toolTitle: { marginTop: 0, marginBottom: 10, color: "#2f241c" },
    input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d9cc", marginBottom: 10, boxSizing: "border-box" },
    actionButton: { border: 0, borderRadius: 999, padding: "10px 14px", background: "#8b4a14", color: "#fff", cursor: "pointer", fontWeight: 700, marginBottom: 10 },
    toolText: { fontSize: 13, color: "#5b4634", lineHeight: 1.55 },
    list: { paddingLeft: 18, margin: 0, color: "#5b4634" },
    listItem: { marginBottom: 6 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, maxWidth: 1200, margin: "0 auto" },
    card: { background: "#fff", borderRadius: 20, padding: 16, boxShadow: "0 16px 30px rgba(0,0,0,0.05)" },
};
