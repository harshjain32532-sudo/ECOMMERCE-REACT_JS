import { Link, useLocation, useNavigate } from "react-router-dom";

function Header({ cartCount = 0, wishlistCount = 0, isLoggedIn = false, isAdmin = false, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        if (typeof onLogout === "function") onLogout();
        navigate("/");
    };

    const navItems = [
        { to: "/", label: "Shop" },
        { to: "/cart", label: "Cart", count: cartCount },
        { to: "/wishlist", label: "Wishlist", count: wishlistCount },
    ];

    if (isLoggedIn) {
        navItems.push({ to: "/profile", label: "Profile" });
        navItems.push({ to: "/orders", label: "Orders" });
        if (isAdmin) {
            navItems.push({ to: "/admin", label: "Admin" });
            navItems.push({ to: "/admin-panel?tab=orders", label: "Admin Orders" });
        }
    } else {
        navItems.push({ to: "/login", label: "Login" });
    }

    return (
        <header style={styles.headerWrap}>
            <div style={styles.auroraLeft} />
            <div style={styles.auroraRight} />
            <div style={styles.header}>
                <Link to="/" style={styles.brand}>
                    <span style={styles.brandMark}>E</span>
                    <span>
                        <span style={styles.brandTitle}>EmberCart</span>
                        <span style={styles.brandSub}>Curated tech and home picks</span>
                    </span>
                </Link>

                <nav style={styles.nav}>
                    {navItems.map((item) => {
                        const active = location.pathname + location.search === item.to || location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                style={{
                                    ...styles.link,
                                    ...(active ? styles.linkActive : {}),
                                }}
                            >
                                <span>{item.label}</span>
                                {item.count > 0 && <span style={styles.badge}>{item.count}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div style={styles.actions}>
                    <div style={styles.helperText}>Fast delivery | Secure checkout</div>
                    {isLoggedIn ? (
                        <button onClick={handleLogout} style={styles.logoutButton}>
                            Sign out
                        </button>
                    ) : (
                        <Link to="/register" style={styles.cta}>
                            Create account
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

const styles = {
    headerWrap: {
        position: "sticky",
        top: 0,
        zIndex: 40,
        padding: "14px 14px 0",
        background: "linear-gradient(180deg, rgba(245, 239, 230, 0.96), rgba(245, 239, 230, 0.72), transparent)",
        backdropFilter: "blur(8px)",
    },
    auroraLeft: {
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212, 146, 87, 0.34), transparent 65%)",
        top: -70,
        left: 40,
        pointerEvents: "none",
    },
    auroraRight: {
        position: "absolute",
        width: 240,
        height: 240,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(19, 78, 74, 0.18), transparent 68%)",
        top: -90,
        right: 30,
        pointerEvents: "none",
    },
    header: {
        position: "relative",
        width: "min(1180px, 100%)",
        margin: "0 auto",
        padding: "16px 22px",
        borderRadius: 28,
        border: "1px solid rgba(255, 255, 255, 0.72)",
        background: "rgba(35, 25, 18, 0.88)",
        color: "#fff8f1",
        display: "grid",
        gridTemplateColumns: "1.1fr 1.3fr auto",
        gap: 20,
        alignItems: "center",
        boxShadow: "0 24px 44px rgba(44, 24, 11, 0.24)",
        animation: "floatIn 0.5s ease",
    },
    brand: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        minWidth: 0,
    },
    brandMark: {
        width: 46,
        height: 46,
        borderRadius: 16,
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #e89a56 0%, #b95a20 100%)",
        color: "#fff",
        fontSize: 26,
        fontWeight: 800,
        boxShadow: "0 12px 24px rgba(197, 107, 45, 0.22)",
    },
    brandTitle: {
        display: "block",
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: "-0.03em",
    },
    brandSub: {
        display: "block",
        fontSize: 12,
        color: "rgba(255, 248, 241, 0.72)",
        marginTop: 2,
    },
    nav: {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
    },
    link: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 999,
        color: "rgba(255, 248, 241, 0.84)",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid transparent",
        fontSize: 14,
        fontWeight: 700,
        transition: "all 0.2s ease",
    },
    linkActive: {
        background: "rgba(255, 255, 255, 0.14)",
        color: "#fff",
        border: "1px solid rgba(255, 255, 255, 0.16)",
    },
    badge: {
        minWidth: 22,
        height: 22,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        padding: "0 6px",
        background: "#f8cf9f",
        color: "#51311f",
        fontSize: 11,
        fontWeight: 800,
    },
    actions: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 12,
        flexWrap: "wrap",
    },
    helperText: {
        fontSize: 12,
        color: "rgba(255, 248, 241, 0.72)",
    },
    cta: {
        padding: "12px 18px",
        borderRadius: 999,
        background: "#fff8ef",
        color: "#3d2417",
        fontWeight: 800,
        boxShadow: "0 12px 22px rgba(255, 248, 239, 0.16)",
    },
    logoutButton: {
        padding: "12px 18px",
        borderRadius: 999,
        background: "linear-gradient(135deg, #e7894a 0%, #c15d24 100%)",
        color: "#fff",
        fontWeight: 800,
        boxShadow: "0 12px 24px rgba(197, 107, 45, 0.24)",
    },
};

export default Header;
