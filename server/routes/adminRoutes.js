const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Every route in this file is for the admin only.
router.use(protect, adminOnly);

const adminEmail = () => (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const statuses = () => Order.schema.path("status").enumValues;

// Dashboard overview numbers
router.get("/stats", async (req, res) => {
  try {
    const [products, orders, customers] = await Promise.all([
      Product.find().lean(),
      Order.find().sort({ createdAt: -1 }).populate("user", "name email").lean(),
      User.countDocuments({ email: { $ne: adminEmail() } })
    ]);

    const byStatus = Object.fromEntries(statuses().map((s) => [s, 0]));
    let revenue = 0;
    orders.forEach((o) => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; revenue += o.totalAmount; });

    // Sales for the last 7 days (oldest -> newest)
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      last7.push({ date: key, total: +orders.filter((o) => new Date(o.createdAt).toISOString().slice(0, 10) === key).reduce((s, o) => s + o.totalAmount, 0).toFixed(2) });
    }

    res.json({
      totals: { products: products.length, orders: orders.length, customers, revenue: +revenue.toFixed(2) },
      byStatus,
      last7,
      recentOrders: orders.slice(0, 5).map((o) => ({ _id: o._id, customer: o.user?.name || "Deleted user", totalAmount: o.totalAmount, status: o.status, createdAt: o.createdAt })),
      lowStock: products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 6).map((p) => ({ _id: p._id, name: p.name, stock: p.stock, image: p.image || p.imageUrl }))
    });
  } catch {
    res.status(500).json({ message: "Unable to load dashboard" });
  }
});

// All orders from all customers
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email").populate("products.product", "name").lean();
    res.json({
      statuses: statuses(),
      orders: orders.map((o) => ({
        _id: o._id, createdAt: o.createdAt, status: o.status, totalAmount: o.totalAmount,
        customer: o.user ? { name: o.user.name, email: o.user.email } : null,
        items: o.products.map((l) => ({ name: l.product?.name || "Removed product", quantity: l.quantity }))
      }))
    });
  } catch {
    res.status(500).json({ message: "Unable to load orders" });
  }
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    if (!statuses().includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ _id: order._id, status: order.status });
  } catch {
    res.status(400).json({ message: "Unable to update order" });
  }
});

// Registered customers with their order totals
router.get("/users", async (req, res) => {
  try {
    const [users, totals] = await Promise.all([
      User.find({ email: { $ne: adminEmail() } }).select("name email createdAt").sort({ createdAt: -1 }).lean(),
      Order.aggregate([{ $group: { _id: "$user", orders: { $sum: 1 }, spent: { $sum: "$totalAmount" } } }])
    ]);
    const map = Object.fromEntries(totals.map((t) => [String(t._id), t]));
    res.json(users.map((u) => ({ ...u, orders: map[String(u._id)]?.orders || 0, spent: +(map[String(u._id)]?.spent || 0).toFixed(2) })));
  } catch {
    res.status(500).json({ message: "Unable to load customers" });
  }
});

module.exports = router;
