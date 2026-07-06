import { useEffect, useState } from "react";
import axios from "axios";
import Hero from "../components/Hero.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductFilters from "../components/ProductFilters.jsx";
import Pagination from "../components/Pagination.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/Products.css";

function Home() {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [maxPrice, setMaxPrice] = useState(100000);
    const [filters, setFilters] = useState({
        categories: [],
        priceRange: [0, 100000]
    });

    const ITEMS_PER_PAGE = 12;

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:5000/products");
                const productsData = res.data.map(p => ({
                    ...p,
                    rating: Math.floor(Math.random() * 5) + 1,
                    reviews: Math.floor(Math.random() * 500) + 10,
                    originalPrice: p.price * 1.2,
                    category: p.category || "Electronics",
                    stock: Math.floor(Math.random() * 20) + 1
                }));
                setAllProducts(productsData);

                const highestPrice = Math.max(...productsData.map(p => p.price), 100000);
                setMaxPrice(highestPrice);
                setFilters(prev => ({ ...prev, priceRange: [0, highestPrice] }));
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Apply filters and sorting
    useEffect(() => {
        let result = [...allProducts];

        // Apply category filter
        if (filters.categories.length > 0) {
            result = result.filter(p => filters.categories.includes(p.category));
        }

        // Apply price filter
        result = result.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

        // Apply sorting
        switch (sortBy) {
            case "price-low":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-high":
                result.sort((a, b) => b.price - a.price);
                break;
            case "rating":
                result.sort((a, b) => b.rating - a.rating);
                break;
            case "popular":
                result.sort((a, b) => b.reviews - a.reviews);
                break;
            case "newest":
            default:
                result.reverse();
                break;
        }

        setFilteredProducts(result);
        setCurrentPage(1);
    }, [allProducts, filters, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const displayedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Get unique categories
    const categories = [...new Set(allProducts.map(p => p.category))];

    const handleAddToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existingItem = cart.find(item => item._id === product._id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`${product.name} added to cart!`);
    };

    return (
        <div>
            <Hero />

            <div className="products-container">
                <div className="products-header">
                    <h2 className="products-title">Shop Our Collection</h2>
                    <div className="products-count">
                        {filteredProducts.length} products found
                    </div>
                </div>

                <div className="products-layout">
                    <ProductFilters
                        categories={categories}
                        maxPrice={maxPrice}
                        onFilterChange={setFilters}
                        onSortChange={setSortBy}
                        currentFilters={filters}
                    />

                    <div className="products-grid-wrapper">
                        {loading ? (
                            <div className="loading-state">Loading products...</div>
                        ) : displayedProducts.length > 0 ? (
                            <div className="products-grid">
                                {displayedProducts.map(product => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                        onViewDetails={() => console.log(product)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📭</div>
                                <div className="empty-state-text">
                                    No products found. Try adjusting your filters.
                                </div>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Home;
