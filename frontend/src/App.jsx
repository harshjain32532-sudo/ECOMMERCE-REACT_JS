import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import RegisterOTP from "./pages/RegisterOTP.jsx";
import OTPVerification from "./pages/OTPVerification.jsx";
import OTPPasswordSetup from "./pages/OTPPasswordSetup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Admin from "./pages/Admin.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Orders from "./pages/Orders.jsx";
import Profile from "./pages/Profile.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import { getCart, saveCart, getWishlist, addToWishlist, removeFromWishlist, getProfile } from "./api.js";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [userRole, setUserRole] = useState(localStorage.getItem("role") || "user");
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [cartLoaded, setCartLoaded] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (!token && savedCart) {
            setCart(JSON.parse(savedCart));
        }
        setCartLoaded(true);
    }, [token]);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const loadRole = async () => {
            const storedRole = localStorage.getItem("role");
            if (token && storedRole) {
                setUserRole(storedRole);
                return;
            }
            if (!token) {
                setUserRole("user");
                return;
            }
            try {
                const profileRes = await getProfile();
                setUserRole(profileRes.data.role || "user");
                localStorage.setItem("role", profileRes.data.role || "user");
            } catch (err) {
                console.error("Failed to load user role", err);
                setUserRole("user");
            }
        };
        loadRole();
    }, [token]);

    useEffect(() => {
        const loadServerData = async () => {
            if (!token) {
                const savedWishlist = localStorage.getItem("wishlist");
                if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
                return;
            }

            try {
                const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
                const cartRes = await getCart();
                const serverCart = cartRes.data || [];
                const mergedCart = [...serverCart];
                savedCart.forEach(item => {
                    const existing = mergedCart.find(i => i.productId === item.productId || i._id === item._id);
                    if (existing) {
                        existing.quantity = Math.max(existing.quantity || 0, item.quantity || 0);
                    } else {
                        mergedCart.push({
                            productId: item.productId || item._id,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                            quantity: item.quantity || 1,
                        });
                    }
                });
                setCart(mergedCart.map(item => ({ ...item, _id: item.productId || item._id })));
                await saveCart(mergedCart);
            } catch (err) {
                console.error("Failed to load server cart", err);
            }

            try {
                const wishlistRes = await getWishlist();
                setWishlist(wishlistRes.data || []);
            } catch (err) {
                console.error("Failed to load wishlist", err);
            }
        };
        loadServerData();
    }, [token]);

    useEffect(() => {
        if (!token) {
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
        }
    }, [wishlist, token]);

    const handleLogin = (newToken, role = "user") => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("role", role);
        setToken(newToken);
        setUserRole(role);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setToken(null);
        setUserRole("user");
        setWishlist([]);
    };

    const addToCart = (product) => {
        const productId = product.productId || product._id;
        const existing = cart.find(item => item.productId === productId || item._id === productId);
        const nextCart = existing
            ? cart.map(item =>
                (item.productId === productId || item._id === productId)
                    ? { ...item, quantity: (item.quantity || 1) + 1 }
                    : item
            )
            : [...cart, { productId, _id: productId, name: product.name, price: product.price, image: product.image, quantity: 1 }];
        setCart(nextCart);
        if (token) saveCart(nextCart.map(({ _id, ...rest }) => ({ ...rest, productId: _id }))).catch(console.error);
    };

    const removeFromCart = (productId) => {
        const nextCart = cart.filter(item => item.productId !== productId && item._id !== productId);
        setCart(nextCart);
        if (token) saveCart(nextCart.map(({ _id, ...rest }) => ({ ...rest, productId: _id }))).catch(console.error);
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const nextCart = cart.map(item =>
            (item.productId === productId || item._id === productId) ? { ...item, quantity } : item
        );
        setCart(nextCart);
        if (token) saveCart(nextCart.map(({ _id, ...rest }) => ({ ...rest, productId: _id }))).catch(console.error);
    };

    const addToWishlistHandler = async (product) => {
        const productId = product.productId || product._id;
        const item = {
            productId,
            name: product.name,
            price: product.price,
            image: product.image,
        };
        const exists = wishlist.find(w => w.productId === productId || w._id === productId);

        if (token) {
            try {
                if (exists) {
                    const res = await removeFromWishlist(productId);
                    setWishlist(res.data);
                } else {
                    const res = await addToWishlist(item);
                    setWishlist(res.data);
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            if (exists) {
                const next = wishlist.filter(w => w.productId !== productId && w._id !== productId);
                setWishlist(next);
                localStorage.setItem("wishlist", JSON.stringify(next));
            } else {
                const next = [...wishlist, item];
                setWishlist(next);
                localStorage.setItem("wishlist", JSON.stringify(next));
            }
        }
    };

    const removeFromWishlistHandler = async (productId) => {
        if (token) {
            try {
                const res = await removeFromWishlist(productId);
                setWishlist(res.data);
            } catch (err) {
                console.error(err);
            }
        } else {
            const next = wishlist.filter(item => item.productId !== productId && item._id !== productId);
            setWishlist(next);
            localStorage.setItem("wishlist", JSON.stringify(next));
        }
    };

    return (
        <BrowserRouter>
            <Header
                cartCount={cart.length}
                wishlistCount={wishlist.length}
                isLoggedIn={Boolean(token)}
                isAdmin={userRole === "admin"}
                onLogout={handleLogout}
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<RegisterOTP onLogin={handleLogin} />} />
                <Route path="/register/basic" element={<Register onLogin={handleLogin} />} />
                <Route path="/otp-verify" element={<OTPVerification />} />
                <Route path="/otp-password" element={<OTPPasswordSetup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin-panel" element={<AdminPanel />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
        </BrowserRouter>
    );
}
export default App;
