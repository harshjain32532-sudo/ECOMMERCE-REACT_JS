
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import multer from "multer";
import sharp from "sharp";
import { createServer } from "http";
import { Server } from "socket.io";
import { getOrderEmailTemplate, getStatusChangeMessage, formatOrderForNotification } from "./services/orderTrackingService.js";
import paymentRoutes from "./routes/payment.js";
import emailOTPRoutes from "./routes/emailOTP.js";
import authRoutes from "./routes/auth.js";
import notificationRoutes from "./routes/notification.js";
import User from "./models/user.js";
import ChatMessage from "./models/chat.js";
import { persistChatMessage, resolveChatTargetUserId } from "./services/chatRouting.js";

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
const createSlug = (value) => (value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

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
  originalPrice: Number,
  image: String,
  description: String,
  stock: { type: Number, default: 10 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  category: String,
  brand: { type: String, default: "Generic" },
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
  courierName: String,
  estimatedDelivery: Date,
  paymentMethod: { type: String, default: "card" },
  paymentStatus: { type: String, default: "pending", enum: ["pending", "completed", "failed"] },
  returnRequested: { type: Boolean, default: false },
  returnReason: String,
  returnCondition: String,
  refund: {
    status: { type: String, enum: ["none", "pending", "completed", "failed"], default: "none" },
    amount: { type: Number, default: 0 },
    method: String,
    expectedDate: Date,
  },
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

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const FeaturedProduct = mongoose.model("FeaturedProduct", featuredProductSchema);
const Coupon = mongoose.model("Coupon", couponSchema);
const Category = mongoose.model("Category", categorySchema);
const Brand = mongoose.model("Brand", brandSchema);

const RETURN_WINDOW_DAYS = parseInt(process.env.RETURN_WINDOW_DAYS || "14", 10);
const CANCELLABLE_STATUSES = ["pending", "confirmed", "processing"];

const parseOrderIdentifier = (text) => {
  if (!text) return null;
  const normalized = text.trim();
  const idMatch = normalized.match(/(?:order\s*id\s*#?|#)([a-fA-F0-9]{8,24})/i);
  if (idMatch) return idMatch[1];
  const suffixMatch = normalized.match(/\b([a-fA-F0-9]{8})\b/);
  return suffixMatch ? suffixMatch[1] : null;
};

const findOrderByIdentifier = async (identifier) => {
  if (!identifier) return null;
  if (/^[a-fA-F0-9]{24}$/.test(identifier)) {
    return await Order.findById(identifier).lean();
  }
  if (/^[a-fA-F0-9]{8}$/.test(identifier)) {
    return await Order.findOne({
      $expr: {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: `${identifier}$`,
          options: "i"
        }
      }
    }).lean();
  }
  return null;
};

const formatShippingAddress = (address = {}) => {
  if (!address || !address.line1) return "Not available";
  const parts = [address.line1, address.city, address.state, address.zip, address.country].filter(Boolean);
  return parts.join(", ");
};

const formatOrderStatusReply = (order) => {
  const shortId = order._id.toString().slice(-8).toUpperCase();
  let text = `Order ${shortId} is currently '${order.status}'. Payment status is '${order.paymentStatus}'.`;
  if (order.courierName) text += ` Courier: ${order.courierName}.`;
  if (order.trackingNumber) text += ` Tracking number: ${order.trackingNumber}.`;
  if (order.estimatedDelivery) text += ` Estimated delivery: ${new Date(order.estimatedDelivery).toDateString()}.`;
  const shipping = formatShippingAddress(order.shippingAddress);
  if (shipping !== "Not available") text += ` Shipping address: ${shipping}.`;
  if (order.refund && order.refund.status && order.refund.status !== "none") {
    text += ` Refund status: ${order.refund.status}`;
    if (order.refund.amount) text += ` for ₹${order.refund.amount}`;
    if (order.refund.method) text += ` via ${order.refund.method}`;
    if (order.refund.expectedDate) text += ` by ${new Date(order.refund.expectedDate).toDateString()}`;
    text += ".";
  }
  return text;
};

const isReturnEligible = (order) => {
  if (!order || order.status !== "delivered") return false;
  const deliveredAt = order.updatedAt || order.estimatedDelivery || order.createdAt;
  if (!deliveredAt) return false;
  const diff = Date.now() - new Date(deliveredAt).getTime();
  return diff <= RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
};

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

app.get("/admin/categories", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    const productCategories = await Product.distinct("category");
    const merged = [...new Set([...(categories || []).map((c) => c.name), ...(productCategories || []).filter(Boolean)])]
      .map((name) => ({ name, slug: createSlug(name) }));
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/categories", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "Category name required" });
    const category = await Category.create({ name, slug: createSlug(name) || createSlug(Date.now().toString()) });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/categories/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "Category name required" });
    const category = await Category.findByIdAndUpdate(req.params.id, { name, slug: createSlug(name) }, { new: true });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/admin/categories/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/brands", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 }).lean();
    const productBrands = await Product.distinct("brand");
    const merged = [...new Set([...(brands || []).map((b) => b.name), ...(productBrands || []).filter(Boolean)])]
      .map((name) => ({ name, slug: createSlug(name) }));
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/brands", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "Brand name required" });
    const brand = await Brand.create({ name, slug: createSlug(name) || createSlug(Date.now().toString()) });
    res.status(201).json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/brands/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "Brand name required" });
    const brand = await Brand.findByIdAndUpdate(req.params.id, { name, slug: createSlug(name) }, { new: true });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/admin/brands/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: "Brand deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/users/:id/role", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "Role required" });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/admin/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/coupons", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/coupons", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/coupons/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/admin/coupons/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/inventory", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const products = await Product.find().select("name stock price category brand createdAt").sort({ stock: 1 }).lean();
    res.json({
      summary: {
        totalProducts: products.length,
        lowStock: products.filter((product) => (product.stock || 0) <= 5).length,
        outOfStock: products.filter((product) => (product.stock || 0) === 0).length
      },
      products
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/inventory/:productId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const update = {};
    if (typeof req.body.stock === "number") update.stock = req.body.stock;
    if (typeof req.body.price === "number") update.price = req.body.price;
    const product = await Product.findByIdAndUpdate(req.params.productId, update, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
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

app.get("/admin/debug/chat", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "100", 10), 200);
    const messages = await ChatMessage.find({}).sort({ createdAt: -1 }).limit(limit).lean();

    const escapeHtml = (value) => String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");

    const rows = messages.map((message) => `
      <tr>
        <td>${escapeHtml(message.createdAt ? new Date(message.createdAt).toLocaleString() : "")}</td>
        <td>${escapeHtml(message.conversationId || "")}</td>
        <td>${escapeHtml(message.senderRole || "")}</td>
        <td>${escapeHtml(message.senderName || message.senderId || "")}</td>
        <td>${escapeHtml(message.recipientRole || "")}</td>
        <td>${escapeHtml(message.recipientName || message.recipientId || "")}</td>
        <td>${escapeHtml(message.text || "")}</td>
      </tr>
    `).join("");

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Chat Debug View</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; background: #f7f7f7; }
            table { width: 100%; border-collapse: collapse; background: white; }
            th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; } 
            th { background: #2f241c; color: white; }
            tr:nth-child(even) { background: #faf7f2; }
            .meta { color: #6b5846; font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>Saved chat entries</h2>
          <p class="meta">Showing the latest ${messages.length} entries from the database.</p>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Conversation</th>
                <th>Sender role</th>
                <th>Sender</th>
                <th>Recipient role</th>
                <th>Recipient</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>`;

    res.type("html").send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/debug/chat", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "100", 10), 200);
    const messages = await ChatMessage.find({}).sort({ createdAt: -1 }).limit(limit).lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

app.post("/orders/:id/cancel", verifyToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({ error: "Order cannot be cancelled at this stage" });
    }

    order.status = "cancelled";
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
      message: "Cancelled by customer via chat assistant"
    });
    order.paymentStatus = order.paymentStatus === "completed" ? "refunded" : order.paymentStatus;
    if (order.paymentStatus === "refunded") {
      order.refund = {
        status: "pending",
        amount: order.total || 0,
        method: order.paymentMethod,
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
    }
    await order.save();

    if (order.userEmail) {
      const emailTemplate = getOrderEmailTemplate("cancelled", order.toObject());
      if (emailTemplate) {
        await sendEmail(order.userEmail, emailTemplate.subject, emailTemplate.html);
      }
    }

    const notificationData = formatOrderForNotification(order.toObject());
    io.emit('order:updated', { orderId, userId: order.userId, oldStatus: "processing", newStatus: "cancelled", timestamp: new Date(), order: notificationData, message: "Order cancelled by customer" });
    io.to(`user:${order.userId}`).emit('user:order:updated', notificationData);

    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/orders/:id/return", verifyToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason, condition } = req.body;
    if (!reason || !condition) return res.status(400).json({ error: "Reason and condition are required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

    if (!isReturnEligible(order)) {
      return res.status(400).json({ error: "Order is not eligible for return" });
    }

    order.returnRequested = true;
    order.returnReason = reason;
    order.returnCondition = condition;
    order.refund = {
      status: "pending",
      amount: order.total || 0,
      method: order.paymentMethod,
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: "return_requested",
      timestamp: new Date(),
      message: "Return requested by customer"
    });
    await order.save();

    const notificationData = formatOrderForNotification(order.toObject());
    io.to(`user:${order.userId}`).emit('user:order:updated', notificationData);

    res.json({ message: "Return request submitted", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/orders/:id/refund", verifyToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

    res.json({ refund: order.refund || { status: "none", amount: 0 } });
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
      sort = "-createdAt",
      useOpenAI,
      voice = "false"
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

    const normalizedQuery = (query || "").trim();
    const aiHints = {
      voiceSearch: voice === "true",
      summary: normalizedQuery ? `Showing smart matches for "${normalizedQuery}".` : "Showing best matches for your request.",
      reviewSummary: products.length > 0 ? `Customers commonly rate these items highly, with an average sentiment of ${Math.min(5, 4.2 + products.length / 20).toFixed(1)}/5.` : "No products matched this request yet.",
    };

    res.json({ products, aiHints, insight: useOpenAI ? aiHints.summary : aiHints.summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== AI-POWERED ENDPOINTS ==========
// Simple AI recommendations based on browsing history, tags and popularity
app.get("/ai/recommendations", async (req, res) => {
  try {
    let user = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch (e) {
        user = null;
      }
    }

    const recommendations = { similar: [], browsing: [], trending: [] };

    if (user && user.browsingHistory && user.browsingHistory.length > 0) {
      const recent = user.browsingHistory.slice(0, 5).map(h => h.productId);
      const recentProducts = await Product.find({ _id: { $in: recent } });

      const categories = recentProducts.map(p => p.category).filter(Boolean);
      const tags = recentProducts.flatMap(p => p.tags || []);

      recommendations.similar = await Product.find({
        $or: [{ category: { $in: categories } }, { tags: { $in: tags } }],
        _id: { $nin: recent }
      }).limit(6);

      recommendations.browsing = await Product.find({ _id: { $nin: recent } }).sort({ reviewCount: -1 }).limit(6);
    } else {
      // Fallback: trending products
      recommendations.trending = await Product.find().sort({ reviewCount: -1 }).limit(6);
      recommendations.browsing = recommendations.trending;
    }

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Chatbot: lightweight rule-based assistant that can reference products
app.post("/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const tokens = (message || "").match(/\w+/g) || [];
    const q = tokens.join(" ");

    // Try to match products by name or tags
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: tokens.map(t => new RegExp(t, "i")) } }
      ]
    }).limit(5);

    if (products && products.length > 0) {
      const reply = {
        type: "products",
        text: `I found ${products.length} product(s) that may help.`,
        products: products.map(p => ({ id: p._id, name: p.name, price: p.price, image: p.image }))
      };
      return res.json(reply);
    }

    // Basic FAQ-style fallbacks
    const lower = (message || "").toLowerCase();
    if (lower.includes("return") || lower.includes("refund")) {
      return res.json({ type: "text", text: "Our return policy allows returns within 14 days of delivery. Would you like a link to the policy?" });
    }

    if (lower.includes("shipping") || lower.includes("delivery")) {
      return res.json({ type: "text", text: "Shipping times vary by location — standard delivery typically takes 3-7 business days." });
    }

    // Generic fallback
    res.json({ type: "text", text: "Sorry, I didn't understand that. Can you rephrase or ask about a product name?" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Chat via OpenAI (server-side proxy) - requires OPENAI_API_KEY in env
app.post("/ai/chat-openai", async (req, res) => {
  try {
    const { message, history } = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
    if (!OPENAI_API_KEY) return res.status(500).json({ error: "OpenAI API key not configured" });
    if (!message) return res.status(400).json({ error: "Message required" });

    const messages = Array.isArray(history) ? [...history] : [];
    messages.push({ role: "user", content: message });

    // Use fetch to call OpenAI
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: OPENAI_MODEL, messages, max_tokens: 600 })
    });

    const data = await r.json();
    // Return the raw response and a simplified answer
    const answer = data?.choices?.[0]?.message?.content || null;
    res.json({ raw: data, answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Order Tracking Assistant: provides order status, ETA, and summary
app.post('/ai/order-assistant', async (req, res) => {
  try {
    const { orderId, message } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });

    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Authorization: if token provided, ensure user owns the order or is admin
    let requesterId = null;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        requesterId = decoded.id;
        const requestUser = await User.findById(requesterId);
        if (requestUser && requestUser.role !== 'admin' && order.userId !== requesterId) {
          return res.status(403).json({ error: 'Forbidden: not owner of order' });
        }
      }
    } catch (e) {
      // ignore token errors; proceed with limited info if unauthenticated
    }

    const formatted = formatOrderForNotification(order);

    const lower = (message || '').toLowerCase();
    // Build reply
    let replyText = `Order ${order._id.toString().slice(-8).toUpperCase()} is currently '${order.status}'.`;
    if (order.estimatedDelivery) {
      replyText += ` Estimated delivery: ${new Date(order.estimatedDelivery).toDateString()}.`;
    }
    if (order.trackingNumber) {
      replyText += ` Tracking number: ${order.trackingNumber}.`;
    }

    if (lower.includes('items') || lower.includes('what') || lower.includes('contents')) {
      const itemsSummary = (order.items || []).map(it => `${it.name} x${it.quantity || 1}`).join(', ');
      replyText += ` Items: ${itemsSummary}.`;
    }

    if (lower.includes('where') || lower.includes('status') || lower.includes('update')) {
      // include status history
      const recent = (order.statusHistory || []).slice(-3).map(h => `${h.status} (${new Date(h.timestamp).toLocaleString()}): ${h.message || ''}`).join(' | ');
      if (recent) replyText += ` Recent updates: ${recent}.`;
    }

    if (lower.includes('cancel')) {
      if (['pending', 'confirmed', 'processing'].includes(order.status)) {
        replyText += ' This order is eligible for cancellation; please confirm if you want to cancel.';
      } else {
        replyText += ' This order cannot be cancelled at this stage.';
      }
    }

    // Return structured and plain-text reply
    res.json({ type: 'order', summary: replyText, order: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Return & Refund Assistant
app.post('/ai/return-assistant', async (req, res) => {
  try {
    const { orderId, message, action, useOpenAI = false } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });

    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Auth check: optional; for destructive actions require authenticated owner or admin
    let requesterId = null;
    let requestUser = null;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        requesterId = decoded.id;
        requestUser = await User.findById(requesterId);
      }
    } catch (e) {
      // ignore
    }

    const cancelEligible = ['pending', 'confirmed', 'processing'].includes(order.status);
    let returnEligible = false;
    const returnWindowDays = parseInt(process.env.RETURN_WINDOW_DAYS || '14', 10);
    if (order.status === 'delivered') {
      const deliveredAt = order.updatedAt || order.estimatedDelivery || order.createdAt;
      if (deliveredAt) {
        const diff = Date.now() - new Date(deliveredAt).getTime();
        returnEligible = diff <= returnWindowDays * 24 * 60 * 60 * 1000;
      }
    }

    const refundEstimate = order.total || (order.items || []).reduce((s, it) => s + ((it.price || 0) * (it.quantity || 1)), 0);

    // If OpenAI requested and configured, ask OpenAI for a natural-language reply summarizing options
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (useOpenAI && OPENAI_API_KEY && (message || action)) {
      const systemPrompt = `You are an assistant that helps customers with returns and refunds. Here is the order summary: ${JSON.stringify({ id: order._id, status: order.status, estimatedDelivery: order.estimatedDelivery, trackingNumber: order.trackingNumber, refundEstimate }, null, 2)}. Respond courteously and include clear next steps.`;
      const userPrompt = message || (action === 'confirm_cancel' ? 'Please cancel my order' : `I want to ${action}`);

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: 500 })
      });
      const data = await r.json();
      const answer = data?.choices?.[0]?.message?.content || null;
      return res.json({ type: 'openai', answer, metadata: { cancelEligible, returnEligible, refundEstimate } });
    }

    // Handle confirm_cancel action (perform cancellation)
    if (action === 'confirm_cancel') {
      if (!requesterId) return res.status(401).json({ error: 'Authentication required to cancel' });
      if (!requestUser) return res.status(401).json({ error: 'Invalid user' });
      if (requestUser.role !== 'admin' && order.userId !== requesterId) return res.status(403).json({ error: 'Forbidden: not owner of order' });

      if (!cancelEligible) return res.status(400).json({ error: 'Order is not eligible for cancellation' });

      const orderDoc = await Order.findById(orderId);
      orderDoc.status = 'cancelled';
      orderDoc.statusHistory = orderDoc.statusHistory || [];
      orderDoc.statusHistory.push({ status: 'cancelled', timestamp: Date.now(), message: 'Cancelled via AI Return Assistant' });
      orderDoc.updatedAt = Date.now();
      await orderDoc.save();

      // Emit notification
      io.emit('orderStatusUpdated', { orderId: orderDoc._id, status: orderDoc.status, message: 'Order cancelled' });
      io.to(`user:${orderDoc.userId}`).emit('user:order:updated', formatOrderForNotification(orderDoc));

      return res.json({ type: 'action', result: 'cancelled', summary: `Order ${orderDoc._id.toString().slice(-8).toUpperCase()} cancelled.` });
    }

    // Default: return eligibility info and guidance
    const guidance = [];
    if (cancelEligible) guidance.push('This order can be cancelled before shipping. To cancel, confirm cancellation in the assistant.');
    if (returnEligible) guidance.push(`This order is eligible for return within ${returnWindowDays} days. Start a return from your orders page.`);
    if (!cancelEligible && !returnEligible) guidance.push('This order is not eligible for cancellation or return automatically; contact support for exceptions.');

    const summary = `Order ${order._id.toString().slice(-8).toUpperCase()} status: ${order.status}. Refund estimate: ₹${Math.round(refundEstimate * 100) / 100}. ${guidance.join(' ')}`;

    res.json({ type: 'return', cancelEligible, returnEligible, refundEstimate, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI-powered smart search that scores results by relevance and popularity
app.get("/ai/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "Query parameter 'q' required" });

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } }
      ]
    }).limit(200);

    // Simple scoring: name match (3), tag match (2), description match (1), popularity bonus
    const scored = products.map(p => {
      let score = 0;
      const nameMatch = new RegExp(q, "i").test(p.name || "");
      const descMatch = new RegExp(q, "i").test(p.description || "");
      const tagMatch = (p.tags || []).some(t => new RegExp(q, "i").test(t));
      if (nameMatch) score += 3;
      if (tagMatch) score += 2;
      if (descMatch) score += 1;
      score += (p.reviewCount || 0) / 100; // small popularity boost
      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    res.json(scored.slice(0, 50).map(s => ({ ...s.product.toObject(), _aiScore: s.score })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Utility: simple Levenshtein distance
function levenshtein(a = "", b = "") {
  const al = a.length; const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const dp = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) dp[i][0] = i;
  for (let j = 0; j <= bl; j++) dp[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[al][bl];
}

// Advanced natural-language search with optional typo correction and OpenAI keyword extraction
app.get('/ai/search-advanced', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'q required' });
    const typo = req.query.typo === 'true' || req.query.typo === true;
    const useOpenAI = req.query.useOpenAI === 'true' || req.query.useOpenAI === true;

    let keywords = [];
    if (useOpenAI && process.env.OPENAI_API_KEY) {
      const prompt = `Extract search keywords from this user query and return a JSON array named keywords: ${q}`;
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], max_tokens: 150 })
      });
      const data = await r.json();
      const text = data?.choices?.[0]?.message?.content || '';
      try {
        const match = text.match(/\[.*\]/s);
        if (match) keywords = JSON.parse(match[0]);
      } catch (e) {
        keywords = (q.split(/\s+/).slice(0, 5));
      }
    } else {
      keywords = q.split(/\s+/).filter(Boolean).slice(0, 8);
    }

    // Build regex filter
    const regexes = keywords.map(k => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    const products = await Product.find({
      $or: [{ name: { $in: regexes } }, { description: { $in: regexes } }, { tags: { $in: keywords } }]
    }).limit(200);

    // Score results
    const scored = products.map(p => {
      let score = 0;
      const name = p.name || '';
      const desc = p.description || '';
      const nameMatches = regexes.some(r => r.test(name));
      const descMatches = regexes.some(r => r.test(desc));
      const tagMatches = (p.tags || []).some(t => keywords.some(k => new RegExp(k, 'i').test(t)));
      if (nameMatches) score += 3;
      if (tagMatches) score += 2;
      if (descMatches) score += 1;
      // typo correction: boost near matches by edit distance
      if (typo) {
        const dist = levenshtein(q.toLowerCase(), (name || '').toLowerCase());
        const norm = Math.max(0, 1 - (dist / Math.max(1, name.length)));
        score += norm * 2; // small boost
      }
      score += (p.reviewCount || 0) / 100;
      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    res.json(scored.slice(0, 50).map(s => ({ ...s.product.toObject(), _score: s.score })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Image search: upload an image and find visually similar products (basic perceptual hashing)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
async function imageToVector(buffer) {
  // resize to 32x32 grayscale and return Float32 normalized vector
  const img = await sharp(buffer).resize(32, 32, { fit: 'inside' }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = img; // data is Uint8
  const arr = new Float32Array(data.length);
  let sum = 0;
  for (let i = 0; i < data.length; i++) { arr[i] = data[i] / 255; sum += arr[i] * arr[i]; }
  const norm = Math.sqrt(sum) || 1;
  for (let i = 0; i < arr.length; i++) arr[i] = arr[i] / norm;
  return arr;
}

function cosineSim(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

app.post('/ai/image-search', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file required (field name: image)' });
    const queryVec = await imageToVector(req.file.buffer);

    // Load candidate products (limit to 200 to avoid long runs)
    const candidates = await Product.find({ image: { $exists: true, $ne: '' } }).limit(200).lean();

    const results = [];
    await Promise.all(candidates.map(async (p) => {
      try {
        // fetch image URL
        const r = await fetch(p.image, { timeout: 5000 });
        if (!r.ok) return;
        const buf = await r.arrayBuffer();
        const vec = await imageToVector(Buffer.from(buf));
        const sim = cosineSim(queryVec, vec);
        results.push({ product: p, similarity: sim });
      } catch (e) {
        // ignore per-product failures
      }
    }));

    results.sort((a, b) => b.similarity - a.similarity);
    res.json(results.slice(0, 10).map(r => ({ ...r.product, _similarity: Math.round(r.similarity * 10000) / 10000 })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sales prediction: simple moving-average forecast per product or overall
app.get("/ai/sales-predict", async (req, res) => {
  try {
    const { productId, days = 7, lookbackDays = 30 } = req.query;
    const daysNum = parseInt(days, 10) || 7;
    const lookback = parseInt(lookbackDays, 10) || 30;

    const since = new Date();
    since.setDate(since.getDate() - lookback);

    const match = { createdAt: { $gte: since }, paymentStatus: "completed" };
    if (productId) {
      match["items.productId"] = productId;
    }

    const orders = await Order.find(match).lean();

    // Aggregate daily sales
    const salesByDay = {};
    orders.forEach(order => {
      const day = new Date(order.createdAt).toISOString().slice(0, 10);
      let qty = 0;
      if (productId) {
        (order.items || []).forEach(it => { if ((it.productId || it._id || "").toString() === productId) qty += (it.quantity || 1); });
      } else {
        qty = (order.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
      }
      salesByDay[day] = (salesByDay[day] || 0) + qty;
    });

    const daysAvailable = Object.keys(salesByDay).length || 1;
    const total = Object.values(salesByDay).reduce((s, v) => s + v, 0);
    const avgPerDay = total / daysAvailable;

    // Forecast = avgPerDay for next N days
    const forecast = [];
    for (let i = 1; i <= daysNum; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      forecast.push({ date: d.toISOString().slice(0, 10), predictedUnits: Math.round(avgPerDay * 100) / 100 });
    }

    const projectedRevenue = forecast.reduce((sum, point) => sum + point.predictedUnits * 1000, 0);

    res.json({
      productId: productId || null,
      lookbackDays: lookback,
      avgPerDay: Math.round(avgPerDay * 100) / 100,
      projectedRevenue: Math.round(projectedRevenue * 100) / 100,
      confidence: avgPerDay > 0 ? "high" : "low",
      forecast
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI inventory forecasting: estimate demand and recommend reorders
app.get("/ai/inventory-forecast", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days || "30", 10) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const recentOrders = await Order.find({ createdAt: { $gte: since }, paymentStatus: "completed" }).lean();
    const salesByProduct = {};

    recentOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const id = (item.productId || item._id || "").toString();
        if (!id) return;
        salesByProduct[id] = (salesByProduct[id] || 0) + (item.quantity || 1);
      });
    });

    const products = await Product.find().lean();
    const forecast = products.map((product) => {
      const sold = salesByProduct[product._id.toString()] || 0;
      const avgDailyDemand = sold / Math.max(1, days);
      const recommendedStock = Math.max(10, Math.ceil(avgDailyDemand * 7 * 1.3));
      const reorderNeeded = (product.stock || 0) < recommendedStock;
      const confidence = sold > 0 ? "high" : "medium";
      return {
        productId: product._id,
        name: product.name,
        currentStock: product.stock || 0,
        predictedDemand: Math.round(avgDailyDemand * 100) / 100,
        recommendedStock,
        reorderNeeded,
        confidence
      };
    }).filter((item) => item.predictedDemand > 0 || item.reorderNeeded)
      .sort((a, b) => b.predictedDemand - a.predictedDemand)
      .slice(0, 10);

    res.json({
      days,
      summary: {
        productsAnalyzed: products.length,
        reordersNeeded: forecast.filter((item) => item.reorderNeeded).length
      },
      forecast
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI fraud detection: surface risky orders using purchase pattern heuristics
app.get("/ai/fraud-detection", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: "completed" }).sort({ createdAt: -1 }).lean();
    const orderCounts = await Order.aggregate([
      { $group: { _id: "$userId", orderCount: { $sum: 1 } } }
    ]);
    const countsByUser = Object.fromEntries(orderCounts.map((entry) => [entry._id?.toString() || "", entry.orderCount]));

    const totals = orders.map((order) => order.total || 0).sort((a, b) => a - b);
    const median = totals.length > 0 ? totals[Math.floor(totals.length / 2)] : 0;
    const average = totals.length > 0 ? totals.reduce((s, value) => s + value, 0) / totals.length : 0;

    const alerts = orders
      .map((order) => {
        const orderCount = countsByUser[order.userId?.toString() || ""] || 0;
        const highValue = (order.total || 0) > Math.max(average * 2.5, median * 3);
        const firstTimeBuyer = orderCount <= 1;
        const riskPoints = (highValue ? 45 : 0) + (firstTimeBuyer ? 25 : 0) + ((order.paymentMethod || "card") === "cod" ? 10 : 0);
        const riskScore = Math.min(100, riskPoints);
        return riskScore > 0 ? {
          orderId: order._id,
          customerId: order.userId || null,
          amount: order.total || 0,
          riskScore,
          reasons: [
            ...(highValue ? ["High-value order"] : []),
            ...(firstTimeBuyer ? ["First-time buyer"] : []),
            ...(order.paymentMethod === "cod" ? ["Cash-on-delivery order"] : [])
          ]
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    res.json({
      summary: {
        totalOrders: orders.length,
        suspiciousOrders: alerts.length,
        highestRisk: alerts[0] || null
      },
      alerts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI dynamic pricing: suggest price adjustments based on demand and stock
app.get("/ai/dynamic-pricing", async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const recentOrders = await Order.find({ createdAt: { $gte: since }, paymentStatus: "completed" }).lean();
    const salesByProduct = {};

    recentOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const id = (item.productId || item._id || "").toString();
        if (!id) return;
        salesByProduct[id] = (salesByProduct[id] || 0) + (item.quantity || 1);
      });
    });

    const products = await Product.find().lean();
    const suggestions = products.map((product) => {
      const sold = salesByProduct[product._id.toString()] || 0;
      const demandScore = sold + (product.reviewCount || 0) / 10;
      const stockRatio = (product.stock || 0) / Math.max(1, sold + 5);
      let adjustment = 0;
      let reason = "Balanced demand";

      if (demandScore > 10 && stockRatio < 0.6) {
        adjustment = 0.08;
        reason = "Demand is strong and stock is thin";
      } else if (demandScore < 4 && stockRatio > 1.2) {
        adjustment = -0.05;
        reason = "Demand is soft and inventory is high";
      }

      const recommendedPrice = Math.max(100, Math.round((product.price || 0) * (1 + adjustment) * 100) / 100);
      return {
        productId: product._id,
        name: product.name,
        currentPrice: product.price || 0,
        recommendedPrice,
        adjustmentPercent: Math.round(adjustment * 100),
        reason
      };
    }).filter((item) => item.adjustmentPercent !== 0)
      .sort((a, b) => Math.abs(b.adjustmentPercent) - Math.abs(a.adjustmentPercent))
      .slice(0, 10);

    res.json({
      summary: {
        productsAnalysed: products.length,
        priceActions: suggestions.length
      },
      suggestions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI customer behavior analysis: segment users based on purchase habits
app.get("/ai/customer-behavior", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: "completed" }).sort({ createdAt: 1 }).lean();
    const groups = {};

    orders.forEach((order) => {
      const key = (order.userId || "guest").toString();
      if (!groups[key]) {
        groups[key] = { userId: key, orderCount: 0, totalSpent: 0, lastOrderDate: null };
      }
      groups[key].orderCount += 1;
      groups[key].totalSpent += order.total || 0;
      groups[key].lastOrderDate = order.createdAt;
    });

    const segments = Object.values(groups).map((entry) => {
      const daysSinceLastOrder = entry.lastOrderDate ? Math.round((Date.now() - new Date(entry.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      let segment = "new";
      if (entry.orderCount > 1) segment = "repeat";
      if (entry.totalSpent > 10000) segment = "high-value";
      if (daysSinceLastOrder > 45 && entry.orderCount === 1) segment = "at-risk";
      return {
        userId: entry.userId,
        orderCount: entry.orderCount,
        totalSpent: Math.round(entry.totalSpent * 100) / 100,
        daysSinceLastOrder,
        segment
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    res.json({
      summary: {
        totalCustomers: segments.length,
        repeatCustomers: segments.filter((item) => item.segment === "repeat").length,
        highValueCustomers: segments.filter((item) => item.segment === "high-value").length,
        atRiskCustomers: segments.filter((item) => item.segment === "at-risk").length
      },
      segments: segments.slice(0, 12)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI smart product tags: generate relevant product tags from name/category/description
app.get("/ai/smart-tags", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const apply = req.query.apply === "true";
    const products = await Product.find().lean();
    const stopWords = ["the", "and", "for", "with", "new", "best", "buy", "from", "into", "your", "this", "that", "on", "of", "to", "at", "in", "an", "a", "is", "are", "our", "shop"];

    const suggestions = [];
    for (const product of products) {
      const text = `${product.name || ""} ${product.description || ""} ${product.category || ""}`.toLowerCase();
      const tokens = text.split(/[^a-z0-9]+/).filter(Boolean).filter((token) => token.length > 2 && !stopWords.includes(token));
      const uniqueTokens = [...new Set(tokens)].slice(0, 5);
      const tagCandidates = [...new Set([...(product.tags || []), ...uniqueTokens])];
      suggestions.push({
        productId: product._id,
        name: product.name,
        currentTags: product.tags || [],
        suggestedTags: tagCandidates.slice(0, 6)
      });
    }

    if (apply) {
      await Promise.all(suggestions.map((entry) => Product.updateOne({ _id: entry.productId }, { $set: { tags: entry.suggestedTags } })));
    }

    res.json({
      summary: {
        productsAnalyzed: suggestions.length,
        applied: apply
      },
      suggestions: suggestions.slice(0, 12)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI product description generator
app.post("/ai/product-description", async (req, res) => {
  try {
    const { productName, category, features = [] } = req.body;
    if (!productName) return res.status(400).json({ error: "productName is required" });

    const featureText = Array.isArray(features) && features.length > 0 ? features.join(", ") : "premium quality and dependable performance";
    const categoryText = category ? `for ${category}` : "for modern shoppers";
    const description = `${productName} is a thoughtfully designed ${categoryText} option that combines ${featureText}. It delivers a polished experience, dependable value, and a strong balance of style and practicality for everyday use.`;

    res.json({
      generatedDescription: description,
      summary: {
        productName,
        category: category || "general",
        featureCount: Array.isArray(features) ? features.length : 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI email recommendation system
app.post("/ai/email-recommendations", async (req, res) => {
  try {
    const { customerSegment = "repeat", products = [] } = req.body;
    const productNames = Array.isArray(products) && products.length > 0
      ? products.map((item) => item.name || item).join(", ")
      : "featured products";

    const segmentText = customerSegment === "new" ? "first-time shoppers" : customerSegment === "at-risk" ? "customers who have not engaged recently" : "loyal customers";
    const subject = `Recommended picks for ${segmentText}`;
    const body = `Hi there, we curated a special selection around ${productNames} to help you discover products you are likely to love. This email highlights top-performing items, limited-time value, and helpful next-step recommendations to keep your shopping experience easy and rewarding.`;

    res.json({
      subject,
      body,
      summary: {
        customerSegment,
        productCount: Array.isArray(products) ? products.length : 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI frequently bought together suggestions
app.post("/ai/frequently-bought-together", async (req, res) => {
  try {
    const { productId, products = [] } = req.body;
    const dataset = Array.isArray(products) && products.length > 0 ? products : [
      { name: "Wireless Headphones", category: "Audio" },
      { name: "Portable Charger", category: "Accessories" },
      { name: "Travel Case", category: "Accessories" }
    ];

    const suggestions = dataset.slice(0, 3).map((item, index) => ({
      productId: item.productId || `${productId || "product"}-${index + 1}`,
      name: item.name || `Suggested Add-On ${index + 1}`,
      category: item.category || "Accessories",
      reason: index === 0 ? "Commonly paired with this item" : "Helpful companion product"
    }));

    res.json({
      productId: productId || null,
      suggestions,
      summary: {
        suggestionCount: suggestions.length,
        primaryReason: "Customers often combine these items"
      }
    });
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

  socket.on("chat:join", (userId) => {
    if (userId) {
      socket.join(`chat:${userId}`);
      socket.join("seller-room");
      console.log(`Socket ${socket.id} joined chat room ${userId}`);
    }
  });

  socket.on("chat:history", async (userId, targetRole) => {
    try {
      if (!userId) return;
      const query = targetRole === "admin"
        ? { conversationId: { $regex: "^seller:" } }
        : { conversationId: `seller:${userId}` };

      const messages = await ChatMessage.find(query).sort({ createdAt: 1 }).lean();
      socket.emit("chat:history", messages);
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  });

  socket.on("chat:message", async (payload) => {
    try {
      if (!payload?.text?.trim()) return;

      const targetUserId = await resolveChatTargetUserId(payload, ChatMessage, parseOrderIdentifier, findOrderByIdentifier);

      const conversationId = payload.senderRole === "admin"
        ? `seller:${targetUserId || payload.senderId}`
        : `seller:${payload.senderId}`;

      const messageData = {
        conversationId,
        senderId: payload.senderId,
        senderName: payload.senderName || "User",
        senderRole: payload.senderRole || "user",
        recipientId: targetUserId || payload.recipientId || payload.senderId,
        recipientName: payload.recipientName || "Seller",
        recipientRole: payload.recipientRole || "admin",
        text: payload.text.trim(),
      };

      const formatted = await persistChatMessage(ChatMessage, messageData);

      socket.emit("chat:message:sent", formatted);
      if (payload.senderRole === "admin") {
        if (targetUserId) {
          socket.broadcast.to(`chat:${targetUserId}`).emit("chat:message", formatted);
        } else {
          socket.broadcast.to("seller-room").emit("chat:message", formatted);
        }
      } else if (payload.senderId) {
        socket.broadcast.to(`chat:${payload.senderId}`).emit("chat:message", formatted);
        socket.broadcast.to("seller-room").emit("chat:message", formatted);
      }

      // Simple AI bot reply for common order questions and order IDs
      if (payload.senderRole !== "admin") {
        const normalized = payload.text.trim().toLowerCase();
        const orderIdentifier = parseOrderIdentifier(payload.text);
        let order = null;
        if (orderIdentifier) {
          order = await findOrderByIdentifier(orderIdentifier);
        }

        const isOrderQuery = /\b(order|delivery|shipping|status|tracking|where is my order|cancel|return|refund)\b/.test(normalized);
        if (isOrderQuery) {
          let botText = "I can help with your order. Please share your order ID or check the Orders page for tracking updates.";

          if (order) {
            if (order.userId !== payload.senderId) {
              botText = "I found an order reference, but I can only access orders belonging to your account. Please verify your order ID.";
            } else {
              botText = formatOrderStatusReply(order);
              if (normalized.includes("cancel")) {
                botText += CANCELLABLE_STATUSES.includes(order.status)
                  ? " This order is eligible for cancellation if you confirm."
                  : " This order cannot be cancelled at this stage.";
              }
              if (normalized.includes("return") || normalized.includes("refund")) {
                const returnEligible = isReturnEligible(order);
                botText += returnEligible
                  ? " This order is eligible for a return within our return window."
                  : " This order is not eligible for return automatically right now.";
                if (order.refund && order.refund.status && order.refund.status !== "none") {
                  botText += ` Refund status: ${order.refund.status}.`;
                }
              }
            }
          } else if (normalized.includes("cancel")) {
            botText = "Order cancellation depends on the current status. Please share your exact order ID to check eligibility.";
          } else if (normalized.includes("return") || normalized.includes("refund")) {
            botText = "I can help with returns and refunds. Please share your order ID so I can verify eligibility and next steps.";
          }

          const botMessageData = {
            conversationId,
            senderId: mongoose.Types.ObjectId(),
            senderName: "OrderBot",
            senderRole: "admin",
            recipientId: payload.senderId,
            recipientName: payload.senderName || "Customer",
            recipientRole: "user",
            text: botText,
          };

          const botFormatted = await persistChatMessage(ChatMessage, botMessageData);

          socket.emit("chat:message:sent", botFormatted);
          socket.broadcast.to(`chat:${payload.senderId}`).emit("chat:message", botFormatted);
        }
      }
    } catch (err) {
      console.error("Error saving chat message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Delivery and payment routes
app.use("/api", paymentRoutes);

// Notification routes
app.use("/api", notificationRoutes);

// Email OTP Routes
app.use("/api/otp", emailOTPRoutes);

// Authentication Routes with OTP
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

