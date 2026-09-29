const router = require("express").Router();
const Order = require("../models/Order");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    if (!products?.length) {
      return res.status(400).json({ message: "Order must contain products" });
    }

    const order = await Order.create({
      user: req.user.id,
      products,
      totalAmount
    });

    res.status(201).json(order);
  } catch {
    res.status(400).json({ message: "Unable to create order" });
  }
});

router.get("/my-orders", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate("products.product")
    .sort({ createdAt: -1 });

  res.json(orders);
});

module.exports = router;
