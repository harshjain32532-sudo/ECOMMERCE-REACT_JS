
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createServer } from "http";
import { Server } from "socket.io";
import { getOrderEmailTemplate, getStatusChangeMessage, formatOrderForNotification } from "./services/orderTrackingService.js";
import paymentRoutes from "./routes/payment.js";
import emailOTPRoutes from "./routes/emailOTP.js";
import authRoutes from "./routes/auth.js";
import User from "./models/user.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ],
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// CORS: allow localhost in dev, and the deployed frontend URL in production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., curl, Postman, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true); // Allow all for now; restrict after getting Vercel URL
  },
  credentials: true
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const normalizeEmail = (email) => (email || "").trim().toLowerCase();

// Email Configuration
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
});

// Send email utility function
const sendEmail = async (to, subject, html) => {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error.message);
  }
};

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String,
  stock: { type: Number, default: 10 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  category: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId: String,
  items: Array,
  total: Number,
  userEmail: String,
  status: {
    type: String,
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  statusHistory: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      message: String,
    }
  ],
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    line1: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  paymentMethod: { type: String, default: "card" },
  paymentStatus: { type: String, default: "pending", enum: ["pending", "completed", "failed"] },
  createdAt: { type: Date, default: Date.now }
});

const featuredProductSchema = new mongoose.Schema({
  productId: String,
  title: String,
  description: String,
  image: String,
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true, uppercase: true, trim: true },
  description: String,
  discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  discountValue: { type: Number, required: true },
  minPurchaseAmount: { type: Number, default: 0 },
  maxDiscountAmount: Number,
  usageLimit: Number,
  usageCount: { type: Number, default: 0 },
  expiryDate: Date,
  isActive: { type: Boolean, default: true },
  applicableCategories: [String],
  applicableProducts: [String],
  createdAt: { type: Date, default: Date.now },
  usedBy: [
    {
      userId: String,
      usedAt: Date,
    }
  ]
});

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const FeaturedProduct = mongoose.model("FeaturedProduct", featuredProductSchema);
const Coupon = mongoose.model("Coupon", couponSchema);

async function createAdminIfNeeded() {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return;
    }

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return;
    }

    const existingEmail = await User.findOne({ email: ADMIN_EMAIL });
    if (existingEmail) {
      console.log(`Admin email already registered with non-admin role: ${ADMIN_EMAIL}`);
      return;
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const adminUser = new User({ name: "Admin", email: ADMIN_EMAIL, password: hash, role: "admin" });
    await adminUser.save();
    console.log(`Admin user created: ${ADMIN_EMAIL}`);
  } catch (err) {
    console.log("Admin setup error:", err.message);
  }
}

const connectDb = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI or MONGODB_URI must be set.");
    }
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
    await createAdminIfNeeded();
  } catch (err) {
    console.log("DB Error:", err);
  }
};

