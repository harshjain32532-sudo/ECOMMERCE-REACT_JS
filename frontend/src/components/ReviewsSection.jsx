import { useState } from "react";

function ReviewsSection({ productId, reviews = [], onAddReview, avgRating = 4.5, totalReviews = 120 }) {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [filterRating, setFilterRating] = useState(null);
    const [sortBy, setSortBy] = useState("helpful");
    const [formData, setFormData] = useState({
        rating: 5,
        title: "",
        comment: "",
        name: "",
        email: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (formData.title && formData.comment && formData.name) {
            onAddReview({
                ...formData,
                productId,
                createdAt: new Date().toLocaleDateString(),
                helpful: 0,
                images: [],
            });
            setFormData({
                rating: 5,
                title: "",
                comment: "",
                name: "",
                email: "",
            });
            setShowReviewForm(false);
            alert("Thank you! Your review has been submitted.");
        } else {
            alert("Please fill all required fields");
        }
    };

    const filteredReviews = filterRating
        ? reviews.filter(r => r.rating === filterRating)
        : reviews;

    const sortedReviews = [...filteredReviews].sort((a, b) => {
        if (sortBy === "helpful") return (b.helpful || 0) - (a.helpful || 0);
        if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === "highest") return b.rating - a.rating;
        if (sortBy === "lowest") return a.rating - b.rating;
        return 0;
    });

    const ratingDistribution = {
        5: Math.floor(totalReviews * 0.50),
        4: Math.floor(totalReviews * 0.25),
        3: Math.floor(totalReviews * 0.15),
        2: Math.floor(totalReviews * 0.07),
        1: Math.floor(totalReviews * 0.03),
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>⭐ Customer Reviews & Ratings</h2>

            <div style={styles.ratingsSummary}>
                {/* Overall Rating */}
                <div style={styles.ratingCard}>
                    <div style={styles.ratingNumber}>{avgRating}</div>
                    <div style={styles.ratingStars}>
                        {"★".repeat(Math.floor(avgRating))}
                        {avgRating % 1 ? "☆" : ""}
                    </div>
                    <p style={styles.ratingText}>{totalReviews} verified reviews</p>
                </div>

                {/* Rating Distribution */}
                <div style={styles.ratingDistribution}>
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <div
                            key={rating}
                            style={styles.ratingRow}
                            onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                        >
                            <span style={styles.ratingLabel}>{rating} ★</span>
                            <div style={styles.barContainer}>
                                <div
                                    style={{
                                        ...styles.bar,
                                        width: `${(ratingDistribution[rating] / totalReviews) * 100}%`,
                                        cursor: "pointer",
                                    }}
                                />
                            </div>
                            <span style={styles.ratingCount}>{ratingDistribution[rating]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Write Review Button */}
            {!showReviewForm && (
                <button
                    onClick={() => setShowReviewForm(true)}
                    style={styles.writeReviewBtn}
                >
                    ✍️ Write a Review
                </button>
            )}

            {/* Write Review Form */}
            {showReviewForm && (
                <div style={styles.reviewFormContainer}>
                    <h3 style={styles.formTitle}>Share Your Experience</h3>
                    <form onSubmit={handleSubmitReview} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Rating *</label>
                            <div style={styles.ratingSelector}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        style={{
                                            ...styles.star,
                                            color: star <= formData.rating ? "#FFD700" : "#ddd",
                                            cursor: "pointer",
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Review Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Summarize your experience"
                                style={styles.input}
                                maxLength="60"
                            />
                            <small style={styles.charCount}>{formData.title.length}/60</small>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Your Review *</label>
                            <textarea
                                name="comment"
                                value={formData.comment}
                                onChange={handleInputChange}
                                placeholder="Share details about your experience with this product"
                                style={styles.textarea}
                                rows="5"
                                maxLength="500"
                            />
                            <small style={styles.charCount}>{formData.comment.length}/500</small>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Your Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="john@example.com"
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.formButtons}>
                            <button type="submit" style={styles.submitBtn}>
                                Submit Review
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowReviewForm(false)}
                                style={styles.cancelBtn}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews Filters */}
            <div style={styles.filtersBar}>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Sort by:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={styles.select}
                    >
                        <option value="helpful">Most Helpful</option>
                        <option value="newest">Newest</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>

                {filterRating && (
                    <button
                        onClick={() => setFilterRating(null)}
                        style={styles.clearFilterBtn}
                    >
                        ✕ Clear Filter
                    </button>
                )}
            </div>

            {/* Reviews List */}
            <div style={styles.reviewsList}>
                {sortedReviews.length > 0 ? (
                    sortedReviews.map((review, idx) => (
                        <div
                            key={idx}
                            style={{
                                ...styles.reviewCard,
                                animation: `slideInLeft 0.4s ease ${idx * 0.05}s both`,
                            }}
                        >
                            {/* Review Header */}
                            <div style={styles.reviewHeader}>
                                <div>
                                    <div style={styles.reviewRating}>
                                        {"★".repeat(review.rating)}
                                        {"☆".repeat(5 - review.rating)}
                                    </div>
                                    <h4 style={styles.reviewTitle}>{review.title}</h4>
                                </div>
                            </div>

                            {/* Review Body */}
                            <p style={styles.reviewComment}>{review.comment}</p>

                            {/* Review Meta */}
                            <div style={styles.reviewMeta}>
                                <span style={styles.reviewer}>by <strong>{review.name}</strong></span>
                                <span style={styles.dot}>•</span>
                                <span style={styles.date}>{review.createdAt}</span>
                                <span style={styles.dot}>•</span>
                                <span style={styles.verified}>✓ Verified Purchase</span>
                            </div>

                            {/* Review Actions */}
                            <div style={styles.reviewActions}>
                                <button style={styles.helpfulBtn}>
                                    👍 Helpful ({review.helpful || 0})
                                </button>
                                <button style={styles.notHelpfulBtn}>
                                    👎 Not Helpful
                                </button>
                                <button style={styles.reportBtn}>
                                    🚩 Report
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyIcon}>💭</p>
                        <p style={styles.emptyText}>No reviews yet</p>
                        <p style={styles.emptySubtext}>Be the first to share your thoughts about this product</p>
                    </div>
                )}
            </div>

            {/* Load More Reviews */}
            {sortedReviews.length > 5 && (
                <button style={styles.loadMoreBtn}>
                    Load More Reviews
                </button>
            )}
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        padding: 30,
        borderRadius: 10,
        marginBottom: 30,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        animation: "fadeIn 0.5s ease",
    },
    title: {
        fontSize: 20,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 25,
        margin: "0 0 25px 0",
    },
    ratingsSummary: {
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        gap: 30,
        padding: "20px 0",
        borderBottom: "1px solid #f0f0f0",
        marginBottom: 20,
    },
    ratingCard: {
        textAlign: "center",
        padding: 20,
        background: "#f9f9f9",
        borderRadius: 10,
        border: "1px solid #f0f0f0",
    },
    ratingNumber: {
        fontSize: 32,
        fontWeight: 700,
        color: "#FFB700",
        margin: 0,
    },
    ratingStars: {
        fontSize: 16,
        color: "#FFB700",
        margin: "5px 0",
    },
    ratingText: {
        fontSize: 12,
        color: "#999",
        margin: "5px 0 0 0",
    },
    ratingDistribution: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    ratingRow: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        padding: "4px 0",
        transition: "all 0.3s ease",
    },
    ratingLabel: {
        fontSize: 12,
        fontWeight: 600,
        minWidth: 50,
        color: "#666",
    },
    barContainer: {
        flex: 1,
        height: 6,
        background: "#e0e0e0",
        borderRadius: 3,
        overflow: "hidden",
    },
    bar: {
        height: "100%",
        background: "linear-gradient(90deg, #FFB700, #FFA500)",
        borderRadius: 3,
        transition: "all 0.3s ease",
    },
    ratingCount: {
        fontSize: 12,
        color: "#999",
        minWidth: 40,
        textAlign: "right",
    },
    writeReviewBtn: {
        width: "100%",
        padding: "14px 20px",
        background: "linear-gradient(135deg, #2575fc 0%, #1e5dcc 100%)",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 14,
        transition: "all 0.3s ease",
        marginBottom: 20,
    },
    reviewFormContainer: {
        background: "#f9f9f9",
        padding: 20,
        borderRadius: 8,
        marginBottom: 20,
        border: "1px solid #e0e0e0",
        animation: "slideInDown 0.4s ease",
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 15,
        margin: "0 0 15px 0",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 15,
    },
    formRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 15,
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 5,
    },
    label: {
        fontSize: 13,
        fontWeight: 600,
        color: "#2c3e50",
    },
    ratingSelector: {
        display: "flex",
        gap: 8,
        fontSize: 28,
    },
    star: {
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    input: {
        padding: "10px 12px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 13,
        color: "#333",
    },
    textarea: {
        padding: "10px 12px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 13,
        color: "#333",
        fontFamily: "inherit",
        resize: "vertical",
    },
    charCount: {
        fontSize: 11,
        color: "#999",
        textAlign: "right",
    },
    formButtons: {
        display: "flex",
        gap: 10,
        marginTop: 10,
    },
    submitBtn: {
        flex: 1,
        padding: "12px 16px",
        background: "#27ae60",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    cancelBtn: {
        flex: 1,
        padding: "12px 16px",
        background: "#f0f0f0",
        color: "#333",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    filtersBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottom: "1px solid #f0f0f0",
    },
    filterGroup: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: 600,
        color: "#555",
    },
    select: {
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 12,
        cursor: "pointer",
    },
    clearFilterBtn: {
        padding: "8px 12px",
        background: "#f0f0f0",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        transition: "all 0.3s ease",
    },
    reviewsList: {
        display: "flex",
        flexDirection: "column",
        gap: 15,
        marginBottom: 20,
    },
    reviewCard: {
        background: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        border: "1px solid #f0f0f0",
        transition: "all 0.3s ease",
    },
    reviewHeader: {
        marginBottom: 10,
    },
    reviewRating: {
        fontSize: 14,
        color: "#FFB700",
        fontWeight: 700,
    },
    reviewTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "5px 0",
    },
    reviewComment: {
        fontSize: 13,
        color: "#555",
        lineHeight: 1.6,
        marginBottom: 10,
    },
    reviewMeta: {
        display: "flex",
        gap: 8,
        fontSize: 12,
        color: "#999",
        marginBottom: 10,
    },
    reviewer: {
        fontWeight: 600,
        color: "#2c3e50",
    },
    dot: {
        color: "#ddd",
    },
    date: {
        color: "#999",
    },
    verified: {
        color: "#27ae60",
        fontWeight: 600,
    },
    reviewActions: {
        display: "flex",
        gap: 10,
    },
    helpfulBtn: {
        padding: "6px 12px",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        color: "#555",
        transition: "all 0.3s ease",
    },
    notHelpfulBtn: {
        padding: "6px 12px",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        color: "#555",
        transition: "all 0.3s ease",
    },
    reportBtn: {
        padding: "6px 12px",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        color: "#e74c3c",
        transition: "all 0.3s ease",
    },
    emptyState: {
        textAlign: "center",
        padding: 30,
        color: "#999",
    },
    emptyIcon: {
        fontSize: 32,
        margin: "0 0 10px 0",
    },
    emptyText: {
        fontSize: 14,
        fontWeight: 600,
        color: "#2c3e50",
        margin: "10px 0",
    },
    emptySubtext: {
        fontSize: 12,
        margin: 0,
    },
    loadMoreBtn: {
        width: "100%",
        padding: "12px 20px",
        background: "#f0f0f0",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 13,
        transition: "all 0.3s ease",
    },
};

export default ReviewsSection;
