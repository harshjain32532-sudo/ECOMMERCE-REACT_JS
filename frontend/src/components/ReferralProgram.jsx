import { useState } from "react";

function ReferralProgram({ userId = "USER123", onShareCode }) {
    const [copied, setCopied] = useState(false);
    const [showRewards, setShowRewards] = useState(false);

    const referralCode = `REF${userId.toUpperCase().slice(0, 6)}`;
    const referralLink = `https://ecommerce.com/ref/${referralCode}`;

    const stats = {
        referrals: 5,
        earnings: 2500,
        redeemed: 1500,
        pending: 1000,
    };

    const rewards = [
        { type: "friend", reward: "₹500", desc: "When friend creates account" },
        { type: "firstOrder", reward: "₹1000", desc: "When friend makes first purchase" },
        { type: "milestone", reward: "₹10000", desc: "Refer 10 friends (bonus)" },
    ];

    const tiers = [
        { level: 1, referrals: "1-5", bonus: "₹500/friend", cashback: "5%" },
        { level: 2, referrals: "6-15", bonus: "₹750/friend", cashback: "7%" },
        { level: 3, referrals: "16-25", bonus: "₹1000/friend", cashback: "10%" },
        { level: 4, referrals: "25+", bonus: "₹1500/friend", cashback: "15%" },
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const referralHistory = [
        { friend: "Priya M", date: "2024-04-15", reward: "₹500", status: "Credited" },
        { friend: "Rahul K", date: "2024-04-10", reward: "₹1500", status: "Credited" },
        { friend: "Anjali S", date: "2024-03-28", reward: "₹500", status: "Pending" },
        { friend: "Arjun P", date: "2024-03-20", reward: "₹1000", status: "Credited" },
        { friend: "Neha R", date: "2024-03-15", reward: "₹500", status: "Credited" },
    ];

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>🎁 Refer & Earn Program</h2>
                    <p style={styles.subtitle}>Share the love, earn rewards together</p>
                </div>
                <div style={styles.headerIcon}>👥</div>
            </div>

            {/* Referral Stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <p style={styles.statValue}>{stats.referrals}</p>
                    <p style={styles.statLabel}>Friends Referred</p>
                </div>
                <div style={styles.statCard}>
                    <p style={styles.statValue}>₹{stats.earnings}</p>
                    <p style={styles.statLabel}>Total Earnings</p>
                    <p style={styles.statDesc}>({stats.pending} pending)</p>
                </div>
                <div style={styles.statCard}>
                    <p style={styles.statValue}>₹{stats.redeemed}</p>
                    <p style={styles.statLabel}>Amount Redeemed</p>
                </div>
                <div style={styles.statCard}>
                    <p style={styles.statValue}>{Math.floor((stats.referrals / 10) * 100)}%</p>
                    <p style={styles.statLabel}>To Next Tier</p>
                </div>
            </div>

            {/* Your Referral Code */}
            <div style={styles.codeSection}>
                <h3 style={styles.sectionTitle}>Your Referral Code</h3>

                <div style={styles.codeCard}>
                    <div style={styles.codeDisplay}>
                        <code style={styles.code}>{referralCode}</code>
                    </div>
                    <p style={styles.codeDesc}>Share this code with friends</p>

                    <div style={styles.linkBox}>
                        <input
                            type="text"
                            value={referralLink}
                            readOnly
                            style={styles.linkInput}
                        />
                        <button onClick={handleCopy} style={styles.copyBtn}>
                            {copied ? "✓ Copied" : "📋 Copy Link"}
                        </button>
                    </div>

                    {/* Share Buttons */}
                    <div style={styles.shareButtons}>
                        <button style={styles.shareBtn}>
                            📱 WhatsApp
                        </button>
                        <button style={styles.shareBtn}>
                            💬 Facebook
                        </button>
                        <button style={styles.shareBtn}>
                            ✉️ Email
                        </button>
                        <button style={styles.shareBtn}>
                            🔗 Copy
                        </button>
                    </div>
                </div>
            </div>

            {/* Rewards Structure */}
            <div style={styles.rewardsSection}>
                <h3 style={styles.sectionTitle}>How You Earn</h3>

                <div style={styles.rewardsGrid}>
                    {rewards.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                ...styles.rewardCard,
                                animation: `slideInUp 0.4s ease ${idx * 0.05}s both`,
                            }}
                        >
                            <div style={styles.rewardIcon}>
                                {item.type === "friend" && "👤"}
                                {item.type === "firstOrder" && "🛒"}
                                {item.type === "milestone" && "🏆"}
                            </div>
                            <p style={styles.rewardAmount}>{item.reward}</p>
                            <p style={styles.rewardDesc}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tier System */}
            <div style={styles.tierSection}>
                <h3 style={styles.sectionTitle}>Referral Tiers</h3>
                <p style={styles.tierSubtitle}>Unlock better rewards as you refer more friends</p>

                <div style={styles.tierGrid}>
                    {tiers.map((tier, idx) => (
                        <div
                            key={idx}
                            style={{
                                ...styles.tierCard,
                                background: tier.level <= Math.ceil(stats.referrals / 5) ? "#e8f4f8" : "white",
                                borderColor: tier.level <= Math.ceil(stats.referrals / 5) ? "#2575fc" : "#ddd",
                                animation: `slideInLeft 0.4s ease ${idx * 0.05}s both`,
                            }}
                        >
                            <div style={styles.tierBadge}>
                                <span style={styles.tierLevel}>Tier {tier.level}</span>
                                {tier.level <= Math.ceil(stats.referrals / 5) && (
                                    <span style={styles.currentBadge}>Current</span>
                                )}
                            </div>

                            <div style={styles.tierDetail}>
                                <p style={styles.tierInfo}>
                                    <strong>{tier.referrals}</strong> Referrals
                                </p>
                            </div>

                            <div style={styles.tierRewards}>
                                <div style={styles.tierRewardRow}>
                                    <span style={styles.tierLabel}>Bonus/Referral:</span>
                                    <span style={styles.tierValue}>{tier.bonus}</span>
                                </div>
                                <div style={styles.tierRewardRow}>
                                    <span style={styles.tierLabel}>Cashback:</span>
                                    <span style={styles.tierValue}>{tier.cashback}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Referral History */}
            <div style={styles.historySection}>
                <div style={styles.historyHeader}>
                    <h3 style={styles.sectionTitle}>Referral History</h3>
                    <button
                        onClick={() => setShowRewards(!showRewards)}
                        style={styles.toggleBtn}
                    >
                        {showRewards ? "▲ Hide" : "▼ Show All"}
                    </button>
                </div>

                {showRewards && (
                    <div style={styles.historyTable}>
                        <div style={styles.historyHeader}>
                            <div style={styles.historyCol}>Friend Name</div>
                            <div style={styles.historyCol}>Date</div>
                            <div style={styles.historyCol}>Reward</div>
                            <div style={styles.historyCol}>Status</div>
                        </div>

                        {referralHistory.map((entry, idx) => (
                            <div
                                key={idx}
                                style={{
                                    ...styles.historyRow,
                                    background: idx % 2 === 0 ? "white" : "#f9f9f9",
                                    animation: `slideInLeft 0.4s ease ${idx * 0.05}s both`,
                                }}
                            >
                                <div style={styles.historyCol}>{entry.friend}</div>
                                <div style={styles.historyCol}>{entry.date}</div>
                                <div style={styles.historyCol}>
                                    <strong>{entry.reward}</strong>
                                </div>
                                <div style={styles.historyCol}>
                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            background: entry.status === "Credited" ? "#d4edda" : "#fff3cd",
                                            color: entry.status === "Credited" ? "#27ae60" : "#8b7500",
                                        }}
                                    >
                                        {entry.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Terms & Conditions */}
            <div style={styles.termsSection}>
                <h3 style={styles.sectionTitle}>📋 Terms & Conditions</h3>
                <ul style={styles.termsList}>
                    <li>Referral must be a new customer (no previous purchases)</li>
                    <li>Referred friend must complete first purchase within 30 days</li>
                    <li>Minimum purchase amount: ₹500</li>
                    <li>Referral bonus is credited within 24 hours of order confirmation</li>
                    <li>Earnings can be redeemed as wallet credit or cashback</li>
                    <li>No limit on number of referrals</li>
                    <li>Fraudulent referrals will result in account suspension</li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div style={styles.actions}>
                <button
                    onClick={() => onShareCode(referralCode)}
                    style={styles.shareActionBtn}
                >
                    📤 Share Referral Code
                </button>
                <button style={styles.redeemBtn}>
                    💳 Redeem Earnings
                </button>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
                <p style={styles.infoText}>
                    💡 Start referring now and earn unlimited rewards! There's no limit to how much you can earn.
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        padding: 30,
        borderRadius: 12,
        marginBottom: 30,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        animation: "fadeIn 0.4s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: "2px solid #f0f0f0",
    },
    title: {
        fontSize: 22,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 6px 0",
    },
    subtitle: {
        fontSize: 12,
        color: "#999",
        margin: 0,
    },
    headerIcon: {
        fontSize: 40,
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 15,
        marginBottom: 30,
    },
    statCard: {
        background: "linear-gradient(135deg, #e8f4f8 0%, #e8f4f8 100%)",
        padding: 20,
        borderRadius: 10,
        textAlign: "center",
        border: "1px solid #b3e5fc",
    },
    statValue: {
        fontSize: 22,
        fontWeight: 700,
        color: "#2575fc",
        margin: "0 0 6px 0",
    },
    statLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 4px 0",
    },
    statDesc: {
        fontSize: 10,
        color: "#999",
        margin: 0,
    },
    codeSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 15,
        margin: "0 0 15px 0",
    },
    codeCard: {
        background: "linear-gradient(135deg, #fff5f7 0%, #ffe6e6 100%)",
        padding: 25,
        borderRadius: 12,
        border: "2px solid #e74c3c",
        textAlign: "center",
    },
    codeDisplay: {
        background: "white",
        padding: 15,
        borderRadius: 8,
        marginBottom: 12,
        border: "2px dashed #e74c3c",
    },
    code: {
        fontSize: 20,
        fontWeight: 700,
        color: "#e74c3c",
        letterSpacing: 2,
    },
    codeDesc: {
        fontSize: 11,
        color: "#999",
        margin: "8px 0 15px 0",
    },
    linkBox: {
        display: "flex",
        gap: 10,
        marginBottom: 15,
    },
    linkInput: {
        flex: 1,
        padding: "12px 14px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 11,
        color: "#666",
    },
    copyBtn: {
        padding: "12px 16px",
        background: "#2575fc",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 11,
        transition: "all 0.3s ease",
        whiteSpace: "nowrap",
    },
    shareButtons: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 10,
    },
    shareBtn: {
        padding: "12px 16px",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 11,
        transition: "all 0.3s ease",
    },
    rewardsSection: {
        marginBottom: 30,
    },
    rewardsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 15,
    },
    rewardCard: {
        background: "#f9f9f9",
        padding: 20,
        borderRadius: 10,
        border: "1px solid #f0f0f0",
        textAlign: "center",
    },
    rewardIcon: {
        fontSize: 32,
        marginBottom: 10,
    },
    rewardAmount: {
        fontSize: 18,
        fontWeight: 700,
        color: "#2575fc",
        margin: "0 0 6px 0",
    },
    rewardDesc: {
        fontSize: 11,
        color: "#666",
        margin: 0,
    },
    tierSection: {
        marginBottom: 30,
    },
    tierSubtitle: {
        fontSize: 11,
        color: "#999",
        marginBottom: 15,
    },
    tierGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
    },
    tierCard: {
        background: "white",
        padding: 18,
        borderRadius: 10,
        border: "2px solid #ddd",
        transition: "all 0.3s ease",
    },
    tierBadge: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    tierLevel: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
    },
    currentBadge: {
        background: "#27ae60",
        color: "white",
        padding: "3px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
    },
    tierDetail: {
        background: "#f9f9f9",
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
    },
    tierInfo: {
        fontSize: 12,
        color: "#2c3e50",
        margin: 0,
    },
    tierRewards: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    tierRewardRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
    },
    tierLabel: {
        color: "#666",
    },
    tierValue: {
        fontWeight: 700,
        color: "#2575fc",
    },
    historySection: {
        marginBottom: 30,
    },
    historyHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    toggleBtn: {
        padding: "8px 14px",
        background: "#f0f0f0",
        border: "1px solid #ddd",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
    },
    historyTable: {
        border: "1px solid #f0f0f0",
        borderRadius: 8,
        overflow: "hidden",
        animation: "slideInDown 0.4s ease",
    },
    historyRow: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        borderBottom: "1px solid #f0f0f0",
    },
    historyCol: {
        padding: 12,
        fontSize: 11,
        color: "#666",
    },
    statusBadge: {
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
    },
    termsSection: {
        background: "#f9f9f9",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    termsList: {
        listStyle: "none",
        padding: "0 0 0 20px",
        margin: 0,
    },
    actions: {
        display: "flex",
        gap: 12,
        marginBottom: 20,
    },
    shareActionBtn: {
        flex: 1,
        padding: "14px 16px",
        background: "#e74c3c",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        transition: "all 0.3s ease",
    },
    redeemBtn: {
        flex: 1,
        padding: "14px 16px",
        background: "#27ae60",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        transition: "all 0.3s ease",
    },
    infoBox: {
        background: "#e8f4f8",
        padding: 12,
        borderRadius: 6,
        border: "1px solid #b3e5fc",
        textAlign: "center",
    },
    infoText: {
        fontSize: 11,
        color: "#0277bd",
        margin: 0,
        fontWeight: 600,
    },
};

export default ReferralProgram;
