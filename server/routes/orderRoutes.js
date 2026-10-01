const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, async (req, res) => {
  if (req.user.role === "admin") return res.status(403).json({ message: "Admin accounts cannot place orders" });
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || !products.length) {
      return res.status(400).json({ message: "Order must contain products" });
    }

    // Never trust the client's total: recalculate from database prices and check stock.
    let totalAmount = 0;
    const lines = [];
    for (const item of products) {
      const qty = Number(item.quantity);
      const product = await Product.findById(item.product);
      if (!product || !Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: "Invalid item in order" });
      }
      if (product.stock < qty) {
        return res.status(400).json({ message: `Only ${product.stock} left of "${product.name}"` });
      }
      totalAmount += product.price * qty;
      lines.push({ product: product._id, quantity: qty });
    }

    for (const l of lines) await Product.updateOne({ _id: l.product }, { $inc: { stock: -l.quantity } });
    const order = await Order.create({ user: req.user.id, products: lines, totalAmount: +totalAmount.toFixed(2) });
    res.status(201).json(order);
  } catch {
    res.status(400).json({ message: "Unable to create order" });
  }
});

router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products.product").sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Unable to load orders" });
  }
});

module.exports = router;
