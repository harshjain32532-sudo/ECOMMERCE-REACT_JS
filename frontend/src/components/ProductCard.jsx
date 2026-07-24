import React, { useState } from "react";
import "../styles/ProductCard.css";
import QuickViewModal from "./QuickViewModal";

function ProductCard({ product, onAddToCart, onViewDetails }) {
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <>
            <div className="product-card">
                <div className="product-image-wrapper">
                    <img src={product.image} alt={product.name} className="product-image" />
                    {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
                    {product.stock < 5 && <span className="stock-badge">Only {product.stock} left</span>}
                    <button
                        className="quick-view-btn"
                        onClick={() => setIsQuickViewOpen(true)}
                        title="Quick View"
                    >
                        👁️ Quick View
                    </button>
                </div>

                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description.substring(0, 60)}...</p>

                    <div className="product-rating">
                        <span className="stars">
                            {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                    <span key={i} className={i < (product.rating || 4) ? "star-filled" : "star-empty"}>
                                        ★
                                    </span>
                                ))}
                        </span>
                        <span className="rating-count">({product.reviews || 0})</span>
                    </div>

                    <div className="product-price-section">
                        <div className="price-group">
                            <span className="product-price">₹{product.price.toLocaleString()}</span>
                            {product.originalPrice && (
                                <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                            )}
                        </div>
                    </div>

                    <div className="product-actions">
                        <button className="btn-add-to-cart" onClick={() => onAddToCart(product)}>
                            🛒 Add to Cart
                        </button>
                        <button className="btn-wishlist" onClick={() => onViewDetails?.(product)}>
                            ♡
                        </button>
                    </div>
                </div>
            </div>

            <QuickViewModal
                product={product}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
                onAddToCart={onAddToCart}
                onAddToWishlist={onViewDetails}
            />
        </>
    );
}

export default ProductCard;