connectDb();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    if (user.role !== "admin") {
      console.log(`Access denied for user ${req.userId} with role: ${user.role}`);
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (err) {
    console.error("Admin verification error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Auth Routes
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const normalizedEmail = normalizeEmail(email);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const adminEmails = (process.env.ADMIN_EMAIL || "").split(",").map(e => normalizeEmail(e)).filter(Boolean);
    const isFirstUser = await User.countDocuments() === 0;
    const role = adminEmails.length > 0
      ? adminEmails.includes(normalizedEmail) ? "admin" : "user"
      : isFirstUser ? "admin" : "user";
    const user = new User({ name: name || "", email: normalizedEmail, password: hash, role });
    await user.save();
    res.json({ message: "User created", user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, role: user.role, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/setup-admin", async (req, res) => {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return res.status(400).json({ error: "ADMIN_EMAIL and ADMIN_PASSWORD are not configured." });
    }

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(400).json({ error: "An admin user already exists." });
    }

    const existingEmail = await User.findOne({ email: ADMIN_EMAIL });
    if (existingEmail) {
      return res.status(400).json({ error: "Admin email is already registered with a different role." });
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const adminUser = new User({ name: "Admin", email: ADMIN_EMAIL, password: hash, role: "admin" });
    await adminUser.save();
    res.json({ message: "Admin user created.", user: { id: adminUser._id, email: adminUser.email, role: adminUser.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/user/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/user/profile", verifyToken, async (req, res) => {
  try {
    const { name, email, shippingAddress, addresses } = req.body;
    const update = { name };

    if (shippingAddress) {
      update.shippingAddress = shippingAddress;
    }

    if (addresses && Array.isArray(addresses)) {
      update.addresses = addresses;
    }

    if (email) {
      const normalizedEmail = normalizeEmail(email);
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: req.userId } });
      if (existing) return res.status(400).json({ error: "Email already in use" });
      update.email = normalizedEmail;
    }

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select("-password -resetPasswordToken -resetPasswordExpires");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/user/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Current and new password required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/cart", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user.cart || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/cart", verifyToken, async (req, res) => {
  try {
    const { cart } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { cart: cart || [] }, { new: true });
    res.json(user.cart || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/wishlist", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/wishlist", verifyToken, async (req, res) => {
  try {
    const { item } = req.body;
    const user = await User.findById(req.userId);
    user.wishlist = user.wishlist || [];
    const exists = user.wishlist.find(w => w.productId === item.productId);
    if (!exists) {
      user.wishlist.push(item);
      await user.save();
    }
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/wishlist/:productId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.wishlist = (user.wishlist || []).filter(w => w.productId !== req.params.productId);
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const orders = await Order.find();
    const ordersCount = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    res.json({ usersCount, productsCount, ordersCount, totalSales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/customers", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const customers = await User.find({ role: "user" }).select("name email phone shippingAddress createdAt").sort({ createdAt: -1 }).lean();

    // Enrich with order statistics
    const enrichedCustomers = await Promise.all(customers.map(async (customer) => {
      const orders = await Order.find({ userId: customer._id }).lean();
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

      return {
        ...customer,
        totalOrders,
        totalSpent
      };
    }));

    res.json(enrichedCustomers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/customers", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const normalizedEmail = normalizeEmail(email);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const customer = new User({ name: name || "", email: normalizedEmail, password: hash, role: "user" });
    await customer.save();
    res.json({ message: "Customer created", customer: { id: customer._id, email: customer.email, name: customer.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all orders with customer details
app.get("/admin/orders", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with customer info
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const customer = await User.findById(order.userId).select("name email phone").lean();
      return {
        ...order,
        customerName: customer?.name || "Unknown",
        email: customer?.email || "N/A"
      };
    }));

    res.json(enrichedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all product orders (with product details)
app.get("/admin/product-orders", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    // Flatten orders into individual product orders
    const productOrders = [];
    for (const order of orders) {
      const customer = await User.findById(order.userId).select("name email phone").lean();

      // Each item in the order becomes a product order entry
      order.items.forEach((item, index) => {
        productOrders.push({
          orderId: order._id,
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
          productId: item.id || item._id,
          productName: item.name,
          productPrice: item.price,
          quantity: item.quantity || 1,
          itemTotal: (item.price || 0) * (item.quantity || 1),
          totalOrderPrice: order.total,
          status: order.status,
          customerName: customer?.name || "Unknown",
          email: customer?.email || "N/A",
          phone: customer?.phone || "N/A",
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          estimatedDelivery: order.estimatedDelivery,
          trackingNumber: order.trackingNumber || "N/A"
        });
      });
    }

    res.json(productOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update order status
app.put("/admin/orders/:orderId/status", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, message } = req.body;

    if (!status) return res.status(400).json({ error: "Status required" });

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: Date.now(),
      message: message || `Order status changed to ${status}`
    });
    await order.save();

    // Emit real-time update via socket.io
    io.emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.status,
      customerEmail: order.userEmail,
      message: message || `Order status changed to ${status}`
    });

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get delivery tracking information
app.get("/admin/delivery-tracking", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ status: "delivered" })
      .sort({ updatedAt: -1 })
      .lean();

    // Create delivery tracking records
    const deliveryTracking = [];
    for (const order of orders) {
      const customer = await User.findById(order.userId).select("name email phone").lean();

      order.items.forEach((item, idx) => {
        deliveryTracking.push({
          orderId: order._id,
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
          productId: item.id || item._id,
          productName: item.name,
          quantity: item.quantity || 1,
          price: item.price,
          customerName: customer?.name || "Unknown",
          email: customer?.email || "N/A",
          phone: customer?.phone || "N/A",
          deliveredAt: order.updatedAt,
          estimatedDelivery: order.estimatedDelivery,
          trackingNumber: order.trackingNumber || "N/A",
          shippingAddress: order.shippingAddress,
          status: order.status
        });
      });
    }

    res.json(deliveryTracking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update delivery date
app.put("/admin/delivery/:orderId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveredAt, trackingNumber } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        updatedAt: deliveredAt || Date.now(),
        ...(trackingNumber && { trackingNumber })
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ message: "Delivery information updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`;
    console.log("Password reset link:", resetUrl);

    res.json({ message: "Password reset link created", resetUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DEBUG: list users (remove in production)
app.get("/debug/users", async (req, res) => {
  try {
    const users = await User.find({}, "email role").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/debug/routes", (req, res) => {
  const routes = app._router.stack
    .filter(layer => layer.route)
    .map(layer => {
      const methods = Object.keys(layer.route.methods).join(",");
      return { path: layer.route.path, methods };
    });
  res.json(routes);
});

app.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password required" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired reset token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Product Routes
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/products", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const p = new Product(req.body);
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/products/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/products/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Featured Products Routes
app.get("/featured-products", async (req, res) => {
  try {
    const featured = await FeaturedProduct.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json(featured);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/featured-products/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const featured = await FeaturedProduct.find().sort({ displayOrder: 1 });
    res.json(featured);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/featured-products", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const featured = new FeaturedProduct(req.body);
    await featured.save();
    res.status(201).json(featured);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/featured-products/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const featured = await FeaturedProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(featured);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/featured-products/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await FeaturedProduct.findByIdAndDelete(req.params.id);
    res.json({ message: "Featured product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Order Routes
app.post("/orders", verifyToken, async (req, res) => {
  try {
    const order = new Order({ ...req.body, userId: req.userId });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/orders/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/orders/:id", verifyToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;
    const oldOrder = await Order.findById(orderId);

    if (!oldOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Authorization check - only admin or order owner can update
    if (oldOrder.userId !== req.userId) {
      const user = await User.findById(req.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    // Handle status updates with notifications
    if (updateData.status && updateData.status !== oldOrder.status) {
      const oldStatus = oldOrder.status;
      const newStatus = updateData.status;

      // Add to status history
      if (!updateData.statusHistory) {
        updateData.statusHistory = oldOrder.statusHistory || [];
      }

      updateData.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        message: getStatusChangeMessage(oldStatus, newStatus)
      });

      // Send email notification
      const emailTemplate = getOrderEmailTemplate(newStatus, { ...oldOrder.toObject(), ...updateData });
      if (emailTemplate && oldOrder.userEmail) {
        await sendEmail(
          oldOrder.userEmail,
          emailTemplate.subject,
          emailTemplate.html
        );
      }

      // Broadcast via WebSocket to all connected clients
      const notificationData = formatOrderForNotification({ ...oldOrder.toObject(), ...updateData });
      io.emit('order:updated', {
        orderId,
        userId: oldOrder.userId,
        oldStatus,
        newStatus,
        timestamp: new Date(),
        order: notificationData,
        message: getStatusChangeMessage(oldStatus, newStatus)
      });

      // Also emit to a room for this specific user
      io.to(`user:${oldOrder.userId}`).emit('user:order:updated', notificationData);

      console.log(`Order ${orderId} status changed: ${oldStatus} -> ${newStatus}`);
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SMS & OTP Routes
// Initialize OTP storage (in production, use Redis or database)
const otpStorage = new Map();

// Send OTP via SMS
app.post("/otp/send", async (req, res) => {
  try {
    const { phone, provider = "twilio" } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });

    // Validate phone number (10 digits for India)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanedPhone = phone.replace(/\D/g, "");
    if (!phoneRegex.test(cleanedPhone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 3-minute expiry
    const phoneKey = `otp_${cleanedPhone}`;
    otpStorage.set(phoneKey, { otp, provider, timestamp: Date.now(), attempts: 0 });

    // Clean up expired OTPs after 3 minutes
    setTimeout(() => {
      if (otpStorage.has(phoneKey)) {
        otpStorage.delete(phoneKey);
      }
    }, 180000);

    console.log(`OTP sent to ${cleanedPhone} via ${provider}: ${otp}`);

    res.json({
      message: "OTP sent successfully",
      maskedPhone: `${cleanedPhone.slice(0, 2)}${"*".repeat(5)}${cleanedPhone.slice(7)}`,
      provider
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
app.post("/otp/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP required" });

    const cleanedPhone = phone.replace(/\D/g, "");
    const phoneKey = `otp_${cleanedPhone}`;

    const storedData = otpStorage.get(phoneKey);
    if (!storedData) return res.status(400).json({ error: "OTP expired or not sent" });

    // Check max attempts (3)
    if (storedData.attempts >= 3) {
      otpStorage.delete(phoneKey);
      return res.status(400).json({ error: "Max verification attempts exceeded" });
    }

    if (storedData.otp !== otp.toString()) {
      storedData.attempts++;
      return res.status(400).json({ error: `Invalid OTP. ${3 - storedData.attempts} attempts remaining` });
    }

    // OTP verified successfully
    otpStorage.delete(phoneKey);

    res.json({
      message: "Phone verified successfully",
      phone: cleanedPhone,
      verified: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enable 2FA method
app.post("/user/2fa/enable", verifyToken, async (req, res) => {
  try {
    const { method } = req.body; // method: sms, email, authenticator, backup
    if (!["sms", "email", "authenticator", "backup"].includes(method)) {
      return res.status(400).json({ error: "Invalid 2FA method" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.twoFactorMethods[method] = true;
    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: `2FA ${method} enabled`, twoFactorEnabled: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Disable 2FA method
app.post("/user/2fa/disable", verifyToken, async (req, res) => {
  try {
    const { method } = req.body;
    if (!["sms", "email", "authenticator", "backup"].includes(method)) {
      return res.status(400).json({ error: "Invalid 2FA method" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.twoFactorMethods[method] = false;

    // Check if any method is still enabled
    const anyMethodEnabled = Object.values(user.twoFactorMethods).some(v => v);
    user.twoFactorEnabled = anyMethodEnabled;

    await user.save();

    res.json({ message: `2FA ${method} disabled`, twoFactorEnabled: user.twoFactorEnabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get 2FA status
app.get("/user/2fa/status", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("phone phoneVerified twoFactorEnabled twoFactorMethods");
    res.json({
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      methods: user.twoFactorMethods
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update phone number
app.post("/user/phone/update", verifyToken, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanedPhone = phone.replace(/\D/g, "");
    if (!phoneRegex.test(cleanedPhone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const user = await User.findById(req.userId);
    user.phone = cleanedPhone;
    user.phoneVerified = false;
    await user.save();

    res.json({ message: "Phone number updated", phone: cleanedPhone, phoneVerified: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== EMAIL PREFERENCES ENDPOINTS ==========
// Get email preferences
app.get("/user/email-preferences", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("emailPreferences");
    res.json(user?.emailPreferences || {
      marketing: true,
      orderUpdates: true,
      promotions: true,
      reviews: false,
      newsletter: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update email preferences
app.put("/user/email-preferences", verifyToken, async (req, res) => {
  try {
    const { marketing, orderUpdates, promotions, reviews, newsletter } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        emailPreferences: {
          marketing: marketing !== undefined ? marketing : true,
          orderUpdates: orderUpdates !== undefined ? orderUpdates : true,
          promotions: promotions !== undefined ? promotions : true,
          reviews: reviews !== undefined ? reviews : false,
          newsletter: newsletter !== undefined ? newsletter : true,
        }
      },
      { new: true }
    ).select("emailPreferences");
    res.json(user.emailPreferences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== COUPON ENDPOINTS ==========
// Apply coupon to order
app.post("/coupons/apply", verifyToken, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ error: "Coupon code required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(400).json({ error: "Invalid or inactive coupon" });

    // Check expiry date
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    // Check minimum purchase amount
    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({
        error: `Minimum purchase of ₹${coupon.minPurchaseAmount} required for this coupon`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalTotal: Math.max(0, cartTotal - discountAmount)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active coupons
app.get("/coupons", async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: { $exists: false } }
      ]
    }).select("code description discountType discountValue minPurchaseAmount expiryDate");
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create coupon
app.post("/coupons", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== BROWSING HISTORY & RECOMMENDATIONS ==========
// Track product view
app.post("/products/:id/view", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.browsingHistory) user.browsingHistory = [];

    // Remove if exists and add to top (for recency)
    user.browsingHistory = user.browsingHistory.filter(h => h.productId !== req.params.id);
    user.browsingHistory.unshift({
      productId: req.params.id,
      viewedAt: new Date()
    });

    // Keep only last 50 views
    if (user.browsingHistory.length > 50) {
      user.browsingHistory = user.browsingHistory.slice(0, 50);
    }

    await user.save();
    res.json({ message: "View tracked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get smart recommendations
app.get("/recommendations", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const recommendations = {
      similar: [],
      browsing: [],
      category: []
    };

    // Get similar products based on recent views
    if (user.browsingHistory && user.browsingHistory.length > 0) {
      const recentProducts = await Product.find({
        _id: { $in: user.browsingHistory.slice(0, 5).map(h => h.productId) }
      });

      if (recentProducts.length > 0) {
        const categories = recentProducts.map(p => p.category).filter(Boolean);
        const tags = recentProducts.flatMap(p => p.tags || []);

        // Find similar products
        recommendations.similar = await Product.find({
          $or: [
            { category: { $in: categories } },
            { tags: { $in: tags } }
          ],
          _id: { $nin: user.browsingHistory.map(h => h.productId) }
        }).limit(5);

        // Category-based recommendations
        recommendations.category = await Product.find({
          category: { $in: categories },
          _id: { $nin: user.browsingHistory.map(h => h.productId) }
        }).sort({ rating: -1 }).limit(3);
      }
    }

    // Popular products for new users
    recommendations.browsing = await Product.find()
      .sort({ reviewCount: -1 })
      .limit(5);

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get browsing history
app.get("/browsing-history", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'browsingHistory.productId',
      model: 'Product'
    });
    res.json(user.browsingHistory || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== SEARCH WITH FILTERS ==========
// Enhanced search with filters
app.get("/products/search", async (req, res) => {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      minRating,
      tags,
      sort = "-createdAt"
    } = req.query;

    let filter = {};

    // Text search
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } }
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    const products = await Product.find(filter)
      .sort(sort)
      .limit(50);

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available filters
app.get("/products/filters/options", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    const tags = await Product.distinct("tags");
    const priceRange = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      }
    ]);

    const ratings = [1, 2, 3, 4, 5];

    res.json({
      categories: categories.filter(Boolean),
      tags: tags.filter(Boolean),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 },
      ratings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ANALYTICS ENDPOINTS ==========
// Get sales analytics (admin only)
app.get("/admin/analytics/sales", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate, period = "day" } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {
        createdAt: {
          ...(startDate && { $gte: new Date(startDate) }),
          ...(endDate && { $lte: new Date(endDate) })
        }
      };
    } else {
      // Default: last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.createdAt = { $gte: thirtyDaysAgo };
    }

    const groupByFormat = {
      day: "%Y-%m-%d",
      week: "%Y-W%V",
      month: "%Y-%m"
    };

    const analytics = await Order.aggregate([
      { $match: { ...dateFilter, paymentStatus: "completed" } },
      {
        $group: {
          _id: { $dateToString: { format: groupByFormat[period], date: "$createdAt" } },
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer insights (admin only)
app.get("/admin/analytics/customers", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "user" });
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const repeatCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 }
        }
      },
      {
        $match: { orderCount: { $gt: 1 } }
      },
      {
        $count: "repeatCustomerCount"
      }
    ]);

    const avgOrderValue = totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0;

    res.json({
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      repeatCustomers: repeatCustomers[0]?.repeatCustomerCount || 0,
      repeatCustomerRate: totalCustomers > 0 ? ((repeatCustomers[0]?.repeatCustomerCount || 0) / totalCustomers * 100).toFixed(2) : 0,
      avgOrderValue: avgOrderValue.toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product performance (admin only)
app.get("/admin/analytics/products", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select("name stock price")
      .limit(10);

    res.json({
      topProducts,
      lowStockProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.io Connection Handlers
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // User joins a room for personalized notifications
  socket.on("user:join", (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their notification room`);
    }
  });

  // Get order tracking updates
  socket.on("order:getUpdates", async (orderId) => {
    try {
      const order = await Order.findById(orderId);
      if (order) {
        socket.emit("order:current", formatOrderForNotification(order));
      }
    } catch (err) {
      console.error("Error fetching order:", err);
    }
  });

  // Listen for order tracking requests
  socket.on("orders:subscribe", async (userId) => {
    try {
      socket.join(`user:${userId}`);
      const orders = await Order.find({ userId });
      socket.emit("orders:initial", orders.map(formatOrderForNotification));
    } catch (err) {
      console.error("Error subscribing to orders:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Delivery and payment routes
app.use("/api", paymentRoutes);

// Email OTP Routes
app.use("/api/otp", emailOTPRoutes);

// Authentication Routes with OTP
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

