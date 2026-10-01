const router = require("express").Router();
const Product = require("../models/Product");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Older records may have been stored as `imageUrl`; always return a single `image` field.
const format = (doc) => {
  const p = doc.toObject();
  p.image = p.image || p.imageUrl || "images/placeholder.svg";
  delete p.imageUrl;
  return p;
};

const pick = (b) => {
  const out = {};
  for (const k of ["name", "description", "price", "category", "image", "stock"]) if (b[k] !== undefined) out[k] = b[k];
  return out;
};

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map(format));
  } catch {
    res.status(500).json({ message: "Unable to load products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(format(product));
  } catch {
    res.status(400).json({ message: "Invalid product ID" });
  }
});

// Admin only: create, update, delete
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    res.status(201).json(format(await Product.create(pick(req.body))));
  } catch (e) {
    res.status(400).json({ message: "Unable to create product. Check all fields." });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(format(product));
  } catch {
    res.status(400).json({ message: "Unable to update product. Check all fields." });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch {
    res.status(400).json({ message: "Invalid product ID" });
  }
});

module.exports = router;
