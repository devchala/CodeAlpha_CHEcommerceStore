const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");

const fallbackProducts = [
  { _id: "demo1", name: "Wireless Headphones", description: "Comfortable headphones with immersive sound.", price: 59.99, category: "Audio", stock: 12, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
  { _id: "demo2", name: "Smart Watch", description: "Minimal smartwatch for everyday productivity.", price: 89.99, category: "Wearables", stock: 8, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" },
  { _id: "demo3", name: "Laptop Backpack", description: "Durable backpack with a dedicated laptop section.", price: 44.99, category: "Accessories", stock: 20, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80" },
  { _id: "demo4", name: "Mechanical Keyboard", description: "Compact keyboard designed for developers.", price: 74.99, category: "Workspace", stock: 15, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80" }
];

let products = [];

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    products = response.ok ? await response.json() : fallbackProducts;
  } catch {
    products = fallbackProducts;
  }
  renderProducts(products);
}

function renderProducts(items) {
  productGrid.innerHTML = items.map(product => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <small>${product.category}</small>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">$${Number(product.price).toFixed(2)}</div>
        <button class="btn" onclick='addToCart(${JSON.stringify(product)})'>Add to cart</button>
      </div>
    </article>
  `).join("");
}

function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find(item => item._id === product._id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = JSON.parse(localStorage.getItem("cart") || "[]")
    .reduce((sum, item) => sum + item.quantity, 0);
  const element = document.getElementById("cartCount");
  if (element) element.textContent = count;
}

searchInput?.addEventListener("input", event => {
  const query = event.target.value.toLowerCase();
  renderProducts(products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  ));
});

updateCartCount();
loadProducts();
