function Wishlist({ wishlist = [], onRemove, addToCart }) {
    const handleMoveToCart = (item) => {
        addToCart(item);
        if (typeof onRemove === "function") onRemove(item.productId || item._id);
    };

    return (
        <div style={styles.container}>
            <h1>My Wishlist</h1>
            {wishlist.length === 0 ? (
                <p>Your wishlist is empty.</p>
            ) : (
                <div style={styles.list}>
                    {wishlist.map(item => (
                        <div key={item.productId || item._id} style={styles.card}>
                            {item.image && <img src={item.image} alt={item.name} style={styles.image} />}
                            <div style={styles.info}>
                                <h3>{item.name}</h3>
                                <p>₹{item.price}</p>
                                <div style={styles.actions}>
                                    <button onClick={() => handleMoveToCart(item)} style={styles.button}>
                                        Move to Cart
                                    </button>
                                    <button onClick={() => onRemove(item.productId || item._id)} style={styles.removeButton}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 1000,
        margin: "0 auto",
        padding: 20,
    },
    list: {
        display: "grid",
        gap: 16,
    },
    card: {
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 16,
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 8,
        alignItems: "center",
    },
    image: {
        width: 120,
        height: 120,
        objectFit: "cover",
        borderRadius: 8,
    },
    info: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    actions: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
    },
    button: {
        padding: 10,
        background: "#3498db",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontWeight: "bold",
    },
    removeButton: {
        padding: 10,
        background: "#e74c3c",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontWeight: "bold",
    },
};

export default Wishlist;
