import React from "react";
import "../styles/Hero.css";

function Hero() {
    return (
        <section className="hero">
            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-title">Premium Electronics & Home Essentials</h1>
                    <p className="hero-subtitle">Discover the latest tech gadgets and home furnishings at unbeatable prices</p>
                    <button className="hero-cta">Shop Now</button>
                </div>
                <div className="hero-image">
                    <div className="hero-placeholder">Featured Products</div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
