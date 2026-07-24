import React, { useState } from "react";
import "../styles/QuickViewModal.css";

function QuickViewModal({ product, isOpen, onClose, onAddToCart, onAddToWishlist }) {
    const [isInWishlist, setIsInWishlist] = useState(false);

    if (!isOpen) return null;

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const handleWishlistClick = () => {
        setIsInWishlist(!isInWishlist);
        onAddToWishlist?.(product);
    };

    return (
        <div className="quick-view-overlay" onClick={onClose}>
            <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
                <button className="quick-view-close" onClick={onClose}>
                    ✕
                </button>

                <div className="quick-view-container">
                    {/* Image Section */}
                    <div className="quick-view-image-section">
                        <div className="quick-view-image-wrapper">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="quick-view-image"
                            />
                            {discount > 0 && (
                                <span className="quick-view-discount-badge">{discount}% OFF</span>
                            )}
                            {product.stock < 5 && (
                                <span className="quick-view-stock-badge">Only {product.stock} left</span>
                            )}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="quick-view-details">
                        <h1 className="quick-view-title">{product.name}</h1>

                        {/* Rating */}
                        <div className="quick-view-rating">
                            <span className="stars">
                                {Array(5)
                                    .fill(0)
                                    .map((_, i) => (
                                        <span
                                            key={i}
                                            className={i < (product.rating || 4) ? "star-filled" : "star-empty"}
                                        >
                                            ★
                                        </span>
                                    ))}
                            </span>
                            <span className="rating-text">
                                {product.rating || 4} out of 5 ({product.reviews || 0} reviews)
                            </span>
                        </div>

                        {/* Description */}
                        <p className="quick-view-description">{product.description}</p>

                        {/* Stock Status */}
                        <div className="quick-view-stock-status">
                            {product.stock > 0 ? (
                                <span className="in-stock">
                                    ✓ In Stock ({product.stock} available)
                                </span>
                            ) : (
                                <span className="out-of-stock">Out of Stock</span>
                            )}
                        </div>

                        {/* Price Section */}
                        <div className="quick-view-price-section">
                            <div className="price-display">
                                <span className="quick-view-price">
                                    ₹{product.price.toLocaleString()}
                                </span>
                                {product.originalPrice && (
                                    <span className="quick-view-original-price">
                                        ₹{product.originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            {discount > 0 && (
                                <span className="discount-percentage">
                                    Save ₹{(product.originalPrice - product.price).toLocaleString()} ({discount}%)
                                </span>
                            )}
                        </div>

                        {/* Additional Info */}
                        <div className="quick-view-info-grid">
                            <div className="info-item">
                                <span className="info-label">Category:</span>
                                <span className="info-value">{product.category || "Electronics"}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">SKU:</span>
                                <span className="info-value">{product._id?.substring(0, 8) || "N/A"}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="quick-view-actions">
                            <button
                                className="quick-view-add-cart"
                                onClick={() => onAddToCart(product)}
                                disabled={product.stock === 0}
                            >
                                🛒 Add to Cart
                            </button>
                            <button
                                className={`quick-view-wishlist ${isInWishlist ? "active" : ""}`}
                                onClick={handleWishlistClick}
                                title="Add to Wishlist"
                            >
                                {isInWishlist ? "❤️" : "♡"}
                            </button>
                        </div>

                        {/* Additional Note */}
                        <p className="quick-view-note">
                            Free shipping on orders over ₹500 | 30-day return policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuickViewModal;
