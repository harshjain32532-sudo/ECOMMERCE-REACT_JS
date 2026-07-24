import React from "react";
import "../styles/Pagination.css";

function Pagination({ currentPage, totalPages, onPageChange }) {
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const adjustedStartPage = Math.max(1, endPage - maxPagesToShow + 1);

    const pages = Array.from(
        { length: Math.min(maxPagesToShow, totalPages) },
        (_, i) => adjustedStartPage + i
    );

    return (
        <div className="pagination-container">
            <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                ← Previous
            </button>

            {adjustedStartPage > 1 && (
                <>
                    <button className="pagination-btn" onClick={() => onPageChange(1)}>
                        1
                    </button>
                    {adjustedStartPage > 2 && <span className="pagination-dots">...</span>}
                </>
            )}

            {pages.map(page => (
                <button
                    key={page}
                    className={`pagination-btn ${page === currentPage ? "active" : ""}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
                    <button className="pagination-btn" onClick={() => onPageChange(totalPages)}>
                        {totalPages}
                    </button>
                </>
            )}

            <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next →
            </button>
        </div>
    );
}

export default Pagination;
