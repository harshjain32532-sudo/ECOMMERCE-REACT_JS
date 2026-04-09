import { Link, useNavigate } from "react-router-dom";

function Header({ cartCount = 0, wishlistCount = 0, isLoggedIn = false, isAdmin = false, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (typeof onLogout === "function") onLogout();
        navigate("/");
    };

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    🛒 Store
                </Link>
                <nav style={styles.nav}>
                    <Link to="/" style={styles.link}>
                        Home
                    </Link>
                    <Link to="/cart" style={styles.cartLink}>
                        Cart
                        {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                    </Link>
                    <Link to="/wishlist" style={styles.cartLink}>
                        Wishlist
                        {wishlistCount > 0 && <span style={styles.badge}>{wishlistCount}</span>}
                    </Link>
                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" style={styles.link}>
                                Profile
                            </Link>
                            <Link to="/orders" style={styles.link}>
                                Orders
                            </Link>
                            {isAdmin && (
                                <Link to="/admin" style={styles.link}>
                                    Admin
                                </Link>
                            )}
                            <button onClick={handleLogout} style={styles.button}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" style={styles.link}>
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

const styles = {
    header: {
        background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 40%, #35c1f5 100%)",
        color: "#fff",
        padding: "18px 0",
        boxShadow: "0 12px 32px rgba(37, 117, 252, 0.18)",
        borderBottom: "1px solid rgba(255,255,255,0.18)",
    },
    container: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    logo: {
        fontSize: 26,
        fontWeight: "bold",
        textDecoration: "none",
        color: "#fff",
        letterSpacing: "0.6px",
        textShadow: "0 2px 12px rgba(0, 0, 0, 0.25)",
    },
    nav: {
        display: "flex",
        gap: 24,
        alignItems: "center",
    },
    link: {
        color: "#f7f9ff",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 600,
    },
    cartLink: {
        color: "#f7f9ff",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 600,
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 6,
    },
    button: {
        padding: "12px 18px",
        background: "rgba(255,255,255,0.95)",
        color: "#2575fc",
        border: "1px solid rgba(255,255,255,0.45)",
        borderRadius: 12,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
        boxShadow: "0 10px 22px rgba(37, 117, 252, 0.12)",
    },
    badge: {
        background: "#ffdd59",
        color: "#2d2d2d",
        borderRadius: 8,
        width: 26,
        height: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: "bold",
        border: "2px solid rgba(255,255,255,0.25)",
        boxShadow: "0 6px 16px rgba(255, 221, 89, 0.2)",
    },
};

export default Header;
