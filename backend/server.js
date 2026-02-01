// ===============================
// Load environment variables
// ===============================
require("dotenv").config();

// ===============================
// Imports
// ===============================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// App initialization
// ===============================
const app = express();
app.use(cors());
app.use(express.json());
// ===============================
// Health Check Route
// ===============================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "expense-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
// ===============================
// MongoDB Connection (SECURED)
// ===============================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not defined in .env");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected securely"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ===============================
// Schemas & Models
// ===============================

// User
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// Expense
const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);

// Subscription
const subscriptionSchema = new mongoose.Schema(
  {
    serviceName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    renewalDate: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

// ===============================
// Auth Middleware
// ===============================
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Token missing" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ===============================
// Auth Routes
// ===============================

// Signup
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed });

    res.json({ message: "Signup successful" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// Expense Routes
// ===============================
app.get("/expenses", authMiddleware, async (req, res) => {
  const expenses = await Expense.find({ userId: req.userId });
  res.json(expenses);
});

app.post("/expenses", authMiddleware, async (req, res) => {
  const expense = await Expense.create({
    title: req.body.title,
    amount: req.body.amount,
    userId: req.userId
  });
  res.json(expense);
});

app.delete("/expenses/:id", authMiddleware, async (req, res) => {
  await Expense.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });
  res.json({ message: "Expense deleted" });
});

// ===============================
// Subscription Routes
// ===============================
app.get("/subscriptions", authMiddleware, async (req, res) => {
  const subs = await Subscription.find({ userId: req.userId });
  res.json(subs);
});

app.post("/subscriptions", authMiddleware, async (req, res) => {
  const sub = await Subscription.create({
    serviceName: req.body.serviceName,
    amount: req.body.amount,
    renewalDate: req.body.renewalDate,
    userId: req.userId
  });
  res.json(sub);
});

app.delete("/subscriptions/:id", authMiddleware, async (req, res) => {
  await Subscription.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });
  res.json({ message: "Subscription deleted" });
});


// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
