const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryBar = document.getElementById("categories");
let products = [];
let activeCategory = "All";

async function loadProducts() {
  grid.innerHTML = `<p class="state">Loading products…</p>`;
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error();
    products = await res.json();
  } catch {
    grid.innerHTML = `<p class="state">Could not load products. Make sure the server and database are running.</p>`;
    return;
  }
  renderCategories();
  render();
}

function renderCategories() {
  const cats = ["All", ...new Set(products.map((p) => p.category))];
  categoryBar.innerHTML = cats.map((c) => `<button class="chip ${c === activeCategory ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const items = products.filter((p) =>
    (activeCategory === "All" || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));

  if (!items.length) { grid.innerHTML = `<p class="state">No products found.</p>`; return; }

  grid.innerHTML = items.map((p) => `
    <article class="product-card">
      <div class="img-wrap"><a href="product.html?id=${esc(p._id)}"><img src="${esc(imgSrc(p.image))}" alt="${esc(p.name)}" loading="lazy"></a>
        ${p.stock < 1 ? `<span class="badge out">Sold out</span>` : p.stock <= 5 ? `<span class="badge">Only ${p.stock} left</span>` : ""}</div>
      <div class="product-info">
        <small>${esc(p.category)}</small>
        <h3><a href="product.html?id=${esc(p._id)}">${esc(p.name)}</a></h3>
        <p>${esc(p.description)}</p>
        <div class="price">${money(p.price)}</div>
        <button class="btn" data-add="${esc(p._id)}" ${p.stock < 1 ? "disabled" : ""}>${p.stock < 1 ? "Sold out" : "Add to cart"}</button>
      </div>
    </article>`).join("");
}

grid.addEventListener("click", (e) => {
  const id = e.target.dataset.add;
  if (!id) return;
  if (!requireCustomer()) return;
  const p = products.find((x) => x._id === id);
  const cart = getCart();
  const line = cart.find((i) => i._id === id);
  if (line) { if (line.quantity >= p.stock) return toast("No more stock available"); line.quantity++; }
  else cart.push({ _id: p._id, name: p.name, price: p.price, image: p.image, stock: p.stock, quantity: 1 });
  saveCart(cart);
  toast(`${p.name} added to cart`);
});

categoryBar.addEventListener("click", (e) => {
  if (!e.target.dataset.cat) return;
  activeCategory = e.target.dataset.cat;
  renderCategories(); render();
});
searchInput.addEventListener("input", render);

loadProducts();
