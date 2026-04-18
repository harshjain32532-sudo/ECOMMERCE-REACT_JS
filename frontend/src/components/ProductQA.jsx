import { useState } from "react";

function ProductQA({ productId, qaItems = [], onAddQuestion, onAddAnswer }) {
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState("question"); // "question" or "answer"
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        question: "",
        answer: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmitQuestion = () => {
        if (formData.name && formData.question) {
            onAddQuestion({
                productId,
                name: formData.name,
                email: formData.email,
                question: formData.question,
                date: new Date().toLocaleDateString(),
                answers: 0,
                helpful: 0,
            });
            setFormData({ name: "", email: "", question: "", answer: "" });
            setShowForm(false);
            setFormType("question");
        } else {
            alert("Please fill required fields");
        }
    };

    const handleSubmitAnswer = () => {
        if (formData.name && formData.answer) {
            onAddAnswer(selectedQuestion, {
                name: formData.name,
                email: formData.email,
                answer: formData.answer,
                date: new Date().toLocaleDateString(),
                helpful: 0,
            });
            setFormData({ name: "", email: "", question: "", answer: "" });
            setShowForm(false);
            setFormType("question");
            setSelectedQuestion(null);
        } else {
            alert("Please fill required fields");
        }
    };

    const sortedQA = [...qaItems].sort((a, b) => b.helpful - a.helpful);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>❓ Questions & Answers</h2>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setFormType("question");
                        setSelectedQuestion(null);
                    }}
                    style={styles.askBtn}
                >
                    + Ask a Question
                </button>
            </div>

            {/* Ask/Answer Form */}
            {showForm && (
                <div style={styles.formContainer}>
                    <h3 style={styles.formTitle}>
                        {formType === "question" ? "❓ Ask a Question" : "✍️ Answer Question"}
                    </h3>

                    {formType === "answer" && selectedQuestion && (
                        <div style={styles.questionContext}>
                            <p style={styles.contextLabel}>Question:</p>
                            <p style={styles.contextText}>{selectedQuestion.question}</p>
                        </div>
                    )}

                    <div style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Your Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Your Name"
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
                                placeholder="your@email.com"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                {formType === "question" ? "Your Question *" : "Your Answer *"}
                            </label>
                            <textarea
                                name={formType === "question" ? "question" : "answer"}
                                value={formType === "question" ? formData.question : formData.answer}
                                onChange={handleInputChange}
                                placeholder={
                                    formType === "question"
                                        ? "Ask something about this product..."
                                        : "Share your answer with the community..."
                                }
                                style={styles.textarea}
                                rows="4"
                                maxLength="500"
                            />
                            <small style={styles.charCount}>
                                {(formType === "question" ? formData.question : formData.answer).length}/500
                            </small>
                        </div>

                        <div style={styles.formButtons}>
                            <button
                                onClick={formType === "question" ? handleSubmitQuestion : handleSubmitAnswer}
                                style={styles.submitBtn}
                            >
                                {formType === "question" ? "Post Question" : "Post Answer"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setFormData({ name: "", email: "", question: "", answer: "" });
                                }}
                                style={styles.cancelBtn}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Q&A List */}
            <div style={styles.qaList}>
                {sortedQA.length > 0 ? (
                    sortedQA.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                ...styles.qaItem,
                                animation: `slideInLeft 0.4s ease ${idx * 0.05}s both`,
                            }}
                        >
                            {/* Question */}
                            <div style={styles.question}>
                                <p style={styles.questionText}>Q: {item.question}</p>
                                <div style={styles.questionMeta}>
                                    <span style={styles.askedBy}>by {item.name}</span>
                                    <span style={styles.dot}>•</span>
                                    <span style={styles.date}>{item.date}</span>
                                    {item.answers > 0 && (
                                        <>
                                            <span style={styles.dot}>•</span>
                                            <span style={styles.answerCount}>
                                                {item.answers} {item.answers === 1 ? "answer" : "answers"}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Answers */}
                            {item.answers_list && item.answers_list.length > 0 && (
                                <div style={styles.answersSection}>
                                    {item.answers_list.map((answer, ansIdx) => (
                                        <div key={ansIdx} style={styles.answer}>
                                            <div style={styles.answerText}>
                                                A: {answer.answer}
                                            </div>
                                            <div style={styles.answerMeta}>
                                                <span style={styles.answeredBy}>by {answer.name}</span>
                                                <span style={styles.dot}>•</span>
                                                <span style={styles.date}>{answer.date}</span>
                                            </div>
                                            <div style={styles.answerActions}>
                                                <button style={styles.helpfulBtn}>
                                                    👍 Helpful ({answer.helpful})
                                                </button>
                                                <button style={styles.notHelpfulBtn}>
                                                    👎 Not Helpful
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Answer Button */}
                            <button
                                onClick={() => {
                                    setSelectedQuestion(item);
                                    setFormType("answer");
                                    setShowForm(true);
                                }}
                                style={styles.answerBtn}
                            >
                                ✍️ Answer This Question
                            </button>

                            {/* Q&A Actions */}
                            <div style={styles.qaActions}>
                                <button style={styles.helpfulBtn}>
                                    👍 Helpful ({item.helpful})
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
                        <p style={styles.emptyIcon}>💬</p>
                        <p style={styles.emptyText}>No questions yet</p>
                        <p style={styles.emptySubtext}>Be the first to ask about this product</p>
                    </div>
                )}
            </div>

            {/* Load More */}
            {sortedQA.length > 5 && (
                <button style={styles.loadMoreBtn}>
                    Load More Questions
                </button>
            )}
        </div>
    );
}

const styles = {
    container: {
        background: "white",
        padding: 25,
        borderRadius: 10,
        marginBottom: 25,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        animation: "fadeIn 0.4s ease",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottom: "2px solid #f0f0f0",
    },
    title: {
        fontSize: 18,
        fontWeight: 700,
        color: "#2c3e50",
        margin: 0,
    },
    askBtn: {
        padding: "10px 16px",
        background: "#2575fc",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 12,
        transition: "all 0.3s ease",
    },
    formContainer: {
        background: "#f9f9f9",
        padding: 20,
        borderRadius: 8,
        marginBottom: 20,
        border: "1px solid #e0e0e0",
        animation: "slideInDown 0.4s ease",
    },
    formTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#2c3e50",
        marginBottom: 15,
        margin: "0 0 15px 0",
    },
    questionContext: {
        background: "#e8f4f8",
        padding: 12,
        borderRadius: 6,
        marginBottom: 15,
        borderLeft: "4px solid #2575fc",
    },
    contextLabel: {
        fontSize: 11,
        fontWeight: 700,
        color: "#2575fc",
        margin: "0 0 4px 0",
    },
    contextText: {
        fontSize: 12,
        color: "#555",
        margin: 0,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 5,
    },
    label: {
        fontSize: 12,
        fontWeight: 700,
        color: "#2c3e50",
    },
    input: {
        padding: "10px 12px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 12,
        color: "#333",
    },
    textarea: {
        padding: "10px 12px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 12,
        color: "#333",
        fontFamily: "inherit",
        resize: "vertical",
    },
    charCount: {
        fontSize: 10,
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
        background: "#2575fc",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 12,
        transition: "all 0.3s ease",
    },
    cancelBtn: {
        flex: 1,
        padding: "12px 16px",
        background: "#f0f0f0",
        color: "#666",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 12,
        transition: "all 0.3s ease",
    },
    qaList: {
        display: "flex",
        flexDirection: "column",
        gap: 15,
    },
    qaItem: {
        background: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        border: "1px solid #f0f0f0",
    },
    question: {
        marginBottom: 12,
    },
    questionText: {
        fontSize: 13,
        fontWeight: 700,
        color: "#2c3e50",
        margin: "0 0 6px 0",
    },
    questionMeta: {
        display: "flex",
        gap: 8,
        fontSize: 11,
        color: "#999",
    },
    askedBy: {
        fontWeight: 600,
        color: "#2c3e50",
    },
    dot: {
        color: "#ddd",
    },
    date: {
        color: "#999",
    },
    answerCount: {
        color: "#2575fc",
        fontWeight: 600,
    },
    answersSection: {
        background: "#e8f4f8",
        padding: 12,
        borderRadius: 6,
        marginBottom: 12,
        borderLeft: "4px solid #2575fc",
    },
    answer: {
        background: "white",
        padding: 12,
        borderRadius: 4,
        marginBottom: 8,
    },
    answerText: {
        fontSize: 12,
        color: "#555",
        lineHeight: 1.5,
        marginBottom: 8,
    },
    answerMeta: {
        display: "flex",
        gap: 8,
        fontSize: 10,
        color: "#999",
        marginBottom: 8,
    },
    answeredBy: {
        fontWeight: 600,
        color: "#2c3e50",
    },
    answerActions: {
        display: "flex",
        gap: 8,
    },
    answerBtn: {
        width: "100%",
        padding: "10px 12px",
        background: "#e8f4f8",
        border: "1px solid #2575fc",
        color: "#2575fc",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 11,
        marginBottom: 10,
        transition: "all 0.3s ease",
    },
    qaActions: {
        display: "flex",
        gap: 8,
    },
    helpfulBtn: {
        flex: 1,
        padding: "8px 10px",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 10,
        fontWeight: 600,
        color: "#555",
        transition: "all 0.3s ease",
    },
    notHelpfulBtn: {
        flex: 1,
        padding: "8px 10px",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 10,
        fontWeight: 600,
        color: "#555",
        transition: "all 0.3s ease",
    },
    reportBtn: {
        flex: 1,
        padding: "8px 10px",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 10,
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
        fontSize: 13,
        fontWeight: 600,
        color: "#2c3e50",
        margin: "10px 0",
    },
    emptySubtext: {
        fontSize: 11,
        margin: 0,
    },
    loadMoreBtn: {
        width: "100%",
        padding: "12px 16px",
        background: "#f0f0f0",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 12,
        marginTop: 15,
        transition: "all 0.3s ease",
    },
};

export default ProductQA;
