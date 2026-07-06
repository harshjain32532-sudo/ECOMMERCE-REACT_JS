import React, { useState } from "react";
import "../styles/ProductFilters.css";

function ProductFilters({ categories, maxPrice, onFilterChange, onSortChange, currentFilters }) {
    const [showFilters, setShowFilters] = useState(true);

    const handleCategoryChange = (category) => {
        const newCategories = currentFilters.categories.includes(category)
            ? currentFilters.categories.filter(c => c !== category)
            : [...currentFilters.categories, category];
        onFilterChange({ ...currentFilters, categories: newCategories });
    };

    const handlePriceChange = (e) => {
        onFilterChange({ ...currentFilters, priceRange: [0, parseInt(e.target.value)] });
    };

    const handleSortChange = (e) => {
        onSortChange(e.target.value);
    };

    return (
        <div className="product-filters-container">
            <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                ⚙️ Filters {!showFilters && "(hidden)"}
            </button>

            {showFilters && (
                <aside className="product-filters">
                    {/* Categories */}
                    <div className="filter-group">
                        <h3 className="filter-title">Categories</h3>
                        <div className="filter-options">
                            {categories.map(category => (
                                <label key={category} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={currentFilters.categories.includes(category)}
                                        onChange={() => handleCategoryChange(category)}
                                    />
                                    <span>{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="filter-group">
                        <h3 className="filter-title">Price Range</h3>
                        <input
                            type="range"
                            min="0"
                            max={maxPrice}
                            step="1000"
                            value={currentFilters.priceRange[1]}
                            onChange={handlePriceChange}
                            className="price-slider"
                        />
                        <div className="price-display">
                            Up to ₹{currentFilters.priceRange[1].toLocaleString()}
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="filter-group">
                        <h3 className="filter-title">Sort By</h3>
                        <select onChange={handleSortChange} className="sort-select">
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                            <option value="popular">Most Popular</option>
                        </select>
                    </div>

                    {/* Reset Filters */}
                    <button
                        className="reset-filters"
                        onClick={() => {
                            onFilterChange({ categories: [], priceRange: [0, maxPrice] });
                            onSortChange("newest");
                        }}
                    >
                        Reset Filters
                    </button>
                </aside>
            )}
        </div>
    );
}

export default ProductFilters;
