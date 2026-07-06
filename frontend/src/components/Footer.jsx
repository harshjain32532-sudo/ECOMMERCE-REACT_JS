import React from "react";
import "../styles/Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>About Us</h3>
                    <p>Your one-stop shop for premium electronics and home essentials at unbeatable prices.</p>
                </div>

                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#products">Products</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Customer Service</h3>
                    <ul>
                        <li><a href="#help">Help Center</a></li>
                        <li><a href="#shipping">Shipping Info</a></li>
                        <li><a href="#returns">Returns</a></li>
                        <li><a href="#faq">FAQ</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Contact Info</h3>
                    <p>Email: support@embercart.com</p>
                    <p>Phone: +1 (555) 123-4567</p>
                    <p>Address: 123 Tech Street, Silicon Valley, CA</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2024 EmberCart. All rights reserved.</p>
                <div className="footer-links">
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#terms">Terms of Service</a>
                    <a href="#cookies">Cookie Policy</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
