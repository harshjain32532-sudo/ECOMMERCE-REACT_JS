import { useState } from "react";

function ProductRating({ productId, rating = 0, reviewCount = 0, onAddReview }) {
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [showReviewForm, setShowReviewForm] = useState(false);

    const handleSubmitReview = () => {
        if (userRating === 0) {
            alert("Please select a rating");
            return;
        }
        onAddReview({ productId, rating: userRating, review: reviewText });
        setUserRating(0);
        setReviewText("");
        setShowReviewForm(false);
    };

    const renderStars = (count, interactive = false) => {
        return (
            <div style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        style={{
                            ...styles.star,
                            color: star <= (interactive ? hoverRating || userRating : count) ? "#FFB700" : "#ddd",
                        }}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                        onClick={() => interactive && setUserRating(star)}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.ratingHeader}>
                <div>
                    <div style={styles.ratingNumber}>{rating.toFixed(1)}</div>
                    {renderStars(Math.round(rating))}
                    <div style={styles.reviewCount}>{reviewCount} Reviews</div>
                </div>
                {!showReviewForm && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        style={styles.reviewButton}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = styles.reviewButton.boxShadow;
                        }}
                    >
                        ✍️ Write Review
                    </button>
                )}
            </div>

            {showReviewForm && (
                <div style={styles.reviewForm}>
                    <h4>Rate This Product</h4>
                    <div style={styles.ratingSection}>
                        {renderStars(0, true)}
                    </div>
                    <textarea
                        placeholder="Share your experience with this product..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        style={styles.textarea}
                    />
                    <div style={styles.buttonGroup}>
                        <button
                            onClick={handleSubmitReview}
                            style={styles.submitButton}
                        >
                            Submit Review
                        </button>
                        <button
                            onClick={() => setShowReviewForm(false)}
                            style={styles.cancelButton}
                        >
                            Cancel
                        </button>
                    </div>
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
    ratingHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    ratingNumber: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFB700",
    },
    starsContainer: {
        display: "flex",
        gap: 4,
        marginBottom: 8,
    },
    star: {
        fontSize: 20,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    reviewCount: {
        fontSize: 12,
        color: "#999",
    },
    reviewButton: {
        padding: "10px 20px",
        background: "linear-gradient(135deg, #FFB700 0%, #FF9500 100%)",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(255, 183, 0, 0.2)",
    },
    reviewForm: {
        background: "#f5f5f5",
        padding: 20,
        borderRadius: 12,
        marginTop: 20,
        animation: "slideInDown 0.3s ease",
    },
    ratingSection: {
        marginBottom: 16,
    },
    textarea: {
        width: "100%",
        minHeight: 100,
        padding: 12,
        borderRadius: 8,
        border: "2px solid #ddd",
        fontSize: 14,
        fontFamily: "inherit",
        resize: "vertical",
        marginBottom: 12,
        outline: "none",
        transition: "all 0.3s ease",
    },
    buttonGroup: {
        display: "flex",
        gap: 10,
    },
    submitButton: {
        flex: 1,
        padding: 12,
        background: "linear-gradient(135deg, #27ae60 0%, #229954 100%)",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        background: "#f0f0f0",
        color: "#333",
        border: "2px solid #ddd",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
};

export default ProductRating;
