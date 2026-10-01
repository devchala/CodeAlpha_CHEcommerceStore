const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product"); // use the real model so field names always match

const products = [
  { name: "Wireless Noise-Canceling Headphones", description: "Immersive sound with active noise cancellation and 30-hour battery life.", price: 120.0, category: "Electronics", image: "images/headphones.svg", stock: 25 },
  { name: "Minimalist Mechanical Keyboard", description: "Tactile switches, RGB backlighting and a compact desktop layout.", price: 85.5, category: "Electronics", image: "images/keyboard.svg", stock: 40 },
  { name: "Ergonomic Office Chair", description: "Breathable mesh back with adjustable height and armrests.", price: 199.99, category: "Furniture", image: "images/chair.svg", stock: 12 },
  { name: "Smart Fitness Watch", description: "Heart rate, sleep tracking and workout modes in a slim design.", price: 65.0, category: "Wearables", image: "images/watch.svg", stock: 30 },
  { name: "Khaki Chino Pants", description: "Classic slim-fit chinos in soft stretch cotton for everyday wear.", price: 39.99, category: "Fashion", image: "images/khaki.jpg", stock: 50 },
  { name: "Laptop Backpack", description: "Durable, water-resistant backpack with a padded laptop compartment.", price: 44.99, category: "Accessories", image: "images/backpack.svg", stock: 35 },
  { name: "Adjustable Desk Lamp", description: "Warm-to-cool LED light with touch dimming and USB charging port.", price: 29.9, category: "Furniture", image: "images/lamp.svg", stock: 45 }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products.`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err.message);
    process.exit(1);
  }
})();
