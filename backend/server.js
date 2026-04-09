
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const normalizeEmail = (email) => (email || "").trim().toLowerCase();

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  shippingAddress: {
    line1: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  cart: [
    {
      productId: String,
      name: String,
      price: Number,
      image: String,
      quantity: Number,
    }
  ],
  wishlist: [
    {
      productId: String,
      name: String,
      price: Number,
      image: String,
    }
  ],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String,
  stock: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId: String,
  items: Array,
  total: Number,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

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
    await mongoose.connect(process.env.MONGO_URI);
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
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (err) {
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
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
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
    const { name, email, shippingAddress } = req.body;
    const update = { name, shippingAddress };
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
    const customers = await User.find({ role: "user" }).select("name email shippingAddress createdAt").sort({ createdAt: -1 });
    res.json(customers);
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
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

