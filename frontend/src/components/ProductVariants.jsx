import { useState } from "react";

function ProductVariants({ variants = [], onSelectVariant }) {
    const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);

    const handleSelectVariant = (variant) => {
        setSelectedVariant(variant);
        onSelectVariant(variant);
    };

    // Group variants by type
    const sizeVariants = variants.filter(v => v.type === "size");
    const colorVariants = variants.filter(v => v.type === "color");

    return (
        <div style={styles.container}>
            {sizeVariants.length > 0 && (
                <div style={styles.variantGroup}>
                    <label style={styles.label}>📏 Size</label>
                    <div style={styles.variantOptions}>
                        {sizeVariants.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => handleSelectVariant(variant)}
                                style={{
                                    ...styles.option,
                                    background: selectedVariant?.id === variant.id ? "#2575fc" : "#f5f5f5",
                                    color: selectedVariant?.id === variant.id ? "white" : "#333",
                                }}
                            >
                                {variant.value}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {colorVariants.length > 0 && (
                <div style={styles.variantGroup}>
                    <label style={styles.label}>🎨 Color</label>
                    <div style={styles.variantOptions}>
                        {colorVariants.map((variant) => (
                            <div
                                key={variant.id}
                                style={{
                                    ...styles.colorOption,
                                    background: variant.hexColor || variant.value,
                                    border: selectedVariant?.id === variant.id ? "3px solid #2575fc" : "2px solid #ddd",
                                }}
                                onClick={() => handleSelectVariant(variant)}
                                title={variant.value}
                            />
                        ))}
                    </div>
                </div>
            )}

            {selectedVariant && (
                <div style={styles.selectedInfo}>
                    <p><strong>Selected:</strong> {selectedVariant.value}</p>
                    {selectedVariant.stock && <p><strong>Stock:</strong> {selectedVariant.stock} available</p>}
                    {selectedVariant.priceModifier && <p><strong>Price:</strong> +₹{selectedVariant.priceModifier}</p>}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        animation: "fadeIn 0.5s ease",
    },
    variantGroup: {
        marginBottom: 20,
    },
    label: {
        display: "block",
        marginBottom: 12,
        fontWeight: 600,
        color: "#333",
        fontSize: 14,
    },
    variantOptions: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
    },
    option: {
        padding: "10px 16px",
        borderRadius: 8,
        border: "2px solid #ddd",
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
        fontSize: 14,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
    selectedInfo: {
        background: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        borderLeft: "4px solid #2575fc",
        marginTop: 15,
    },
};

export default ProductVariants;
