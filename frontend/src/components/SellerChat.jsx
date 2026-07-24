import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getProfile } from "../api.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SellerChat() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socketReady, setSocketReady] = useState(false);
    const socketRef = useRef(null);
    const endRef = useRef(null);

    const isAdmin = useMemo(() => profile?.role === "admin", [profile]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await getProfile();
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    useEffect(() => {
        if (!profile) return;

        const socket = io(API_BASE, { withCredentials: true });
        socketRef.current = socket;

        socket.on("connect", () => {
            setSocketReady(true);
            socket.emit("chat:join", profile._id);
            socket.emit("chat:history", profile._id, isAdmin ? "admin" : "user");
        });

        socket.on("chat:history", (history) => {
            setMessages(history || []);
            setLoading(false);
        });

        socket.on("chat:message", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on("chat:message:sent", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.disconnect();
        };
    }, [profile, isAdmin]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (event) => {
        event.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || !socketReady || !profile) return;

        const activeCustomerId = isAdmin
            ? [...messages].reverse().find((message) => message.senderRole === "user" && message.senderId !== profile._id)?.senderId || null
            : profile._id;

        const payload = {
            senderId: profile._id,
            senderName: profile.name || profile.email,
            senderRole: profile.role || "user",
            recipientId: isAdmin ? activeCustomerId : profile._id,
            recipientName: isAdmin ? "Customer" : "Admin",
            recipientRole: isAdmin ? "user" : "admin",
            targetUserId: isAdmin ? activeCustomerId : profile._id,
            text: trimmed,
        };

        socketRef.current.emit("chat:message", payload);
        setText("");
    };

    if (loading) {
        return <div style={styles.shell}>Loading chat…</div>;
    }

    return (
        <div style={styles.shell}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div>
                        <div style={styles.title}>Real-Time Chat with Seller</div>
                        <div style={styles.subtitle}>{isAdmin ? "Support customers directly" : "Ask the seller about your order or product"}</div>
                    </div>
                    <div style={styles.pill}>{socketReady ? "Live" : "Connecting…"}</div>
                </div>

                <div style={styles.chatArea}>
                    {messages.length === 0 ? (
                        <div style={styles.empty}>Start a conversation with the seller.</div>
                    ) : (
                        messages.map((message, index) => {
                            const incoming = message.senderId !== profile._id;
                            return (
                                <div key={`${message._id || index}`} style={{ ...styles.messageRow, justifyContent: incoming ? "flex-start" : "flex-end" }}>
                                    <div style={{ ...styles.bubble, ...(incoming ? styles.incoming : styles.outgoing) }}>
                                        <div style={styles.meta}>{message.senderName || "Seller"}</div>
                                        <div>{message.text}</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={endRef} />
                </div>

                <form onSubmit={handleSend} style={styles.form}>
                    <input
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="Type your message..."
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Send</button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    shell: { minHeight: "70vh", padding: 24, background: "linear-gradient(135deg, #f8efe6 0%, #fffdf8 100%)" },
    card: { maxWidth: 860, margin: "0 auto", background: "#fff", borderRadius: 24, boxShadow: "0 20px 45px rgba(0,0,0,0.08)", overflow: "hidden" },
    header: { padding: "20px 24px", borderBottom: "1px solid #f0e6dc", display: "flex", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 22, fontWeight: 800, color: "#2f241c" },
    subtitle: { color: "#8a6b4d", marginTop: 4 },
    pill: { padding: "8px 12px", borderRadius: 999, background: "#f5e0c8", color: "#8c4d15", fontWeight: 700 },
    chatArea: { height: 420, overflowY: "auto", padding: 20, background: "#fcfbf7" },
    empty: { textAlign: "center", color: "#8d7560", paddingTop: 80 },
    messageRow: { display: "flex", marginBottom: 12 },
    bubble: { maxWidth: "75%", padding: "12px 14px", borderRadius: 16, boxShadow: "0 6px 18px rgba(0,0,0,0.05)" },
    incoming: { background: "#f6ece1", color: "#493021" },
    outgoing: { background: "#2f241c", color: "#fff" },
    meta: { fontSize: 12, opacity: 0.8, marginBottom: 4, fontWeight: 700 },
    form: { display: "flex", gap: 12, padding: 16, borderTop: "1px solid #f0e6dc" },
    input: { flex: 1, border: "1px solid #e4d8ca", borderRadius: 999, padding: "12px 16px", fontSize: 15 },
    button: { border: 0, borderRadius: 999, background: "linear-gradient(135deg, #d77d3a, #a9551d)", color: "#fff", padding: "0 18px", fontWeight: 800, cursor: "pointer" },
};

export default SellerChat;
